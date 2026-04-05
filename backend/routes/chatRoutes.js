/*import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  getMyRooms,
  getOrCreateDmRoom,
  getCommunityRooms,
  createCommunityRoom,
  joinCommunityRoom,
  leaveCommunityRoom,
  getMessages,
  markRoomAsRead,
  getUnreadCount,
} from "../controllers/chatController.js";

const router = express.Router();

// All chat routes require authentication — your existing JWT middleware
router.use(authMiddleware,authorizeRoles("alumni", "student"));

// ── Room routes ───────────────────────────────────────────────────
router.get("/rooms",                    getMyRooms);           // My rooms (DM + community)
router.post("/rooms/dm",               getOrCreateDmRoom);    // Open or create a DM
router.get("/rooms/community",         getCommunityRooms);    // Browse public rooms
router.post("/rooms/community",        createCommunityRoom);  // Create a community room
router.post("/rooms/:roomId/join",     joinCommunityRoom);    // Join a community room
router.post("/rooms/:roomId/leave",    leaveCommunityRoom);   // Leave a community room

// ── Message routes ────────────────────────────────────────────────
router.get("/rooms/:roomId/messages",       getMessages);     // Paginated history
router.put("/rooms/:roomId/messages/read",  markRoomAsRead);  // Mark as read

// ── Misc ──────────────────────────────────────────────────────────
router.get("/unread-count", getUnreadCount);                  // Nav badge count

export default router;
*/
