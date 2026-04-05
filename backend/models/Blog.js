// 📁 src/models/Blog.js
import mongoose from "mongoose";

// ── Edit history entry ──────────────────────────────────────────────────────
const EditHistorySchema = new mongoose.Schema(
  {
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    editedByName: { type: String, required: true },  // snapshot — stays accurate even if user is deleted
    editedAt:     { type: Date, default: Date.now },
    changes: {
      // stores the PREVIOUS values of whichever fields were changed
      title:    { type: String },
      content:  { type: String },
      excerpt:  { type: String },
      category: { type: String },
      tags:     { type: [String] },
      image:    { type: String },
    },
    note: { type: String, trim: true }, // optional admin note like "Fixed typo" 
  },
  { _id: true }
);

// ── Main Blog schema ────────────────────────────────────────────────────────
const BlogSchema = new mongoose.Schema(
  {
    // ── Content ──
    title: {
      type: String,
      required: [true, "Blog title is required"],
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
      required: [true, "Blog content is required"],
    },
    category: {
      type: String,
      enum: ["Alumni Stories", "Campus Life", "Industry Insights", "Mentorship", "Announcements", "Other"],
      default: "Other",
    },
    tags: [{ type: String, trim: true, lowercase: true }],

    // ── Image ──
    image: {
      url:         { type: String },          // e.g. Cloudinary URL or /uploads/...
      publicId:    { type: String },          // Cloudinary public_id for deletion
      altText:     { type: String, trim: true },
    },

    // ── Status ──
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: { type: Date },

    // ── Uploader / Author ──
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByName:  { type: String, required: true },  // snapshot
    createdByEmail: { type: String },                  // snapshot

    // ── Last editor snapshot ──
    lastEditedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastEditedByName: { type: String },
    lastEditedAt:     { type: Date },

    // ── Full edit history (admin-visible) ──
    editHistory: [EditHistorySchema],
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ── Auto-generate slug from title before saving ─────────────────────────────
BlogSchema.pre("save", function (next) {
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
  // Set publishedAt when status changes to published
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.model("Blog", BlogSchema);