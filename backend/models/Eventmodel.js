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

const VenueSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    pincode: { type: String, default: "" },
    mapLink: { type: String, default: "" }, // Google Maps URL
  },
  { _id: false }
);

const OrganizerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Event title is required"],
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
    summary: {
      type: String,
      trim: true,
      maxlength: [500, "Summary cannot exceed 500 characters"],
      default: "",
    },

    // ── Content ───────────────────────────────────────────
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Reunion",
        "Webinar",
        "Networking",
        "Workshop",
        "Seminar",
        "Cultural",
        "Sports",
        "Career Fair",
        "Fundraiser",
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
        message: "Cannot upload more than 20 images per event",
      },
    },

    // ── Date & Time ───────────────────────────────────────
    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, "Event end date is required"],
    },
    startTime: {
      type: String, // "10:00 AM" — kept as string for display flexibility
      default: "",
    },
    endTime: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },

    // ── Location ──────────────────────────────────────────
    mode: {
      type: String,
      enum: ["in-person", "online", "hybrid"],
      required: [true, "Event mode is required"],
      default: "in-person",
    },
    venue: {
      type: VenueSchema,
      default: () => ({}),
    },
    onlineLink: {
      type: String, // Zoom / Google Meet / Teams URL
      default: "",
    },

    // ── Registration ──────────────────────────────────────
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationDeadline: {
      type: Date,
      default: null,
    },
    maxCapacity: {
      type: Number,
      default: null, // null = unlimited
      min: [1, "Capacity must be at least 1"],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    registrationLink: {
      type: String,
      default: "",
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    ticketPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Organizer ─────────────────────────────────────────
    organizer: {
      type: OrganizerSchema,
      required: true,
    },
    hostedBy: {
      type: String, // e.g. "Alumni Association", "CSE Department"
      default: "",
    },

    // ── Status & Visibility ───────────────────────────────
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true, // visible on homepage without login
    },

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

// ── Indexes ───────────────────────────────────────────────
EventSchema.index({ startDate: 1, status: 1 });
EventSchema.index({ category: 1, status: 1 });
EventSchema.index({ isFeatured: 1, isPublic: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ title: "text", description: "text", summary: "text" }); // full-text search

// ── Validation: endDate must be >= startDate ──────────────
EventSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error("End date cannot be before start date"));
  }

  // Auto-update status based on current time
  const now = new Date();
  if (this.status !== "cancelled") {
    if (now < this.startDate) {
      this.status = "upcoming";
    } else if (now >= this.startDate && now <= this.endDate) {
      this.status = "ongoing";
    } else if (now > this.endDate) {
      this.status = "completed";
    }
  }

  next();
});

// ── Virtual: seats available ──────────────────────────────
EventSchema.virtual("seatsAvailable").get(function () {
  if (!this.maxCapacity) return null; // unlimited
  return Math.max(0, this.maxCapacity - this.registeredCount);
});

// ── Virtual: is registration open ─────────────────────────
EventSchema.virtual("isRegistrationOpen").get(function () {
  if (!this.registrationRequired) return false;
  const now = new Date();
  const deadlinePassed = this.registrationDeadline && now > this.registrationDeadline;
  const full = this.maxCapacity && this.registeredCount >= this.maxCapacity;
  return !deadlinePassed && !full && this.status === "upcoming";
});

module.exports = mongoose.model("Event", EventSchema);