import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cookie from "cookie";
import redis from "../utils/redis.js";

// Cache verified user data briefly to avoid DB hit on every reconnect
const USER_CACHE_TTL = 120; // 2 minutes

export default async function socketAuthMiddleware(socket, next) {
  try {
    const rawCookies = socket.handshake.headers.cookie || "";
    const cookies    = cookie.parse(rawCookies);
    const token      = cookies.token || socket.handshake.auth?.token;

    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId  = decoded.id;

    // Try Redis cache first — avoids DB on every reconnect
    let userData = null;
    try {
      const cached = await redis.get(`user:socket:${userId}`);
      if (cached) userData = JSON.parse(cached);
    } catch (_) { /* cache miss */ }

    if (!userData) {
      const user = await User.findById(userId)
        .select("name role profile.profilePicUrl verification.isVerifiedByAdmin accountStatus")
        .lean();

      if (!user)                               return next(new Error("User not found"));
      if (!user.verification?.isVerifiedByAdmin) return next(new Error("Account not verified"));
      if (user.accountStatus !== "active")     return next(new Error("Account is not active"));

      userData = {
        id:        user._id.toString(),
        name:      user.name,
        role:      user.role,
        avatarUrl: user.profile?.profilePicUrl || null,
      };

      try {
        await redis.setex(`user:socket:${userId}`, USER_CACHE_TTL, JSON.stringify(userData));
      } catch (_) { /* non-fatal */ }
    }

    socket.user = userData;
    next();
  } catch (err) {
    console.error("[Socket auth]", err.message);
    next(new Error("Invalid or expired token"));
  }
}
