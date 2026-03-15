import Room from "../models/Room.js";
import Message from "../models/Message.js";
import Connection from "../models/Connection.js";
import mongoose from "mongoose";
import redis from "../utils/redis.js";

// ─────────────────────────────────────────────
// Redis key helpers
// ─────────────────────────────────────────────
const KEYS = {
  roomMessages: (roomId) => `room:${roomId}:msgs`,          // list of recent messages
  connCheck:    (a, b)    => `conn:${[a, b].sort().join(":")}`, // connection check cache
  roomMembers:  (roomId) => `room:${roomId}:members`,        // set of member ids
};

const ROOM_MSG_CACHE_SIZE = 50;   // how many messages to keep in Redis per room
const ROOM_MSG_TTL        = 3600; // 1 hour
const CONN_CHECK_TTL      = 300;  // 5 minutes

// ─────────────────────────────────────────────
// Helper: check if two users are connected (Redis-cached)
// ─────────────────────────────────────────────
async function areConnectedCached(userAId, userBId) {
  const key = KEYS.connCheck(userAId.toString(), userBId.toString());

  try {
    const cached = await redis.get(key);
    if (cached !== null) return cached === "1";
  } catch (_) { /* Redis miss — fall through to DB */ }

  const connection = await Connection.findOne({
    $or: [
      { sender: userAId, receiver: userBId, status: "accepted" },
      { sender: userBId, receiver: userAId, status: "accepted" },
    ],
  }).lean();

  const result = !!connection;
  try {
    await redis.setex(key, CONN_CHECK_TTL, result ? "1" : "0");
  } catch (_) { /* non-fatal */ }

  return result;
}

// ─────────────────────────────────────────────
// Helper: build deterministic DM key
// ─────────────────────────────────────────────
function buildDmKey(idA, idB) {
  const sorted = [idA.toString(), idB.toString()].sort();
  return `dm_${sorted[0]}_${sorted[1]}`;
}

// ─────────────────────────────────────────────
// Helper: verify membership (Redis-cached set)
// ─────────────────────────────────────────────
async function isMemberCached(roomId, userId) {
  const key = KEYS.roomMembers(roomId.toString());
  try {
    const exists = await redis.sismember(key, userId.toString());
    if (exists !== null) return exists === 1;
  } catch (_) { /* fall through */ }

  const room = await Room.findById(roomId).select("members").lean();
  if (!room) return false;
  const result = room.members.some((m) => m.toString() === userId.toString());

  // Warm the cache
  try {
    if (room.members.length > 0) {
      await redis.sadd(key, ...room.members.map(String));
      await redis.expire(key, 3600);
    }
  } catch (_) { /* non-fatal */ }

  return result;
}

// ─────────────────────────────────────────────
// Helper: push a message into the Redis room cache
// ─────────────────────────────────────────────
async function cacheMessage(roomId, messageObj) {
  try {
    const key = KEYS.roomMessages(roomId.toString());
    await redis.lpush(key, JSON.stringify(messageObj));
    await redis.ltrim(key, 0, ROOM_MSG_CACHE_SIZE - 1);
    await redis.expire(key, ROOM_MSG_TTL);
  } catch (_) { /* non-fatal */ }
}

// ─────────────────────────────────────────────
// Helper: invalidate connection cache (call when connection is removed/blocked)
// Export so connectionController can call it
// ─────────────────────────────────────────────
export async function invalidateConnectionCache(userAId, userBId) {
  try {
    await redis.del(KEYS.connCheck(userAId.toString(), userBId.toString()));
  } catch (_) { /* non-fatal */ }
}

// ═════════════════════════════════════════════
// CONTROLLERS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// GET /api/chat/rooms
// Returns all rooms the logged-in user belongs to
// ─────────────────────────────────────────────
export async function getMyRooms(req, res) {
  try {
    const userId = req.user.id;

    const rooms = await Room.find({ members: userId })
      .populate("members", "name profile.profilePicUrl role")
      .populate("lastMessage.sender", "name")
      .sort({ "lastMessage.sentAt": -1 })
      .lean();

    const formatted = rooms.map((room) => {
      if (room.type === "dm") {
        const other = room.members.find(
          (m) => m._id.toString() !== userId.toString()
        );
        return { ...room, otherUser: other };
      }
      return room;
    });

    res.json({ success: true, rooms: formatted });
  } catch (err) {
    console.error("getMyRooms error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ─────────────────────────────────────────────
// POST /api/chat/rooms/dm
// Create or fetch a DM room between two connected users
// Body: { receiverId }
// ─────────────────────────────────────────────
export async function getOrCreateDmRoom(req, res) {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "receiverId is required" });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot DM yourself" });
    }

    const connected = await areConnectedCached(senderId, receiverId);
    if (!connected) {
      return res.status(403).json({
        success: false,
        message: "You can only DM users you are connected with",
      });
    }

    const dmKey = buildDmKey(senderId, receiverId);

    let room = await Room.findOne({ dmKey })
      .populate("members", "name profile.profilePicUrl role")
      .lean();

    if (!room) {
      const newRoom = await Room.create({
        type: "dm",
        dmKey,
        isPublic: false,
        members: [senderId, receiverId],
        createdBy: senderId,
      });
      room = await Room.findById(newRoom._id)
        .populate("members", "name profile.profilePicUrl role")
        .lean();

      // Warm member cache for the new room
      try {
        await redis.sadd(KEYS.roomMembers(newRoom._id.toString()), senderId.toString(), receiverId.toString());
        await redis.expire(KEYS.roomMembers(newRoom._id.toString()), 3600);
      } catch (_) { /* non-fatal */ }
    }

    const otherUser = room.members.find(
      (m) => m._id.toString() !== senderId.toString()
    );

    res.json({ success: true, room: { ...room, otherUser } });
  } catch (err) {
    console.error("getOrCreateDmRoom error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ─────────────────────────────────────────────
// GET /api/chat/rooms/community
// List all public community rooms
// ─────────────────────────────────────────────
export async function getCommunityRooms(req, res) {
  try {
    const rooms = await Room.find({ type: "community", isPublic: true })
      .populate("createdBy", "name")
      .select("-members")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, rooms });
  } catch (err) {
    console.error("getCommunityRooms error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ─────────────────────────────────────────────
// POST /api/chat/rooms/community
// Create a new community room
// Body: { name, description, avatarUrl? }
// ─────────────────────────────────────────────
export async function createCommunityRoom(req, res) {
  try {
    const { name, description, avatarUrl } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Room name is required" });
    }

    const room = await Room.create({
      type: "community",
      name: name.trim(),
      description: description?.trim(),
      avatarUrl,
      isPublic: true,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    // Warm member cache
    try {
      await redis.sadd(KEYS.roomMembers(room._id.toString()), req.user.id.toString());
      await redis.expire(KEYS.roomMembers(room._id.toString()), 3600);
    } catch (_) { /* non-fatal */ }

    res.status(201).json({ success: true, room });
  } catch (err) {
    console.error("createCommunityRoom error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ─────────────────────────────────────────────
// POST /api/chat/rooms/:roomId/join
// Join a public community room
// ─────────────────────────────────────────────
export async function joinCommunityRoom(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (room.type !== "community") {
      return res.status(403).json({ success: false, message: "Only community rooms can be joined" });
    }

    const alreadyMember = room.members.some((m) => m.toString() === userId.toString());
    if (!alreadyMember) {
      room.members.push(userId);
      await room.save();

      // Update member cache
      try {
        await redis.sadd(KEYS.roomMembers(roomId), userId.toString());
      } catch (_) { /* non-fatal */ }
    }

    res.json({ success: true, message: "Joined room successfully" });
  } catch (err) {
    console.error("joinCommunityRoom error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ─────────────────────────────────────────────
// POST /api/chat/rooms/:roomId/leave
// Leave a community room
// ─────────────────────────────────────────────
export async function leaveCommunityRoom(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    await Room.findByIdAndUpdate(roomId, { $pull: { members: userId } });

    // Remove from member cache
    try {
      await redis.srem(KEYS.roomMembers(roomId), userId.toString());
    } catch (_) { /* non-fatal */ }

    res.json({ success: true, message: "Left room" });
  } catch (err) {
    console.error("leaveCommunityRoom error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ─────────────────────────────────────────────
// GET /api/chat/rooms/:roomId/messages
// Paginated message history — Redis first, MongoDB fallback
// Query: ?page=1&limit=30
// ─────────────────────────────────────────────
export async function getMessages(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 30;

    // Auth: verify membership
    const member = await isMemberCached(roomId, userId);
    if (!member) {
      return res.status(403).json({ success: false, message: "You are not a member of this room" });
    }

    // ── Page 1: try Redis cache first ──────────────────────────────
    if (page === 1) {
      try {
        const cached = await redis.lrange(KEYS.roomMessages(roomId), 0, limit - 1);
        if (cached.length >= Math.min(limit, 1)) {
          const messages = cached.map((m) => JSON.parse(m)).reverse();
          return res.json({
            success: true,
            messages,
            fromCache: true,
            pagination: { page: 1, limit, hasMore: cached.length === ROOM_MSG_CACHE_SIZE },
          });
        }
      } catch (_) { /* Redis miss — fall through to MongoDB */ }
    }

    // ── MongoDB fallback with aggregation ($lookup instead of populate) ──
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.aggregate([
        { $match: { roomId: new mongoose.Types.ObjectId(roomId), isDeleted: false } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            pipeline: [
              { $project: { name: 1, "profile.profilePicUrl": 1, role: 1 } },
            ],
            as: "sender",
          },
        },
        { $unwind: "$sender" },
        {
          $lookup: {
            from: "users",
            localField: "readBy.user",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1 } }],
            as: "readByUsers",
          },
        },
        { $sort: { createdAt: 1 } }, // back to chronological
      ]),
      Message.countDocuments({ roomId, isDeleted: false }),
    ]);

    // Warm Redis cache if this is page 1
    if (page === 1 && messages.length > 0) {
      try {
        const key = KEYS.roomMessages(roomId);
        const pipeline = redis.pipeline();
        // Store in reverse order (newest first) for lpush/lrange pattern
        [...messages].reverse().forEach((m) => pipeline.lpush(key, JSON.stringify(m)));
        pipeline.ltrim(key, 0, ROOM_MSG_CACHE_SIZE - 1);
        pipeline.expire(key, ROOM_MSG_TTL);
        await pipeline.exec();
      } catch (_) { /* non-fatal */ }
    }

    res.json({
      success: true,
      messages,
      fromCache: false,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ─────────────────────────────────────────────
// PUT /api/chat/rooms/:roomId/messages/read
// Mark all unread messages in a room as read by current user
// ─────────────────────────────────────────────
export async function markRoomAsRead(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      {
        roomId,
        "readBy.user": { $ne: userId },
        sender: { $ne: userId },
        isDeleted: false,
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } },
      }
    );

    // Invalidate room message cache so next load reflects read state
    try {
      await redis.del(KEYS.roomMessages(roomId));
    } catch (_) { /* non-fatal */ }

    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    console.error("markRoomAsRead error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ─────────────────────────────────────────────
// GET /api/chat/unread-count
// Total unread message count across all rooms
// ─────────────────────────────────────────────
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;

    const rooms = await Room.find({ members: userId }).select("_id").lean();
    const roomIds = rooms.map((r) => r._id);

    const unreadCount = await Message.countDocuments({
      roomId: { $in: roomIds },
      sender: { $ne: userId },
      "readBy.user": { $ne: userId },
      isDeleted: false,
    });

    res.json({ success: true, unreadCount });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Export cache helpers for use in socketHandlers
export { areConnectedCached, isMemberCached, cacheMessage, KEYS };
