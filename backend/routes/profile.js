import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.put(
  "/complete",
  authMiddleware,
  [
    body("bio").trim().isLength({ min: 20 }).withMessage("Bio must be at least 20 characters"),
    body("profilePicUrl").notEmpty().withMessage("Profile picture is required for alumni"),
    body("experience").isArray({ min: 1 }).withMessage("At least one experience is required"),
    body("experience.*.companyName").trim().notEmpty().withMessage("Company name is required"),
    body("experience.*.position").trim().notEmpty().withMessage("Position is required"),
    body("experience.*.startDate").notEmpty().isISO8601().withMessage("Valid start date required"),
    body("experience.*.currentlyWorking").toBoolean().isBoolean(),
    body("experience").custom((experiences) => {
      for (const exp of experiences) {
        if (!exp.currentlyWorking && (!exp.endDate || exp.endDate === "")) {
          throw new Error("End date is required if not currently working");
        }
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      if (req.user.role !== "alumni") {
        return res.status(403).json({ message: "Only alumni can complete profile" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
      }

      const { bio, experience, skills, linkedin, twitter, github, portfolio, profilePicUrl } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Initialize nested structures
      if (!user.profile) user.profile = {};
      if (!user.professional) user.professional = {};
      if (!user.profile.socialLinks) user.profile.socialLinks = {};

      // Update Profile Fields
      user.profile.bio = bio;
      user.profile.profilePicUrl = profilePicUrl; // Stores the Cloudinary Secure URL
      user.profile.socialLinks.linkedin = linkedin || "";
      user.profile.socialLinks.twitter = twitter || "";
      user.profile.socialLinks.github = github || "";
      user.profile.socialLinks.portfolio = portfolio || "";

      // Update Professional Fields
      user.professional.experiences = experience.map((exp) => ({
        company: exp.companyName,
        designation: exp.position,
        startDate: new Date(exp.startDate),
        endDate: exp.currentlyWorking ? null : (exp.endDate ? new Date(exp.endDate) : null),
        isCurrent: exp.currentlyWorking,
      }));

      user.professional.skills = Array.isArray(skills) ? skills : [];

      // Set flags
      user.isProfileComplete = true;

      // Mark nested paths as modified
      user.markModified('profile');
      user.markModified('professional');

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
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;