import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js"; // adjust path if needed

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // 2. Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@alumni.com" });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    // 3. Hash password
    const password = "admin123";
    const saltRounds = 10;

    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@alumni.com",
      phone: "9999999999",
      role: "admin",

      auth: {
        passwordHash,
      },

      verification: {
        isEmailVerified: true,
        isPhoneVerified: true,
        isVerifiedByAdmin: true,
      },

      accountStatus: "active",
      isProfileComplete: true,

      profile: {
        bio: "System Administrator",
      },
    });

    // 5. Save
    await admin.save();

    console.log("🎉 Admin created successfully!");
    console.log("📧 Email: admin@alumni.com");
    console.log("🔑 Password: admin123");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();