import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ========================
    // BASIC INFO
    // ========================

    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 60,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["student", "alumni", "admin"],
      default: "student",
      index: true,
    },

    // ========================
    // AUTH
    // ========================

    auth: {
      passwordHash: {
        type: String,
        required: true,
      },

      emailVerification: {
        otp: String,
        otpExpiresAt: Date,
      },
    },

    // ========================
    // VERIFICATION
    // ========================

    verification: {
      isEmailVerified: { type: Boolean, default: false },
      isPhoneVerified: { type: Boolean, default: false },
      isVerifiedByAdmin: { type: Boolean, default: false },
    },

    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
      index: true,
    },

    // ========================
    // PROFILE STATUS
    // ========================

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // ========================
    // PROFILE (optional for admin)
    // ========================

    profile: {
      dob: Date,

      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },

      bio: {
        type: String,
        maxlength: 500,
      },

      profilePicUrl: String,

      bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },

      location: {
        city: String,
        country: String,
      },

      privacy: {
        showPhone: { type: Boolean, default: true },
        showEmail: { type: Boolean, default: true },
      },

      socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        portfolio: String,
      },
    },

    // ========================
    // ACADEMIC (optional for admin)
    // ========================

    academic: {
      rollNumber: {
        type: String,
        sparse: true, // allows null for admin; still unique for students/alumni
        trim: true,
        index: true,
      },

      course: {
        type: String,
        enum: ["Btech", "Mtech", "MCA", "MBA"],
      },

      branch: String,

      passingYear: {
        type: Number,
        index: true,
      },

      hostel: String,
    },

    // ========================
    // PROFESSIONAL (alumni only)
    // ========================

    professional: {
      experiences: [
        {
          company: String,
          designation: String,
          industry: String,
          location: String,
          startDate: Date,
          endDate: Date,
          isCurrent: Boolean,
          description: String,
        },
      ],

      skills: [String],
    },

    // ========================
    // SESSIONS
    // ========================

    sessions: [
      {
        refreshToken: String,
        userAgent: String,
        ip: String,
        expiresAt: Date,
      },
    ],
  },

  {
    timestamps: true,
  }
);

// ========================
// INDEXES
// ========================

userSchema.index({ "academic.branch": 1 });
userSchema.index({ "academic.passingYear": 1 });
userSchema.index({ "professional.experiences.company": "text" });

// ========================
// PRE-SAVE HOOK
// ========================

userSchema.pre("save", function (next) {
  if (this.role === "admin") {
    this.isProfileComplete = true;
    this.accountStatus = "active";
    this.verification.isVerifiedByAdmin = true;
    return next();
  }

  if (this.role === "student") {
    this.isProfileComplete = true;
  }

  if (!this.academic?.rollNumber) {
    return next(new Error("rollNumber is required for students and alumni"));
  }

  next();
});

export default mongoose.model("User", userSchema);