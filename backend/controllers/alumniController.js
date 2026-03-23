// controllers/alumniController.js
import User from "../models/User.js";

// ─── Shared helper to build directory query ───────────────────────────────────
const buildDirectoryQuery = (role, queryParams) => {
  const { search, bloodGroup, passingYear, company, position, city, country, branch } = queryParams;

  let query = {
    role,
    "verification.isVerifiedByAdmin": true,
    accountStatus: "active",
    isProfileComplete: true,
  };

  if (search && search.trim() !== "") {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { "professional.skills": { $regex: search, $options: "i" } },
      { "professional.experiences": { $elemMatch: { company: { $regex: search, $options: "i" } } } },
      { "professional.experiences": { $elemMatch: { designation: { $regex: search, $options: "i" } } } },
    ];
  }

  if (bloodGroup) query["profile.bloodGroup"] = bloodGroup;
  if (passingYear) query["academic.passingYear"] = Number(passingYear);
  if (branch) query["academic.branch"] = { $regex: branch, $options: "i" };
  if (city) query["profile.location.city"] = { $regex: city, $options: "i" };
  if (country) query["profile.location.country"] = { $regex: country, $options: "i" };

  if (company || position) {
    query["professional.experiences"] = {
      $elemMatch: {
        ...(company && { company: { $regex: company, $options: "i" } }),
        ...(position && { designation: { $regex: position, $options: "i" } }),
      },
    };
  }

  return query;
};

// ─── Alumni Directory (any logged-in user can access) ─────────────────────────
export const getAlumniDirectory = async (req, res) => {
  try {
    const query = buildDirectoryQuery("alumni", req.query);
    console.log("Alumni Directory Query:", JSON.stringify(query, null, 2));

    const alumni = await User.find(query)
      .select("-auth -verification.otp")
      .sort({ "academic.passingYear": -1 });

    res.status(200).json({
      success: true,
      currentUserId: req.user?.id || null,
      data: alumni,
    });
  } catch (error) {
    console.error("Error fetching alumni:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ─── Student Directory (only alumni + admin can access) ───────────────────────
export const getStudentDirectory = async (req, res) => {
  try {
    const query = buildDirectoryQuery("student", req.query);
    console.log("Student Directory Query:", JSON.stringify(query, null, 2));

    const students = await User.find(query)
      .select("-auth -verification.otp")
      .sort({ "academic.passingYear": -1 });

    res.status(200).json({
      success: true,
      currentUserId: req.user?.id || null,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};