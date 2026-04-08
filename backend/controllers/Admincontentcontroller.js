// 📁 backend/controllers/adminContentController.js
import Blog  from "../models/Blog.js"
import Event from "../models/Event.js"
import News  from "../models/News.js"
import cloudinary from "../config/cloudinary.js"
import streamifier from "streamifier"

// ─── Cloudinary upload helper ─────────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

// ─── helper: build editHistory entry ─────────────────────────────────────────
const buildHistoryEntry = (admin, oldDoc, changedFields, note) => {
  const changes = {}
  changedFields.forEach((field) => {
    if (oldDoc[field] !== undefined) {
      changes[field] = field === "image" ? oldDoc.image?.url : oldDoc[field]
    }
  })
  return {
    editedBy:     admin.id,
    editedByName: admin.name || admin.email,
    editedAt:     new Date(),
    changes,
    note: note || "",
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOG
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/blogs
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, status } = req.body
    const admin = req.user

    let image = {}
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/blogs")
      image = { url: result.secure_url, publicId: result.public_id, altText: title }
    }

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      category,
      tags: tags ? JSON.parse(tags) : [],
      status: status || "draft",
      image,
      createdBy:      admin.id,
      createdByName:  admin.name || admin.email,
      createdByEmail: admin.email,
    })

    res.status(201).json({ success: true, message: "Blog created", blog })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/admin/blogs/:id
export const updateBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, status, note } = req.body
    const admin = req.user

    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" })

    const changedFields = []
    if (title    && title    !== blog.title)    changedFields.push("title")
    if (excerpt  && excerpt  !== blog.excerpt)  changedFields.push("excerpt")
    if (content  && content  !== blog.content)  changedFields.push("content")
    if (category && category !== blog.category) changedFields.push("category")
    if (status   && status   !== blog.status)   changedFields.push("status")

    if (req.file) {
      if (blog.image?.publicId) await cloudinary.uploader.destroy(blog.image.publicId)
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/blogs")
      changedFields.push("image")
      blog.image = { url: result.secure_url, publicId: result.public_id, altText: title || blog.title }
    }

    if (changedFields.length > 0) {
      blog.editHistory.push(buildHistoryEntry(admin, blog, changedFields, note))
    }

    if (title)    blog.title    = title
    if (excerpt)  blog.excerpt  = excerpt
    if (content)  blog.content  = content
    if (category) blog.category = category
    if (tags)     blog.tags     = JSON.parse(tags)
    if (status)   blog.status   = status

    blog.lastEditedBy     = admin.id
    blog.lastEditedByName = admin.name || admin.email
    blog.lastEditedAt     = new Date()

    await blog.save()
    res.json({ success: true, message: "Blog updated", blog })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/admin/blogs/:id
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" })

    if (blog.image?.publicId) await cloudinary.uploader.destroy(blog.image.publicId)
    await blog.deleteOne()
    res.json({ success: true, message: "Blog deleted" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/blogs
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).select("-editHistory")
    res.json({ success: true, blogs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/blogs/:id
export const getBlogAdmin = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" })
    res.json({ success: true, blog })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENT
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/events
export const createEvent = async (req, res) => {
  console.log("req.user →", req.user) 
  try {
    const {
      title, description, startDate, endDate, startTime, endTime,
      location, isVirtual, virtualUrl, registrationUrl,
      registrationDeadline, maxAttendees, status
    } = req.body
    const admin = req.user

    let image = {}
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/events")
      image = { url: result.secure_url, publicId: result.public_id, altText: title }
    }

    const event = await Event.create({
      title, description, startDate, endDate, startTime, endTime,
      location, isVirtual: isVirtual === "true", virtualUrl,
      registrationUrl, registrationDeadline, maxAttendees,
      status: status || "upcoming",
      image,
      createdBy:      admin.id,
      createdByName:  admin.name || admin.email,
      createdByEmail: admin.email,
    })

    res.status(201).json({ success: true, message: "Event created", event })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/admin/events/:id
export const updateEvent = async (req, res) => {
  try {
    const {
      title, description, startDate, endDate, startTime, endTime,
      location, isVirtual, virtualUrl, registrationUrl,
      registrationDeadline, maxAttendees, status, note
    } = req.body
    const admin = req.user

    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: "Event not found" })

    const changedFields = []
    if (title       && title       !== event.title)       changedFields.push("title")
    if (description && description !== event.description) changedFields.push("description")
    if (location    && location    !== event.location)    changedFields.push("location")
    if (startDate   && String(startDate) !== String(event.startDate)) changedFields.push("startDate")
    if (endDate     && String(endDate)   !== String(event.endDate))   changedFields.push("endDate")
    if (startTime   && startTime   !== event.startTime)   changedFields.push("startTime")
    if (endTime     && endTime     !== event.endTime)     changedFields.push("endTime")
    if (status      && status      !== event.status)      changedFields.push("status")

    if (req.file) {
      if (event.image?.publicId) await cloudinary.uploader.destroy(event.image.publicId)
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/events")
      changedFields.push("image")
      event.image = { url: result.secure_url, publicId: result.public_id, altText: title || event.title }
    }

    if (changedFields.length > 0) {
      event.editHistory.push(buildHistoryEntry(admin, event, changedFields, note))
    }

    if (title)       event.title       = title
    if (description) event.description = description
    if (location)    event.location    = location
    if (startDate)   event.startDate   = startDate
    if (endDate)     event.endDate     = endDate
    if (startTime)   event.startTime   = startTime
    if (endTime)     event.endTime     = endTime
    if (virtualUrl)  event.virtualUrl  = virtualUrl
    if (registrationUrl) event.registrationUrl = registrationUrl
    if (registrationDeadline) event.registrationDeadline = registrationDeadline
    if (maxAttendees) event.maxAttendees = maxAttendees
    if (isVirtual !== undefined) event.isVirtual = isVirtual === "true"
    if (status)      event.status      = status

    event.lastEditedBy     = admin.id
    event.lastEditedByName = admin.name || admin.email
    event.lastEditedAt     = new Date()

    await event.save()
    res.json({ success: true, message: "Event updated", event })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/admin/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: "Event not found" })
    if (event.image?.publicId) await cloudinary.uploader.destroy(event.image.publicId)
    await event.deleteOne()
    res.json({ success: true, message: "Event deleted" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/events
export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: -1 }).select("-editHistory")
    res.json({ success: true, events })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/events/:id
export const getEventAdmin = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: "Event not found" })
    res.json({ success: true, event })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NEWS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/news
export const createNews = async (req, res) => {
  try {
    const { title, excerpt, content, category, status } = req.body
    const admin = req.user

    let image = {}
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/news")
      image = { url: result.secure_url, publicId: result.public_id, altText: title }
    }

    const news = await News.create({
      title, excerpt, content, category,
      status: status || "draft",
      image,
      createdBy:      admin.id,
      createdByName:  admin.name || admin.email,
      createdByEmail: admin.email,
    })

    res.status(201).json({ success: true, message: "News created", news })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/admin/news/:id
export const updateNews = async (req, res) => {
  try {
    const { title, excerpt, content, category, status, note } = req.body
    const admin = req.user

    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ success: false, message: "News not found" })

    const changedFields = []
    if (title    && title    !== news.title)    changedFields.push("title")
    if (excerpt  && excerpt  !== news.excerpt)  changedFields.push("excerpt")
    if (content  && content  !== news.content)  changedFields.push("content")
    if (category && category !== news.category) changedFields.push("category")
    if (status   && status   !== news.status)   changedFields.push("status")

    if (req.file) {
      if (news.image?.publicId) await cloudinary.uploader.destroy(news.image.publicId)
      const result = await uploadToCloudinary(req.file.buffer, "iet-alumni/news")
      changedFields.push("image")
      news.image = { url: result.secure_url, publicId: result.public_id, altText: title || news.title }
    }

    if (changedFields.length > 0) {
      news.editHistory.push(buildHistoryEntry(admin, news, changedFields, note))
    }

    if (title)    news.title    = title
    if (excerpt)  news.excerpt  = excerpt
    if (content)  news.content  = content
    if (category) news.category = category
    if (status)   news.status   = status

    news.lastEditedBy     = admin.id
    news.lastEditedByName = admin.name || admin.email
    news.lastEditedAt     = new Date()

    await news.save()
    res.json({ success: true, message: "News updated", news })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/admin/news/:id
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ success: false, message: "News not found" })
    if (news.image?.publicId) await cloudinary.uploader.destroy(news.image.publicId)
    await news.deleteOne()
    res.json({ success: true, message: "News deleted" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/news
export const getAllNewsAdmin = async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 }).select("-editHistory")
    res.json({ success: true, news: newsList })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/news/:id
export const getNewsAdmin = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ success: false, message: "News not found" })
    res.json({ success: true, news })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}