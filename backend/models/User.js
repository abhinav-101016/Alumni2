import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  showPhone: { type: Boolean, default: true },
  showEmail: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isVerifiedByAdmin: { type: Boolean, default: false },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  course: { type: String, enum: ['Btech', 'Mtech', 'MCA', 'MBA'], required: true },
  branch: { type: String, required: true },
  passingYear: { type: Number, required: true },
  hostel: { type: String },
  city: String,
  country: String,
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  bio: { type: String, maxlength: 500 },
  profilePicUrl: String,
  socialLinks: { type: mongoose.Schema.Types.Mixed },
  role: { type: String, enum: ['student', 'alumni'], default: 'student' },
  emailVerification: {
    otp: { type: String },
    otpExpiresAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('User', userSchema);