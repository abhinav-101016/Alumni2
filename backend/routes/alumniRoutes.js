import express from "express";
import { getAlumniDirectory, getStudentDirectory } from "../controllers/alumniController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

// ── Accessible to all logged-in & admin-verified users ───────────────────────
router.get("/directory", authMiddleware, getAlumniDirectory);

// ── Accessible only to alumni and admin ──────────────────────────────────────
router.get("/students", authMiddleware, authorizeRoles("alumni", "admin"), getStudentDirectory);

export default router;