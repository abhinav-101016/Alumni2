import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/email.js";
import { updateRoleIfGraduated } from "../middleware/updateRoleIfGraduated.js";

const router = express.Router();

const SALT_ROUNDS = 12;
const OTP_EXPIRY = 10 * 60 * 1000;

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =====================================================
   LOGIN RATE LIMITER
===================================================== */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* =====================================================
   REGISTER
===================================================== */
router.post(
  "/register",
  [
    body("name").isLength({ min: 2 }),
    body("email").isEmail(),
    body("phone").isLength({ min: 10 }),
    body("password").isLength({ min: 6 }),
    body("dob").isISO8601(),
    body("passingYear").isInt(),
    body("rollNumber").notEmpty(),
    body("gender").isIn(["male", "female", "other"]),
    body("course").isIn(["Btech", "Mtech", "MCA", "MBA"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name, email, phone, password, dob, gender,
        bloodGroup, city, country, bio, course, branch,
        passingYear, hostel, rollNumber
      } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { phone }, { "academic.rollNumber": rollNumber }]
      });

      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const CURRENT_YEAR = new Date().getFullYear();
      const role = Number(passingYear) < CURRENT_YEAR ? "alumni" : "student";

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY);

      const user = new User({
        name: name.trim(),
        email,
        phone,
        role,
        auth: {
          passwordHash,
          emailVerification: { otp, otpExpiresAt }
        },
        verification: {
          isEmailVerified: false,
          isPhoneVerified: false,
          isVerifiedByAdmin: true
        },
        accountStatus: "pending",
        profile: {
          dob: new Date(dob),
          gender,
          bloodGroup,
          bio,
          location: { city, country }
        },
        academic: {
          rollNumber,
          course,
          branch,
          passingYear: Number(passingYear),
          hostel
        }
      });

      await user.save();
      await sendVerificationEmail(email, otp);

      const safeUser = user.toObject();
      delete safeUser.auth;

      res.status(201).json({
        message: "User registered. Verify email.",
        user: safeUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   VERIFY EMAIL
===================================================== */
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      !user.auth.emailVerification ||
      user.auth.emailVerification.otp !== otp ||
      Date.now() > user.auth.emailVerification.otpExpiresAt
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.verification.isEmailVerified = true;
    user.accountStatus = "active";
    user.auth.emailVerification = undefined;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.auth;

    res.json({ message: "Email verified", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   RESEND OTP
===================================================== */
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY);
    user.auth.emailVerification = { otp, otpExpiresAt };

    await user.save();
    await sendVerificationEmail(email, otp);

    res.json({ message: "OTP resent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   LOGIN (PRODUCTION FIX)
===================================================== */
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.verification.isEmailVerified) {
      return res.status(403).json({ message: "Verify email first" });
    }

    if (user.accountStatus === "suspended" || user.accountStatus === "rejected") {
      return res.status(403).json({ message: "Account access denied" });
    }

    const isMatch = await bcrypt.compare(password, user.auth.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await updateRoleIfGraduated(user);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // FIX: sameSite: "none" and secure: true are required for Vercel -> Render
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,      // Must be true for sameSite: "none"
      sameSite: "none",  // Required for cross-site cookie usage
      maxAge: 60 * 60 * 1000,
      path: "/",         
    });

    const safeUser = user.toObject();
    delete safeUser.auth;

    let redirect = null;
    if (user.role === "alumni" && user.isProfileComplete === false) {
      redirect = "/complete-profile";
    }

    res.json({
      message: "Login successful",
      role: user.role,
      redirect,
      user: safeUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   LOGOUT (MATCHING ATTRIBUTES)
===================================================== */
router.post("/logout", (req, res) => {
  try {
    // Attributes must match the login cookie exactly to be cleared
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
});

/* =====================================================
   STATUS (FRESH DATABASE CHECK)
===================================================== */
router.get("/status", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ isLoggedIn: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user data to see actual isProfileComplete status
    const user = await User.findById(decoded.id).select("-auth"); 

    if (!user) {
      return res.status(404).json({ isLoggedIn: false });
    }

    res.json({ 
      isLoggedIn: true, 
      user: user 
    });
  } catch (err) {
    // If token is invalid/expired, clear it to prevent loops
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none", path: "/" });
    res.status(401).json({ isLoggedIn: false });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Don't reveal whether user exists — same response either way
    if (!user) {
      return res.status(200).json({ message: "If that email is registered, an OTP has been sent." });
    }

    if (user.accountStatus === "suspended" || user.accountStatus === "rejected") {
      return res.status(403).json({ message: "Account access denied" });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY); // 10 minutes

    // Reuse the emailVerification field to store password reset OTP
    user.auth.emailVerification = { otp, otpExpiresAt };
    await user.save();

    // Reuse your existing email utility
    await sendVerificationEmail(email, otp);

    res.status(200).json({ message: "If that email is registered, an OTP has been sent." });
  } catch (error) {
    console.error("forgot-password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   FORGOT PASSWORD — VERIFY OTP
   POST /api/auth/verify-reset-otp
   Body: { email, otp }
===================================================== */
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const verification = user.auth.emailVerification;

    if (
      !verification ||
      verification.otp !== otp ||
      Date.now() > new Date(verification.otpExpiresAt).getTime()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid — issue a short-lived reset token
    // We don't clear the OTP yet so the reset step can re-verify
    const resetToken = jwt.sign(
      { id: user._id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.status(200).json({ message: "OTP verified", resetToken });
  } catch (error) {
    console.error("verify-reset-otp error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   FORGOT PASSWORD — RESET PASSWORD
   POST /api/auth/reset-password
   Body: { resetToken, newPassword }
===================================================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Reset session expired. Please start over." });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password and clear OTP
    user.auth.passwordHash        = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.auth.emailVerification   = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("reset-password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;