import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/email.js";

const router = express.Router();

const SALT_ROUNDS = 12;
const CURRENT_YEAR = 2026;
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =====================================================
   1️⃣ REGISTER
/* =====================================================
   1️⃣ REGISTER (CORRECTED)
===================================================== */
router.post(
  "/register",
  [
    body("name").isLength({ min: 2, max: 60 }),
    body("email").isEmail().normalizeEmail(),
    body("phone").matches(/^[0-9]{10,15}$/),
    body("password").isLength({ min: 6 }),
    body("dob").isISO8601(),
    body("passingYear").isInt({ min: 1900, max: CURRENT_YEAR + 10 }),
    body("gender").isIn(["male", "female", "other"]),
    body("course").isIn(["Btech", "Mtech", "MCA", "MBA"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      // 1. Destructure all fields from the flat req.body sent by the frontend
      const {
        name, email, phone, password, dob, gender,
        bloodGroup, city, country, bio, course, 
        branch, passingYear, hostel
      } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) return res.status(409).json({ message: "Email or phone already exists" });

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const role = Number(passingYear) < CURRENT_YEAR ? "alumni" : "student";
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY);

      /* ---------- CREATE USER WITH NESTED MAPPING ---------- */
      const user = new User({
        name: name.trim(),
        email,
        phone,
        role,
        auth: {
          passwordHash,
          emailVerification: { otp, otpExpiresAt },
        },
        verification: {
          isEmailVerified: false,
          isPhoneVerified: false,
          isVerifiedByAdmin: false,
        },
        accountStatus: "pending",
        profile: {
          dob: new Date(dob),
          gender,
          bloodGroup: bloodGroup?.trim() || "",
          bio: bio?.trim() || "",
          // MAPPING HAPPENS HERE:
          location: {
            city: city?.trim() || "",
            country: country?.trim() || "",
          },
        },
        academic: {
          course,
          branch: branch || "",
          passingYear: Number(passingYear),
          hostel: hostel || "",
        },
      });

      await user.save();
      await sendVerificationEmail(email, otp);

      const safeUser = user.toObject();
      delete safeUser.auth;

      res.status(201).json({ message: "User registered. Please verify your email.", user: safeUser });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
/* =====================================================
   2️⃣ VERIFY EMAIL OTP
===================================================== */
router.post(
  "/verify-email",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email });

      if (!user)
        return res.status(404).json({ message: "User not found" });

      if (user.verification.isEmailVerified)
        return res
          .status(400)
          .json({ message: "Email already verified" });

      const emailVerification = user.auth?.emailVerification;

      if (
        !emailVerification ||
        emailVerification.otp !== otp ||
        Date.now() > emailVerification.otpExpiresAt
      ) {
        return res
          .status(400)
          .json({ message: "Invalid or expired OTP" });
      }

      user.verification.isEmailVerified = true;
      user.accountStatus = "active";
      user.auth.emailVerification = undefined;

      await user.save();

      const safeUser = user.toObject();
      delete safeUser.auth;

      res.json({
        message: "Email verified successfully",
        user: safeUser,
      });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   3️⃣ RESEND OTP
===================================================== */
router.post(
  "/resend-otp",
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user)
        return res.status(404).json({ message: "User not found" });

      if (user.verification.isEmailVerified)
        return res
          .status(400)
          .json({ message: "Email already verified" });

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY);

      user.auth.emailVerification = { otp, otpExpiresAt };

      await user.save();

      await sendVerificationEmail(email, otp);

      res.json({
        message: "Verification OTP resent successfully",
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   4️⃣ LOGIN
===================================================== */
router.post(
  "/login",
  [body("identifier").notEmpty(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { identifier, password } = req.body;

      const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
      });

      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      if (!user.verification.isEmailVerified)
        return res
          .status(403)
          .json({ message: "Please verify your email first" });

      if (user.accountStatus !== "active")
        return res.status(403).json({ message: "Account not active" });

      const isMatch = await bcrypt.compare(
        password,
        user.auth.passwordHash
      );

      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      /* ---------- TOKEN ---------- */
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const safeUser = user.toObject();
      delete safeUser.auth;

      res.json({
        message: "Login successful",
        token,
        role: user.role,
        user: safeUser,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   ROLE MIDDLEWARE
===================================================== */
export const requireRole = (roles) => (req, res, next) => {
  const userRole = req.user?.role;

  if (!roles.includes(userRole)) {
    return res
      .status(403)
      .json({ message: `Role ${userRole} not authorized` });
  }

  next();
};

export default router;