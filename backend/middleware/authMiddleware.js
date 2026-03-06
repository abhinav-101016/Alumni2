import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
  try {
    // token now comes from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-auth.passwordHash")
      .lean();

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.verification?.isVerifiedByAdmin) {
      return res.status(403).json({ message: "User not verified by admin" });
    }

    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      isVerifiedByAdmin: user.verification?.isVerifiedByAdmin,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}