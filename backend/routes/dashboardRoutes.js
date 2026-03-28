import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

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
      const [totalUsers, newRegistrations, pendingVerifications, activeUsers, suspendedUsers] =
        await Promise.all([
          User.countDocuments({ role: { $in: ["student", "alumni"] } }),
          User.countDocuments({
            role: { $in: ["student", "alumni"] },
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          }),
          User.countDocuments({
            role: { $in: ["student", "alumni"] },
            accountStatus: "pending",
          }),
          User.countDocuments({
            role: { $in: ["student", "alumni"] },
            accountStatus: "active",
          }),
          User.countDocuments({
            role: { $in: ["student", "alumni"] },
            accountStatus: "suspended",
          }),
        ]);

      // Recent registrations (last 5)
      const recentUsers = await User.find({ role: { $in: ["student", "alumni"] } })
        .select("-auth")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const admin = await User.findById(userId).select("-auth").lean();

      return res.json({
        success: true,
        role: "admin",
        data: {
          admin: { name: admin.name, email: admin.email },
          stats: {
            totalUsers,
            newRegistrations,   // last 7 days
            pendingVerifications,
            activeUsers,
            suspendedUsers,
          },
          recentUsers,
        },
      });
    }

    /* ── STUDENT / ALUMNI dashboard ──────────────── */
    const user = await User.findById(userId).select("-auth").lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Placeholder connection counts — swap with real Connection model queries when ready
    const connectionsCount        = 0;  // TODO: Connection.countDocuments({ userId, status: "accepted" })
    const connectionRequestsCount = 0;  // TODO: Connection.countDocuments({ to: userId, status: "pending" })

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