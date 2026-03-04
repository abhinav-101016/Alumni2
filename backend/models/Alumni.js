import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // hashed
  passingYear: { type: Number },
  bloodGroup: { type: String },
  hostel: { type: String },
  skills: [{ type: String }],
  company: { type: String },
  location: { type: String },
  profilePicture: { type: String },
  bio: { type: String, maxlength: 500 },
  isVerified: { type: Boolean, default: false }, // admin verification
});

const Alumni = mongoose.model("Alumni", alumniSchema);
export default Alumni;