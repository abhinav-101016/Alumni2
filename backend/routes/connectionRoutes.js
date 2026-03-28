import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getMyConnections,
  getReceivedRequests,
  getSentRequests,
  getConnectionStatus,
} from "../controllers/connectionController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware,authorizeRoles("alumni", "student"));

// ── Send / Cancel ──────────────────────────────
router.post("/send/:receiverId", sendConnectionRequest);
router.delete("/cancel/:receiverId", cancelConnectionRequest);

// ── Accept / Reject (by connectionId) ─────────
router.put("/accept/:connectionId", acceptConnectionRequest);
router.put("/reject/:connectionId", rejectConnectionRequest);

// ── Remove accepted connection ─────────────────
router.delete("/remove/:userId", removeConnection);

// ── Fetch ──────────────────────────────────────
router.get("/", getMyConnections);                        // my accepted connections
router.get("/requests/received", getReceivedRequests);    // pending requests I received
router.get("/requests/sent", getSentRequests);            // pending requests I sent
router.get("/status/:userId", getConnectionStatus);       // status with a specific user

export default router;
