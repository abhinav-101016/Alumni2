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
    .trim()
    .isLength({ min: 20 })
    .withMessage("Bio must be at least 20 characters"),

  body("experience")
    .isArray({ min: 1 })
    .withMessage("At least one experience is required"),

  body("experience.*.companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required"),

  body("experience.*.position")
    .trim()
    .notEmpty()
    .withMessage("Position is required"),

  body("experience.*.startDate")
    .notEmpty()
    .withMessage("Start date required")
    .isISO8601()
    .withMessage("Start date must be valid"),

  body("experience.*.currentlyWorking")
    .isBoolean()
    .withMessage("currentlyWorking must be boolean"),

  body("experience").custom((experiences) => {
    for (const exp of experiences) {
      if (!exp.currentlyWorking && !exp.endDate) {
        throw new Error(
          "End date is required if not currently working"
        );
      }
    }
    return true;
  }),
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

      

      user.profile.socialLinks.linkedin = linkedin || "";
      user.profile.socialLinks.twitter = twitter || "";
      user.profile.socialLinks.github = github || "";
      user.profile.socialLinks.portfolio = portfolio || "";

      /* =====================================================
         UPDATE PROFESSIONAL BLOCK
      ===================================================== */

      user.professional.experiences = experience.map((exp) => {
        const isCurrent = exp.currentlyWorking;

        return {
          company: exp.companyName,
          designation: exp.position,
          startDate: new Date(exp.startDate),

          // ✅ SAFE END DATE HANDLING
          endDate: isCurrent
            ? null
            : exp.endDate
            ? new Date(exp.endDate)
            : null,

          isCurrent: isCurrent,
          description: exp.description || "",
        };
      });

      user.professional.skills = Array.isArray(skills)
        ? skills
        : [];

      /* =====================================================
         PROFILE COMPLETION FLAG
      ===================================================== */

      user.isProfileComplete =
        !!user.profile.bio &&
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