import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendAccountSuspendedEmail
} from "../utils/email.js";

const router = express.Router();

/* =====================================================
   GET ALL USERS (pending + all for admin view)
   GET /api/admin/users?status=pending&role=student&search=
===================================================== */
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { status, role, search } = req.query;

      const query = {};

      // Filter by accountStatus (e.g. "pending", "active", "rejected")
      if (status) query.accountStatus = status;

      // Filter by role (student / alumni)
      if (role && role !== "admin") query.role = role;
      else query.role = { $in: ["student", "alumni"] }; // never return other admins

      // Search by name, email, or rollNumber
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { "academic.rollNumber": { $regex: search, $options: "i" } },
        ];
      }

      const users = await User.find(query)
        .select("-auth")
        .sort({ createdAt: -1 })
        .lean();

      res.json({ success: true, count: users.length, data: users });
    } catch (error) {
      console.error("Admin get users error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =====================================================
   VERIFY USER (mark isVerifiedByAdmin = true, status = active)
   PATCH /api/admin/users/:id/verify
===================================================== */
router.patch(
  "/users/:id/verify",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      if (user.role === "admin") {
        return res.status(400).json({
          success: false,
          message: "Cannot modify another admin"
        });
      }

      // ✅ Ensure verification object exists
      if (!user.verification) {
        user.verification = {};
      }

      // ✅ Update fields properly
      user.verification.isVerifiedByAdmin = true;
      user.accountStatus = "active";

      await user.save();
      sendAccountApprovedEmail(user.email, user.name)
  .catch(err => console.error("Email failed:", err));

      // ✅ Send clean updated user
      const updatedUser = await User.findById(user._id)
        .select("-auth")
        .lean();

      res.json({
        success: true,
        message: "User verified successfully",
        data: updatedUser
      });

    } catch (error) {
      console.error("Admin verify user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);

/* =====================================================
   REJECT USER (mark isVerifiedByAdmin = false, status = rejected)
   PATCH /api/admin/users/:id/reject
===================================================== */
router.patch(
  "/users/:id/reject",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(400).json({ success: false, message: "Cannot modify another admin" });
      }

      user.verification.isVerifiedByAdmin = false;
      user.accountStatus = "rejected";
      await user.save();
      sendAccountRejectedEmail(user.email, user.name)
  .catch(err => console.error("Email failed:", err));

      const safeUser = user.toObject();
      delete safeUser.auth;

      res.json({ success: true, message: "User rejected", data: safeUser });
    } catch (error) {
      console.error("Admin reject user error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* =====================================================
   SUSPEND USER
   PATCH /api/admin/users/:id/suspend
===================================================== */
router.patch(
  "/users/:id/suspend",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(400).json({ success: false, message: "Cannot modify another admin" });
      }

      user.accountStatus = "suspended";
      await user.save();
      sendAccountSuspendedEmail(user.email, user.name)
  .catch(err => console.error("Email failed:", err));

      const safeUser = user.toObject();
      delete safeUser.auth;

      res.json({ success: true, message: "User suspended", data: safeUser });
    } catch (error) {
      console.error("Admin suspend user error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;