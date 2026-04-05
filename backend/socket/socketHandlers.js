/*import Room from "../models/Room.js";
import Message from "../models/Message.js";
import redis from "../utils/redis.js";
import mongoose from "mongoose";
import {
  areConnectedCached,
  isMemberCached,
  cacheMessage,
  KEYS,
} from "../controllers/chatController.js";

// ─────────────────────────────────────────────
// Online presence store
// userId (string) → Set<socketId>
// ─────────────────────────────────────────────
const onlineUsers = new Map();

function setOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
}

// Returns true if this was the user's last socket (fully offline now)
function setOffline(userId, socketId) {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return true;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  return false;
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId.toString());
}

// ─────────────────────────────────────────────
// Per-socket typing debounce timers
// socketId → Map<roomId, timeoutId>
// ─────────────────────────────────────────────
const typingTimers = new Map();

function clearTypingTimer(socketId, roomId) {
  const timers = typingTimers.get(socketId);
  if (timers?.has(roomId)) {
    clearTimeout(timers.get(roomId));
    timers.delete(roomId);
  }
}

function setTypingTimer(socketId, roomId, cb, delay = 4000) {
  if (!typingTimers.has(socketId)) typingTimers.set(socketId, new Map());
  clearTypingTimer(socketId, roomId);
  const id = setTimeout(cb, delay);
  typingTimers.get(socketId).set(roomId, id);
}

// ─────────────────────────────────────────────
// Main handler — one call per connected socket
// ─────────────────────────────────────────────
export default function registerSocketHandlers(io, socket) {
  const userId   = socket.user.id;
  const userName = socket.user.name;

  console.log(`[Socket] + ${userName} (${userId}) socket=${socket.id}`);

  // ── 1. Mark online + auto-join all user rooms ────────────────────
  setOnline(userId, socket.id);

  // Join all rooms in one query, warm cache in background
  Room.find({ members: userId })
    .select("_id members")
    .lean()
    .then((rooms) => {
      rooms.forEach((r) => {
        socket.join(r._id.toString());
        // Warm member cache silently
        try {
          const key = KEYS.roomMembers(r._id.toString());
          redis.sadd(key, ...r.members.map(String)).catch(() => {});
          redis.expire(key, 3600).catch(() => {});
        } catch (_) {}
      });
    });

  // Announce online to everyone (frontend filters to relevant users)
  io.emit("user:online", { userId });

  // ── 2. Send message ──────────────────────────────────────────────
  // Payload: { roomId, content, type?, tempId? }
  // tempId is set by the frontend for optimistic UI reconciliation
  socket.on("message:send", async (payload, ack) => {
    try {
      const { roomId, content, type = "text", tempId } = payload || {};

      if (!roomId || !content?.trim()) {
        return ack?.({ success: false, error: "roomId and content are required" });
      }

      // Membership check (Redis-cached)
      const member = await isMemberCached(roomId, userId);
      if (!member) {
        return ack?.({ success: false, error: "You are not a member of this room" });
      }

      // DM rooms: enforce connection requirement (Redis-cached)
      const room = await Room.findById(roomId).select("type members").lean();
      if (!room) return ack?.({ success: false, error: "Room not found" });

      if (room.type === "dm") {
        const otherId = room.members.find((m) => m.toString() !== userId)?.toString();
        const connected = await areConnectedCached(userId, otherId);
        if (!connected) {
          return ack?.({ success: false, error: "You are not connected with this user" });
        }
      }

      // ── Save to MongoDB ──────────────────────────────────────────
      const message = await Message.create({
        roomId,
        sender: userId,
        content: content.trim(),
        type,
        readBy: [{ user: userId, readAt: new Date() }],
      });

      // ── Populate sender via aggregation (1 query, not N+1) ───────
      const [populated] = await Message.aggregate([
        { $match: { _id: message._id } },
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1, "profile.profilePicUrl": 1, role: 1 } }],
            as: "sender",
          },
        },
        { $unwind: "$sender" },
      ]);

      // ── Update room lastMessage (fire-and-forget, non-blocking) ──
      Room.findByIdAndUpdate(roomId, {
        lastMessage: {
          content: type === "text" || type === "emoji" ? content.trim() : `[${type}]`,
          sender: userId,
          type,
          sentAt: new Date(),
        },
      }).catch((e) => console.error("[Socket] lastMessage update failed:", e));

      // ── Push to Redis cache (fire-and-forget) ────────────────────
      cacheMessage(roomId, populated);

      // ── Broadcast to room ────────────────────────────────────────
      // Include tempId so the sender's frontend can reconcile the optimistic message
      io.to(roomId).emit("message:new", { ...populated, tempId: tempId || null });

      ack?.({ success: true, messageId: message._id });
    } catch (err) {
      console.error("[Socket] message:send error:", err);
      ack?.({ success: false, error: "Failed to send message" });
    }
  });

  // ── 3. Typing indicators (server-side debounce guard) ────────────
  // Frontend should also debounce, but we guard server-side too.
  // Payload: { roomId }
  socket.on("typing:start", async ({ roomId }) => {
    if (!roomId) return;

    const member = await isMemberCached(roomId, userId);
    if (!member) return;

    // Broadcast typing:start to others
    socket.to(roomId).emit("typing:start", {
      roomId,
      userId,
      userName,
      avatarUrl: socket.user.avatarUrl,
    });

    // Auto-emit typing:stop after 4s if client doesn't send it
    // (handles browser crash, tab close mid-type)
    setTypingTimer(socket.id, roomId, () => {
      socket.to(roomId).emit("typing:stop", { roomId, userId });
    });
  });

  socket.on("typing:stop", ({ roomId }) => {
    if (!roomId) return;
    clearTypingTimer(socket.id, roomId);
    socket.to(roomId).emit("typing:stop", { roomId, userId });
  });

  // ── 4. Read receipts ─────────────────────────────────────────────
  // Payload: { roomId, messageIds? }
  socket.on("message:read", async ({ roomId, messageIds }) => {
    try {
      if (!roomId) return;

      const filter = messageIds?.length
        ? { _id: { $in: messageIds }, roomId }
        : { roomId };

      // Batch update in MongoDB
      await Message.updateMany(
        {
          ...filter,
          "readBy.user": { $ne: userId },
          sender: { $ne: userId },
          isDeleted: false,
        },
        { $push: { readBy: { user: userId, readAt: new Date() } } }
      );

      // Invalidate message cache so next REST fetch reflects read state
      try { await redis.del(KEYS.roomMessages(roomId)); } catch (_) {}

      // Notify others in room (sender sees ✓✓)
      socket.to(roomId).emit("message:read", { roomId, readBy: userId });
    } catch (err) {
      console.error("[Socket] message:read error:", err);
    }
  });

  // ── 5. Delete a message ──────────────────────────────────────────
  // Payload: { messageId, roomId }
  socket.on("message:delete", async ({ messageId, roomId }, ack) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return ack?.({ success: false, error: "Message not found" });

      if (msg.sender.toString() !== userId) {
        return ack?.({ success: false, error: "Not authorized" });
      }

      msg.isDeleted = true;
      msg.content   = "This message was deleted";
      await msg.save();

      // Invalidate room message cache
      try { await redis.del(KEYS.roomMessages(roomId)); } catch (_) {}

      io.to(roomId).emit("message:deleted", { messageId, roomId });
      ack?.({ success: true });
    } catch (err) {
      console.error("[Socket] message:delete error:", err);
      ack?.({ success: false, error: "Failed to delete" });
    }
  });

  // ── 6. Emoji reaction ────────────────────────────────────────────
  // Payload: { messageId, roomId, emoji }
  socket.on("message:react", async ({ messageId, roomId, emoji }) => {
    if (!messageId || !roomId || !emoji) return;

    const member = await isMemberCached(roomId, userId);
    if (!member) return;

    io.to(roomId).emit("message:react", {
      messageId,
      roomId,
      emoji,
      userId,
      userName,
    });
  });

  // ── 7. Join a room after browsing ────────────────────────────────
  // Payload: { roomId }
  socket.on("room:join", async ({ roomId }, ack) => {
    try {
      const room = await Room.findById(roomId).select("type isPublic members").lean();
      if (!room) return ack?.({ success: false, error: "Room not found" });

      const alreadyMember = room.members.some((m) => m.toString() === userId);

      if (!alreadyMember) {
        if (!room.isPublic) {
          return ack?.({ success: false, error: "This room is private" });
        }
        await Room.findByIdAndUpdate(roomId, { $push: { members: userId } });

        // Update member cache
        try { await redis.sadd(KEYS.roomMembers(roomId), userId); } catch (_) {}
      }

      socket.join(roomId);
      ack?.({ success: true });
    } catch (err) {
      console.error("[Socket] room:join error:", err);
      ack?.({ success: false, error: "Failed to join room" });
    }
  });

  // ── 8. Check online status of a list of users ────────────────────
  // Payload: { userIds: [...] }
  socket.on("users:online-status", ({ userIds }) => {
    if (!Array.isArray(userIds)) return;
    const statuses = {};
    userIds.forEach((id) => { statuses[id] = isUserOnline(id); });
    socket.emit("users:online-status", statuses);
  });

  // ── 9. Disconnect ────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(`[Socket] - ${userName} reason=${reason}`);

    // Clear all pending typing timers for this socket
    if (typingTimers.has(socket.id)) {
      typingTimers.get(socket.id).forEach((timerId) => clearTimeout(timerId));
      typingTimers.delete(socket.id);
    }

    const fullyOffline = setOffline(userId, socket.id);
    if (fullyOffline) {
      io.emit("user:offline", { userId });
    }
  });
}
  */
