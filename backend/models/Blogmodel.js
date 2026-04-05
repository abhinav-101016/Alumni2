const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    publicId: { type: String, required: true }, // Cloudinary / S3 reference
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const AuthorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    designation: { type: String, default: "" },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

const BlogSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, "Subtitle cannot exceed 300 characters"],
      default: "",
    },

    // ── Content ───────────────────────────────────────────
    body: {
      type: String,
      required: [true, "Blog body content is required"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Alumni Story",
        "Career",
        "Campus Life",
        "Events",
        "Achievements",
        "News",
        "Research",
        "Other",
      ],
      default: "Other",
    },
    tags: {
      type: [String],
      default: [],
    },

    // ── Media ─────────────────────────────────────────────
    coverImage: {
      url: { type: String, default: "" },
      alt: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    images: {
      type: [ImageSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "Cannot upload more than 20 images per blog",
      },
    },

    // ── Author ────────────────────────────────────────────
    author: {
      type: AuthorSchema,
      required: true,
    },

    // ── Status & Visibility ───────────────────────────────
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },

    // ── SEO ───────────────────────────────────────────────
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, "Meta title cannot exceed 70 characters"],
      default: "",
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
      default: "",
    },

    // ── Engagement ────────────────────────────────────────
    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    commentsEnabled: { type: Boolean, default: true },

    // ── Admin / Audit ─────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ category: 1, status: 1 });
BlogSchema.index({ isFeatured: 1, status: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ title: "text", body: "text", excerpt: "text" }); // full-text search


BlogSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// ── Virtual: reading time (words / 200 wpm) ───────────────
BlogSchema.virtual("readingTime").get(function () {
  const words = this.body ? this.body.split(/\s+/).length : 0;
  return Math.ceil(words / 200); // in minutes
});

module.exports = mongoose.model("Blog", BlogSchema);