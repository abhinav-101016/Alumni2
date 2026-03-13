import Connection from "../models/Connection.js";
import User from "../models/User.js";

// ─────────────────────────────────────────
// SEND CONNECTION REQUEST
// POST /api/connections/send/:receiverId
// ─────────────────────────────────────────
export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;
    const { message } = req.body;

    // Can't connect to yourself
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "You can't connect with yourself" });
    }

    // Check receiver exists and is active
    const receiver = await User.findOne({
      _id: receiverId,
      accountStatus: "active",
      "verification.isVerifiedByAdmin": true,
    });

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a connection already exists in either direction
    const existing = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      const messages = {
        pending: "Connection request already sent",
        accepted: "You are already connected",
        rejected: "Connection request was rejected",
      };
      return res.status(409).json({ message: messages[existing.status] });
    }

    const connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      message: message || "",
    });

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      data: connection,
    });
  } catch (error) {
    console.error("sendConnectionRequest error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─────────────────────────────────────────
// ACCEPT CONNECTION REQUEST
// PUT /api/connections/accept/:connectionId
// ─────────────────────────────────────────
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findOne({
      _id: connectionId,
      receiver: userId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connection.status = "accepted";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection accepted",
      data: connection,
    });
  } catch (error) {
    console.error("acceptConnectionRequest error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─────────────────────────────────────────
// REJECT CONNECTION REQUEST
// PUT /api/connections/reject/:connectionId
// ─────────────────────────────────────────
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findOne({
      _id: connectionId,
      receiver: userId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connection.status = "rejected";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection rejected",
    });
  } catch (error) {
    console.error("rejectConnectionRequest error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─────────────────────────────────────────
// CANCEL SENT REQUEST
// DELETE /api/connections/cancel/:receiverId
// ─────────────────────────────────────────
export const cancelConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    const connection = await Connection.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({ message: "No pending request found" });
    }

    res.status(200).json({
      success: true,
      message: "Connection request cancelled",
    });
  } catch (error) {
    console.error("cancelConnectionRequest error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─────────────────────────────────────────
// REMOVE / DISCONNECT
// DELETE /api/connections/remove/:userId
// ─────────────────────────────────────────
export const removeConnection = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    const connection = await Connection.findOneAndDelete({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
      status: "accepted",
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    res.status(200).json({
      success: true,
      message: "Connection removed",
    });
  } catch (error) {
    console.error("removeConnection error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─────────────────────────────────────────
// GET MY CONNECTIONS (accepted)
// GET /api/connections
// ─────────────────────────────────────────
export const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    })
      .populate("sender", "name profile.profilePicUrl role academic.branch academic.passingYear professional.experiences")
      .populate("receiver", "name profile.profilePicUrl role academic.branch academic.passingYear professional.experiences")
      .sort({ updatedAt: -1 });

    // Return the "other" person in each connection
    const formatted = connections.map((conn) => {
      const other =
        conn.sender._id.toString() === userId.toString()
          ? conn.receiver
          : conn.sender;
      return {
        connectionId: conn._id,
        connectedAt: conn.updatedAt,
        user: other,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("getMyConnections error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─────────────────────────────────────────
// GET PENDING REQUESTS (received by me)
// GET /api/connections/requests/received
// ─────────────────────────────────────────
export const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "name profile.profilePicUrl role academic.branch academic.passingYear professional.experiences")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("getReceivedRequests error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─────────────────────────────────────────
// GET SENT REQUESTS
// GET /api/connections/requests/sent
// ─────────────────────────────────────────
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.find({
      sender: userId,
      status: "pending",
    })
      .populate("receiver", "name profile.profilePicUrl role academic.branch academic.passingYear")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("getSentRequests error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET CONNECTION STATUS WITH A SPECIFIC USER
// GET /api/connections/status/:userId
// Returns: none | pending_sent | pending_received | accepted
// ─────────────────────────────────────────────────────────
export const getConnectionStatus = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    const connection = await Connection.findOne({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    });

    if (!connection) {
      return res.status(200).json({ status: "none", connectionId: null });
    }

    let status = connection.status;

    // Differentiate pending direction
    if (status === "pending") {
      status =
        connection.sender.toString() === myId.toString()
          ? "pending_sent"
          : "pending_received";
    }

    res.status(200).json({
      success: true,
      status,
      connectionId: connection._id,
    });
  } catch (error) {
    console.error("getConnectionStatus error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
