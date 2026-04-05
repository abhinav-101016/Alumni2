import express from "express";
import multer from "multer";
import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Event from "../models/Event.js";
import News from "../models/News.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import {
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendAccountSuspendedEmail,
} from "../utils/email.js";

const router = express.Router();

// ─── Multer: memory storage, images only, 5MB max ────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// ─── Cloudinary upload helper (streams buffer — no temp file needed) ──────────
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ─── Build edit history entry with previous field values ─────────────────────
const buildHistoryEntry = (admin, oldDoc, changedFields, note) => {
  const changes = {};
  changedFields.forEach((field) => {
    if (oldDoc[field] !== undefined) {
      changes[field] = field === "image" ? oldDoc.image?.url : oldDoc[field];
    }
  });
  return {
    editedBy:     admin._id,
    editedByName: admin.name || admin.email,
    editedAt:     new Date(),
    changes,
    note: note || "",
  };
};

/* ═══════════════════════════════════════════════════════════════════════════════
   USER MANAGEMENT  (existing routes — unchanged)
═══════════════════════════════════════════════════════════════════════════════ */

/* GET /api/admin/users?status=pending&role=student&search= */
router.get("/users", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status, role, search } = req.query;
    const query = {};

    if (status) query.accountStatus = status;
    if (role && role !== "admin") query.role = role;
    else query.role = { $in: ["student", "alumni"] };

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "academic.rollNumber": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-auth").sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* PATCH /api/admin/users/:id/verify */
router.patch("/users/:id/verify", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ success: false, message: "Cannot modify another admin" });

    if (!user.verification) user.verification = {};
    user.verification.isVerifiedByAdmin = true;
    user.accountStatus = "active";
    await user.save();
    sendAccountApprovedEmail(user.email, user.name).catch((err) => console.error("Email failed:", err));

    const updatedUser = await User.findById(user._id).select("-auth").lean();
    res.json({ success: true, message: "User verified successfully", data: updatedUser });
  } catch (error) {
    console.error("Admin verify user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* PATCH /api/admin/users/:id/reject */
router.patch("/users/:id/reject", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ success: false, message: "Cannot modify another admin" });

    user.verification.isVerifiedByAdmin = false;
    user.accountStatus = "rejected";
    await user.save();
    sendAccountRejectedEmail(user.email, user.name).catch((err) => console.error("Email failed:", err));

    const safeUser = user.toObject();
    delete safeUser.auth;
    res.json({ success: true, message: "User rejected", data: safeUser });
  } catch (error) {
    console.error("Admin reject user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* PATCH /api/admin/users/:id/suspend */
router.patch("/users/:id/suspend", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ success: false, message: "Cannot modify another admin" });

    user.accountStatus = "suspended";
    await user.save();
    sendAccountSuspendedEmail(user.email, user.name).catch((err) => console.error("Email failed:", err));

    const safeUser = user.toObject();
    delete safeUser.auth;
    res.json({ success: true, message: "User suspended", data: safeUser });
  } catch (error) {
    console.error("Admin suspend user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════════
   BLOG ROUTES   /api/admin/blogs
═══════════════════════════════════════════════════════════════════════════════ */

/* GET /api/admin/blogs — all blogs including drafts */
router.get("/blogs", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).select("-editHistory");
    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/admin/blogs/:id — single blog with full edit history */
router.get("/blogs/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/admin/blogs */
router.post("/blogs", authMiddleware, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, status } = req.body;
    const admin = req.user;

    let image = {};
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/blogs");
      image = { url: result.secure_url, publicId: result.public_id, altText: title };
    }

    const blog = await Blog.create({
      title, excerpt, content, category,
      tags:   tags ? JSON.parse(tags) : [],
      status: status || "draft",
      image,
      createdBy:      admin._id,
      createdByName:  admin.name || admin.email,
      createdByEmail: admin.email,
    });

    res.status(201).json({ success: true, message: "Blog created", blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* PUT /api/admin/blogs/:id */
router.put("/blogs/:id", authMiddleware, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, status, note } = req.body;
    const admin = req.user;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const changedFields = [];
    if (title    && title    !== blog.title)    changedFields.push("title");
    if (excerpt  && excerpt  !== blog.excerpt)  changedFields.push("excerpt");
    if (content  && content  !== blog.content)  changedFields.push("content");
    if (category && category !== blog.category) changedFields.push("category");
    if (status   && status   !== blog.status)   changedFields.push("status");

    if (req.file) {
      if (blog.image?.publicId) await cloudinary.uploader.destroy(blog.image.publicId);
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/blogs");
      changedFields.push("image");
      blog.image = { url: result.secure_url, publicId: result.public_id, altText: title || blog.title };
    }

    if (changedFields.length > 0) blog.editHistory.push(buildHistoryEntry(admin, blog, changedFields, note));

    if (title)    blog.title    = title;
    if (excerpt)  blog.excerpt  = excerpt;
    if (content)  blog.content  = content;
    if (category) blog.category = category;
    if (tags)     blog.tags     = JSON.parse(tags);
    if (status)   blog.status   = status;

    blog.lastEditedBy     = admin._id;
    blog.lastEditedByName = admin.name || admin.email;
    blog.lastEditedAt     = new Date();

    await blog.save();
    res.json({ success: true, message: "Blog updated", blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE /api/admin/blogs/:id */
router.delete("/blogs/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    if (blog.image?.publicId) await cloudinary.uploader.destroy(blog.image.publicId);
    await blog.deleteOne();
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════════
   EVENT ROUTES   /api/admin/events
═══════════════════════════════════════════════════════════════════════════════ */

/* GET /api/admin/events */
router.get("/events", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: -1 }).select("-editHistory");
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/admin/events/:id */
router.get("/events/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/admin/events */
router.post("/events", authMiddleware, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    const {
      title, description, startDate, endDate, startTime, endTime,
      location, isVirtual, virtualUrl, registrationUrl,
      registrationDeadline, maxAttendees, status,
    } = req.body;
    const admin = req.user;

    let image = {};
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/events");
      image = { url: result.secure_url, publicId: result.public_id, altText: title };
    }

    const event = await Event.create({
      title, description, startDate, endDate, startTime, endTime,
      location, isVirtual: isVirtual === "true", virtualUrl,
      registrationUrl, registrationDeadline, maxAttendees,
      status: status || "upcoming",
      image,
      createdBy:      admin._id,
      createdByName:  admin.name || admin.email,
      createdByEmail: admin.email,
    });

    res.status(201).json({ success: true, message: "Event created", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* PUT /api/admin/events/:id */
router.put("/events/:id", authMiddleware, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    const {
      title, description, startDate, endDate, startTime, endTime,
      location, isVirtual, virtualUrl, registrationUrl,
      registrationDeadline, maxAttendees, status, note,
    } = req.body;
    const admin = req.user;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const changedFields = [];
    if (title       && title       !== event.title)       changedFields.push("title");
    if (description && description !== event.description) changedFields.push("description");
    if (location    && location    !== event.location)    changedFields.push("location");
    if (startDate   && String(startDate) !== String(event.startDate)) changedFields.push("startDate");
    if (endDate     && String(endDate)   !== String(event.endDate))   changedFields.push("endDate");
    if (startTime   && startTime   !== event.startTime)   changedFields.push("startTime");
    if (endTime     && endTime     !== event.endTime)     changedFields.push("endTime");
    if (status      && status      !== event.status)      changedFields.push("status");

    if (req.file) {
      if (event.image?.publicId) await cloudinary.uploader.destroy(event.image.publicId);
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/events");
      changedFields.push("image");
      event.image = { url: result.secure_url, publicId: result.public_id, altText: title || event.title };
    }

    if (changedFields.length > 0) event.editHistory.push(buildHistoryEntry(admin, event, changedFields, note));

    if (title)        event.title        = title;
    if (description)  event.description  = description;
    if (location)     event.location     = location;
    if (startDate)    event.startDate    = startDate;
    if (endDate)      event.endDate      = endDate;
    if (startTime)    event.startTime    = startTime;
    if (endTime)      event.endTime      = endTime;
    if (virtualUrl)   event.virtualUrl   = virtualUrl;
    if (registrationUrl) event.registrationUrl = registrationUrl;
    if (registrationDeadline) event.registrationDeadline = registrationDeadline;
    if (maxAttendees) event.maxAttendees = maxAttendees;
    if (isVirtual !== undefined) event.isVirtual = isVirtual === "true";
    if (status)       event.status       = status;

    event.lastEditedBy     = admin._id;
    event.lastEditedByName = admin.name || admin.email;
    event.lastEditedAt     = new Date();

    await event.save();
    res.json({ success: true, message: "Event updated", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE /api/admin/events/:id */
router.delete("/events/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.image?.publicId) await cloudinary.uploader.destroy(event.image.publicId);
    await event.deleteOne();
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════════
   NEWS ROUTES   /api/admin/news
═══════════════════════════════════════════════════════════════════════════════ */

/* GET /api/admin/news */
router.get("/news", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 }).select("-editHistory");
    res.json({ success: true, news: newsList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/admin/news/:id */
router.get("/news/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: "News not found" });
    res.json({ success: true, news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/admin/news */
router.post("/news", authMiddleware, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    const { title, excerpt, content, category, status } = req.body;
    const admin = req.user;

    let image = {};
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/news");
      image = { url: result.secure_url, publicId: result.public_id, altText: title };
    }

    const news = await News.create({
      title, excerpt, content, category,
      status: status || "draft",
      image,
      createdBy:      admin._id,
      createdByName:  admin.name || admin.email,
      createdByEmail: admin.email,
    });

    res.status(201).json({ success: true, message: "News created", news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* PUT /api/admin/news/:id */
router.put("/news/:id", authMiddleware, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
  try {
    const { title, excerpt, content, category, status, note } = req.body;
    const admin = req.user;

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: "News not found" });

    const changedFields = [];
    if (title    && title    !== news.title)    changedFields.push("title");
    if (excerpt  && excerpt  !== news.excerpt)  changedFields.push("excerpt");
    if (content  && content  !== news.content)  changedFields.push("content");
    if (category && category !== news.category) changedFields.push("category");
    if (status   && status   !== news.status)   changedFields.push("status");

    if (req.file) {
      if (news.image?.publicId) await cloudinary.uploader.destroy(news.image.publicId);
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/news");
      changedFields.push("image");
      news.image = { url: result.secure_url, publicId: result.public_id, altText: title || news.title };
    }

    if (changedFields.length > 0) news.editHistory.push(buildHistoryEntry(admin, news, changedFields, note));

    if (title)    news.title    = title;
    if (excerpt)  news.excerpt  = excerpt;
    if (content)  news.content  = content;
    if (category) news.category = category;
    if (status)   news.status   = status;

    news.lastEditedBy     = admin._id;
    news.lastEditedByName = admin.name || admin.email;
    news.lastEditedAt     = new Date();

    await news.save();
    res.json({ success: true, message: "News updated", news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE /api/admin/news/:id */
router.delete("/news/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: "News not found" });
    if (news.image?.publicId) await cloudinary.uploader.destroy(news.image.publicId);
    await news.deleteOne();
    res.json({ success: true, message: "News deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;