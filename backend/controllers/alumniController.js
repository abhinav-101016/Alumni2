// alumniController.js
import User from "../models/User.js";

export const getAlumniDirectory = async (req, res) => {
  try {
    const { search, bloodGroup, passingYear, company, position, city, country, branch } = req.query;

    // Base query: only active, admin-verified alumni
    let query = {
      role: "alumni",
      "verification.isVerifiedByAdmin": true,
      accountStatus: "active",
    };

    // ---------------------------
    // SEARCH BY NAME, SKILLS, COMPANY, POSITION
    // ---------------------------
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "professional.skills": { $regex: search, $options: "i" } },
        { "professional.experiences": { $elemMatch: { company: { $regex: search, $options: "i" } } } },
        { "professional.experiences": { $elemMatch: { designation: { $regex: search, $options: "i" } } } },
      ];
    }

    // ---------------------------
    // INDIVIDUAL FILTERS
    // ---------------------------
    if (bloodGroup) query["profile.bloodGroup"] = bloodGroup;
    if (passingYear) query["academic.passingYear"] = Number(passingYear);
    if (branch) query["academic.branch"] = { $regex: branch, $options: "i" };
    if (city) query["profile.location.city"] = { $regex: city, $options: "i" };
    if (country) query["profile.location.country"] = { $regex: country, $options: "i" };

    // Handle company + position together inside experiences
    if (company || position) {
      query["professional.experiences"] = {
        $elemMatch: {
          ...(company && { company: { $regex: company, $options: "i" } }),
          ...(position && { designation: { $regex: position, $options: "i" } }),
        },
      };
    }

    // Debugging: log final query
    console.log("Alumni Directory Query:", JSON.stringify(query, null, 2));

    // Fetch alumni
    const alumni = await User.find(query)
      .select("-auth -verification.otp") // remove sensitive fields
      .sort({ "academic.passingYear": -1 });

    res.status(200).json({
      success: true,
      currentUserId: req.user?.id || null, // safe fallback
      data: alumni,
    });
  } catch (error) {
    console.error("Error fetching alumni:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};