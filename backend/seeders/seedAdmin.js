import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedAdmins = async () => {
  try {
    // 1. Connect DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // 2. Admin list
    const admins = [
      {
        name: "Admin4 User",
        email: "admin@alumni.com",
        phone:"9999959910",
         password :"admin4123",
         rollNumber: "ADMIN001"
      },
      {
        name: "alumni1",
        email: "alumni1@alumni.com",
        phone:"9999999710",
         password :"admin1123",
         rollNumber: "ADMIN002"
      },
      {
        name: "alumni2",
        email: "alumni2@alumni.com",
        phone:"9999999900",
         password :"admin2123",
         rollNumber: "ADMIN0013"
      },
      {
        name: "alumni3",
        email: "alumni3@alumni.com",
        phone:"9999999910",
         password : "admin3123",
         rollNumber: "ADMIN004"
      },
    ];

   
    const saltRounds = 10;
    

    for (const adminData of admins) {
      const existingAdmin = await User.findOne({ email: adminData.email });

      if (existingAdmin) {
        console.log(`⚠️ ${adminData.email} already exists`);
        continue;
      }
      const password=adminData.password;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const admin = new User({
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        role: "admin",

        auth: {
          passwordHash,
        },

        verification: {
          isEmailVerified: true,
          isPhoneVerified: true,
          isVerifiedByAdmin: true,
        },
        academic:{
          rollNumber:adminData.rollNumber
        },
        

        accountStatus: "active",
        isProfileComplete: true,

        profile: {
          bio: "System Administrator",
        },
      });

      await admin.save();
      console.log(`🎉 Created: ${adminData.email}`);
    }

    console.log("\n✅ Admin seeding completed!");
    console.log("🔑 Default Password for all: admin123");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admins:", error.message);
    process.exit(1);
  }
};

seedAdmins();