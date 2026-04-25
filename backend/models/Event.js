// 📁 src/models/Event.js
import mongoose from "mongoose";

// ── Image sub-schema ────────────────────────────────────────────────────────
const ImageSchema = new mongoose.Schema(
  {
    url:      { type: String },
    publicId: { type: String },
    altText:  { type: String, trim: true },
  },
  { _id: false }
);

// ── Edit history entry ──────────────────────────────────────────────────────
const EditHistorySchema = new mongoose.Schema(
  {
    editedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    editedByName: { type: String, required: true },
    editedAt:     { type: Date, default: Date.now },
    changes: {
      title:       { type: String },
      description: { type: String },
      location:    { type: String },
      startDate:   { type: Date },
      endDate:     { type: Date },
      startTime:   { type: String },
      endTime:     { type: String },
      image:       { type: String },   // previous cover URL snapshot
      images:      { type: [String] }, // previous gallery URL snapshots
      status:      { type: String },
    },
    note: { type: String, trim: true },
  },
  { _id: true }
);

// ── Main Event schema ───────────────────────────────────────────────────────
const EventSchema = new mongoose.Schema(
  {
    // ── Content ──
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },

    // ── Date & Time ──
    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
    },
    endDate:   { type: Date },
    startTime: { type: String, trim: true },
    endTime:   { type: String, trim: true },

    // ── Location ──
    location: {
      type: String,
      trim: true,
      required: function () {
        return !this.isVirtual;
      },
    },
    isVirtual:  { type: Boolean, default: false },
    virtualUrl: { type: String, trim: true },

    // ── Images ──
    // `image`  → cover image (always images[0]); kept for backward compatibility
    // `images` → full ordered gallery including the cover
    image:  { type: ImageSchema, default: () => ({}) },
    images: { type: [ImageSchema], default: [] },

    // ── Registration ──
    registrationUrl:      { type: String, trim: true },
    registrationDeadline: { type: Date },
    maxAttendees:         { type: Number },

    // ── Status ──
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },

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
  { timestamps: true }
);

// ── Auto-generate slug ──────────────────────────────────────────────────────
EventSchema.pre("save", function (next) {
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
  next();
});

export default mongoose.model("Event", EventSchema);