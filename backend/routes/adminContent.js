// 📁 src/routes/adminContent.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Blog from "../models/Blog.js";
import Event from "../models/Event.js";
import News from "../models/News.js";

const router = express.Router();

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { tab = "blogs", page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [blogCount, eventCount, newsCount] = await Promise.all([
      Blog.countDocuments(),
      Event.countDocuments(),
      News.countDocuments(),
    ]);

    let items = [], total = 0;
    const filter = status ? { status } : {};

    if (tab === "blogs") {
      [items, total] = await Promise.all([
        Blog.find(filter)
          .select("title slug status category createdBy createdByName createdAt publishedAt image excerpt")
          .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
        Blog.countDocuments(filter),
      ]);
    } else if (tab === "events") {
      [items, total] = await Promise.all([
        Event.find(filter)
          .select("title slug status startDate endDate location isVirtual createdBy createdByName createdAt image description")
          .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
        Event.countDocuments(filter),
      ]);
    } else if (tab === "news") {
      [items, total] = await Promise.all([
        News.find(filter)
          .select("title slug status category createdBy createdByName createdAt publishedAt image excerpt")
          .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
        News.countDocuments(filter),
      ]);
    }

    return res.json({
      success: true,
      counts: { blogs: blogCount, events: eventCount, news: newsCount },
      items,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error("Admin content fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE — only the creator can delete their own content
router.delete("/:tab/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { tab, id } = req.params;
    const userId = req.user.id;

    let Model;
    if (tab === "blogs")       Model = Blog;
    else if (tab === "events") Model = Event;
    else if (tab === "news")   Model = News;
    else return res.status(400).json({ success: false, message: "Invalid tab" });

    const item = await Model.findById(id).lean();
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (String(item.createdBy) !== String(userId)) {
      return res.status(403).json({ success: false, message: "You can only delete your own content" });
    }

    await Model.findByIdAndDelete(id);
    return res.json({ success: true, message: `${tab.slice(0, -1)} deleted successfully` });
  } catch (err) {
    console.error("Admin content delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;