// 📁 src/routes/dashboardRoutes.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Connection from "../models/Connection.js";

const router = express.Router();

/* =====================================================
   GET DASHBOARD DATA
   GET /api/dashboard
   Protected: all authenticated roles
===================================================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role   = req.user.role;

    /* ── ADMIN dashboard ─────────────────────────── */
    if (role === "admin") {
      const [totalAdmins, admin] = await Promise.all([
        User.countDocuments({ role: "admin" }),
        User.findById(userId).select("-auth").lean(),
      ]);

      return res.json({
        success: true,
        role: "admin",
        data: {
          admin: { _id: admin._id, name: admin.name, email: admin.email },
          stats: { totalAdmins },
        },
      });
    }

    /* ── STUDENT / ALUMNI dashboard ──────────────── */
    const user = await User.findById(userId).select("-auth").lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [connectionsCount, connectionRequestsCount] = await Promise.all([
      Connection.countDocuments({
        $or: [{ from: userId }, { to: userId }],
        status: "accepted",
      }),
      Connection.countDocuments({
        to: userId,
        status: "pending",
      }),
    ]);

    return res.json({
      success: true,
      role,
      data: {
        user,
        stats: {
          connectionsCount,
          connectionRequestsCount,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;