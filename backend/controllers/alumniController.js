import User from "../models/User.js";

export const getAlumniDirectory = async (req, res) => {
  try {
    const { search, bloodGroup, passingYear, company } = req.query;

    // Base query: Only verified alumni
    let query = { 
      role: "alumni",
      "verification.isVerifiedByAdmin": true,
      accountStatus: "active" 
    };

    // Only add to query object if the value actually exists
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "professional.skills": { $regex: search, $options: "i" } }
      ];
    }

    if (bloodGroup) query["profile.bloodGroup"] = bloodGroup;
    if (passingYear) query["academic.passingYear"] = Number(passingYear);
    if (company && company.trim() !== "") {
      query["professional.experiences.company"] = { $regex: company, $options: "i" };
    }

    const alumni = await User.find(query)
      .select("-auth -verification.otp")
      .sort({ "academic.passingYear": -1 });

    res.status(200).json({
      success: true,
      currentUserId: req.user.id, // Attached by your authMiddleware
      data: alumni,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};