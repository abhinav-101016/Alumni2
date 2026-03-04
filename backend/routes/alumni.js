import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =======================================================
   GET ALUMNI DIRECTORY (admin-verified only)
======================================================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const {
      passingYear,
      bloodGroup,
      hostel,
      skills,
      company,
      location,
      page,
      limit,
    } = req.query;

    const query = { role: "alumni" }; // only alumni

    // Apply filters if provided
    if (passingYear) query["academic.passingYear"] = Number(passingYear);
    if (bloodGroup) query["profile.bloodGroup"] = bloodGroup;
    if (hostel) query["academic.hostel"] = hostel;
    if (company) query["professional.experiences.company"] = { $regex: company, $options: "i" };
    if (location) query["profile.location.city"] = { $regex: location, $options: "i" };
    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      query["professional.skills"] = { $in: skillsArray };
    }

    // Pagination
    const currentPage = parseInt(page) || 1;
    const perPage = parseInt(limit) || 10;

    const total = await User.countDocuments(query);
    const alumni = await User.find(query)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort({ "academic.passingYear": -1 });

    res.json({ total, page: currentPage, perPage, alumni });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;