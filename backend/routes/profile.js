import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   COMPLETE PROFILE (ALUMNI ONLY)
===================================================== */

router.put(
  "/complete",
  authMiddleware,

  [
    body("bio")
      .isLength({ min: 20 })
      .withMessage("Bio must be at least 20 characters"),

    body("experience")
      .isArray({ min: 1 })
      .withMessage("At least one experience is required"),

    body("experience.*.companyName")
      .notEmpty()
      .withMessage("Company name is required"),

    body("experience.*.position")
      .notEmpty()
      .withMessage("Position is required"),

    body("experience.*.startDate")
      .isISO8601()
      .withMessage("Start date must be valid date"),

    body("experience.*.currentlyWorking")
      .isBoolean()
      .withMessage("currentlyWorking must be boolean"),
  ],

  async (req, res) => {
    try {
      /* ---------- ROLE CHECK ---------- */
      if (req.user.role !== "alumni") {
        return res
          .status(403)
          .json({ message: "Only alumni can complete profile" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        bio,
        experience,
        skills,
        location,
        linkedin,
        twitter,
        github,
        portfolio,
      } = req.body;

      /* ---------- FIND USER ---------- */
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      /* =====================================================
         ENSURE NESTED OBJECTS EXIST
      ===================================================== */

      if (!user.profile) user.profile = {};
      if (!user.professional) user.professional = {};
      if (!user.profile.socialLinks) user.profile.socialLinks = {};

      /* =====================================================
         UPDATE PROFILE BLOCK
      ===================================================== */

      user.profile.bio = bio;

      user.profile.location = location || {};

      /* ---------- SOCIAL LINKS ---------- */
      user.profile.socialLinks.linkedin = linkedin || "";
      user.profile.socialLinks.twitter = twitter || "";
      user.profile.socialLinks.github = github || "";
      user.profile.socialLinks.portfolio = portfolio || "";

      /* =====================================================
         UPDATE PROFESSIONAL BLOCK
      ===================================================== */

      user.professional.experiences = experience.map((exp) => ({
        company: exp.companyName,
        designation: exp.position,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        isCurrent: exp.currentlyWorking,
        description: exp.description || "",
      }));

      user.professional.skills = skills || [];

      /* =====================================================
         PROFILE COMPLETION FLAG
      ===================================================== */

      user.isProfileComplete =
        user.profile.bio &&
        user.professional.experiences &&
        user.professional.experiences.length > 0;

      /* ---------- SAVE ---------- */
      await user.save();

      const safeUser = user.toObject();
      delete safeUser.auth;

      res.json({
        message: "Profile completed successfully",
        profileComplete: user.isProfileComplete,
        user: safeUser,
      });
    } catch (error) {
      console.error("Complete profile error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;