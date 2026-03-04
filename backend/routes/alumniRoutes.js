import express from "express";
import { getAlumniDirectory } from "../controllers/alumniController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// The route is protected: Only logged-in & admin-verified users enter
router.get("/directory", authMiddleware, getAlumniDirectory);

export default router;