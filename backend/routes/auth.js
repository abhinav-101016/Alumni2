import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/email.js';

const router = express.Router();
const SALT_ROUNDS = 12;
const CURRENT_YEAR = 2026;
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. REGISTER
router.post('/register', [
  body('name').isLength({ min: 2, max: 60 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').matches(/^[0-9]{10,15}$/),
  body('password').isLength({ min: 6 }),
  body('dob').isISO8601(),
  body('passingYear').isInt({ min: 1900, max: CURRENT_YEAR + 10 }),
  body('gender').isIn(['male', 'female', 'other']),
  body('course').isIn(['Btech', 'Mtech', 'MCA', 'MBA']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const {
    name, email, phone, password, dob, gender, course, branch,
    passingYear, hostel, city, country, bloodGroup, bio
  } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) return res.status(409).json({ message: 'Email or phone already exists' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const role = passingYear < CURRENT_YEAR ? 'alumni' : 'student';
  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY);

  const user = new User({
    name, email, phone, passwordHash,
    dob: new Date(dob), gender, course, branch,
    passingYear, hostel, city, country, bloodGroup, bio, role,
    emailVerification: { otp, otpExpiresAt }
  });

  await user.save();

  await sendVerificationEmail(email, otp);

  const { passwordHash: _, emailVerification: __, ...safeUser } = user.toObject();
  res.status(201).json({
    message: 'User registered. Please verify your email.',
    user: safeUser
  });
});

// 2. VERIFY EMAIL OTP
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

  const { emailVerification } = user;
  if (emailVerification.otp !== otp || Date.now() > emailVerification.otpExpiresAt) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.isEmailVerified = true;
  user.emailVerification = undefined;
  await user.save();

  const { passwordHash: _, ...safeUser } = user.toObject();
  res.json({ message: 'Email verified successfully', user: safeUser });
});

// 3. RESEND OTP
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY);

  user.emailVerification = { otp, otpExpiresAt };
  await user.save();

  await sendVerificationEmail(email, otp);
  res.json({ message: 'Verification OTP resent successfully' });
});

// 4. LOGIN
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash +emailVerification +role');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  if (!user.isEmailVerified) {
    return res.status(403).json({ message: 'Please verify your email first' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-super-secret-key-123',
    { expiresIn: '7d' }
  );

  const { passwordHash, emailVerification, ...safeUser } = user.toObject();
  res.json({
    message: 'Login successful',
    token,
    user: { ...safeUser, role: user.role }
  });
});

// Role middleware
const requireRole = (roles) => (req, res, next) => {
  const userRole = req.user?.role;
  if (!roles.includes(userRole)) {
    return res.status(403).json({ message: `Role ${userRole} not authorized` });
  }
  next();
};

export default router;