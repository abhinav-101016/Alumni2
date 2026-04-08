// 📁 src/models/News.js
import mongoose from "mongoose";

// ── Edit history entry ──────────────────────────────────────────────────────
const EditHistorySchema = new mongoose.Schema(
  {
    editedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    editedByName: { type: String, required: true },
    editedAt:     { type: Date, default: Date.now },
    changes: {
      title:    { type: String },
      content:  { type: String },
      excerpt:  { type: String },
      category: { type: String },
      image:    { type: String },
      status:   { type: String },
    },
    note: { type: String, trim: true },
  },
  { _id: true }
);

// ── Main News schema ────────────────────────────────────────────────────────
const NewsSchema = new mongoose.Schema(
  {
    // ── Content ──
    title: {
      type: String,
      required: [true, "News title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "News content is required"],
    },
    category: {
      type: String,
      enum: ["Announcement", "Achievement", "Event", "Research", "Industry", "General"],
      default: "General",
    },

    // ── Image ──
    image: {
      url:      { type: String },
      publicId: { type: String },
      altText:  { type: String, trim: true },
    },

    // ── Status ──
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: { type: Date },

    // ── Uploader / Author ──
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByName:  { type: String, required: true },
    createdByEmail: { type: String },

    // ── Last editor snapshot ──
    lastEditedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastEditedByName: { type: String },
    lastEditedAt:     { type: Date },

    // ── Full edit history (admin-visible) ──
    editHistory: [EditHistorySchema],
  },
  {
    timestamps: true,
  }
);

// ── Auto-generate slug ──────────────────────────────────────────────────────
NewsSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();
  }
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});
export default mongoose.model("News", NewsSchema);