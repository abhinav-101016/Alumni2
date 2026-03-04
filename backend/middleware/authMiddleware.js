import jwt from "jsonwebtoken";
import User from "../models/User.js"; // adjust path

export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if verified by admin
    if (!user.verification.isVerifiedByAdmin) {
      return res.status(403).json({ message: "User not verified by admin" });
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      isVerifiedByAdmin: user.verification.isVerifiedByAdmin,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}