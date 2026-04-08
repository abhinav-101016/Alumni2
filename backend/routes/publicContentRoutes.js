// 📁 backend/routes/publicContentRoutes.js
import express from "express"
import Blog  from "../models/Blog.js"
import Event from "../models/Event.js"
import News  from "../models/News.js"

const router = express.Router()

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOGS  — public, no auth required
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/blogs
// Returns all published blogs, newest first
// Query params: ?category=&limit=&page=
router.get("/blogs", async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query
    const query = { status: "published" }
    if (category) query.category = category

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Blog.countDocuments(query)
    const blogs = await Blog
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-editHistory -content") // lightweight list view

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      blogs,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/blogs/:id
// Returns full blog post (including content)
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, status: "published" }).select("-editHistory")
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" })
    res.json({ success: true, blog })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENTS  — public, no auth required
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/events
// Returns events, newest startDate first
// Query params: ?status=upcoming|past|cancelled&limit=&page=
router.get("/events", async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query
    const query = {}

    // Default: show upcoming + active on homepage; allow override via ?status=
    if (status) {
      query.status = status
    } else {
      query.status = { $in: ["upcoming", "active"] }
    }

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Event.countDocuments(query)
    const events = await Event
      .find(query)
      .sort({ startDate: 1 }) // soonest first for events
      .skip(skip)
      .limit(Number(limit))
      .select("-editHistory")

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      events,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/events/:id
router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select("-editHistory")
    if (!event) return res.status(404).json({ success: false, message: "Event not found" })
    res.json({ success: true, event })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  NEWS  — public, no auth required
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/news
// Returns all published news, newest first
// Query params: ?category=&limit=&page=
router.get("/news", async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query
    const query = { status: "published" }
    if (category) query.category = category

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await News.countDocuments(query)
    const news  = await News
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-editHistory -content") // lightweight list view

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      news,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/news/:id
router.get("/news/:id", async (req, res) => {
  try {
    const news = await News.findOne({ _id: req.params.id, status: "published" }).select("-editHistory")
    if (!news) return res.status(404).json({ success: false, message: "News not found" })
    res.json({ success: true, news })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router