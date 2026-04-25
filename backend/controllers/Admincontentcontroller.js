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

// ─── Upload all files from req.files["images"] to a Cloudinary folder ────────
// Returns an array of { url, publicId, altText } objects.
const uploadManyToCloudinary = async (files, folder, altText = "") => {
  if (!files || files.length === 0) return []
  const results = await Promise.all(
    files.map(f => uploadToCloudinary(f.buffer, folder))
  )
  return results.map(r => ({
    url:       r.secure_url,
    publicId:  r.public_id,
    altText,
  }))
}

// ─── Delete a list of Cloudinary publicIds (fire-and-forget safe) ─────────────
const destroyMany = (publicIds) =>
  Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id).catch(() => {})))

// ─── helper: build editHistory entry ─────────────────────────────────────────
const buildHistoryEntry = (admin, oldDoc, changedFields, note) => {
  const changes = {}
  changedFields.forEach((field) => {
    if (field === "images") {
      // Store the previous image URLs for the history record
      changes.images = (oldDoc.images || []).map(img => img.url)
    } else if (oldDoc[field] !== undefined) {
      changes[field] = oldDoc[field]
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

// ─── Auto-compute event status from dates ────────────────────────────────────
const computeEventStatus = (startDate, endDate) => {
  const now   = new Date()
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date(startDate)
  end.setHours(23, 59, 59, 999)
  if (now < start)                return "upcoming"
  if (now >= start && now <= end) return "ongoing"
  return "expired"
}

// ─── Recompute status on a list of event plain objects ───────────────────────
const withLiveStatus = (events) =>
  events.map((ev) => {
    const obj  = ev.toObject ? ev.toObject() : { ...ev }
    obj.status = computeEventStatus(obj.startDate, obj.endDate)
    return obj
  })

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOG
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/blogs
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, status } = req.body
    const admin = req.user

    const safeStatus = ["draft", "published"].includes(status) ? status : "draft"

    // Upload all provided images; first one is the cover
    const images = await uploadManyToCloudinary(
      req.files?.images ?? [],
      "iet-alumni/blogs",
      title
    )

    const blog = await Blog.create({
      title, excerpt, content, category,
      tags:           tags ? JSON.parse(tags) : [],
      status:         safeStatus,
      images,                                    // ← array
      image:          images[0] ?? {},           // ← backward-compat cover field
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
    const { title, excerpt, content, category, tags, status, note, removeImages } = req.body
    const admin = req.user

    const safeStatus = status
      ? ["draft", "published"].includes(status) ? status : undefined
      : undefined

    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" })

    const changedFields = []
    if (title      && title      !== blog.title)      changedFields.push("title")
    if (excerpt    && excerpt    !== blog.excerpt)    changedFields.push("excerpt")
    if (content    && content    !== blog.content)    changedFields.push("content")
    if (category   && category   !== blog.category)   changedFields.push("category")
    if (safeStatus && safeStatus !== blog.status)     changedFields.push("status")

    // ── Remove images the editor explicitly deleted ──────────────────────────
    if (removeImages) {
      const ids = JSON.parse(removeImages)            // array of publicIds
      if (ids.length > 0) {
        changedFields.push("images")
        await destroyMany(ids)
        blog.images = (blog.images || []).filter(img => !ids.includes(img.publicId))
      }
    }

    // ── Upload new images and append them ────────────────────────────────────
    const newFiles = req.files?.images ?? []
    if (newFiles.length > 0) {
      if (!changedFields.includes("images")) changedFields.push("images")
      const uploaded = await uploadManyToCloudinary(
        newFiles,
        "iet-alumni/blogs",
        title || blog.title
      )
      blog.images = [...(blog.images || []), ...uploaded]
    }

    // Keep backward-compat cover field in sync with first image
    if (blog.images?.length > 0) {
      blog.image = blog.images[0]
    }

    if (changedFields.length > 0) {
      blog.editHistory.push(buildHistoryEntry(admin, blog, changedFields, note))
    }

    if (title)      blog.title      = title
    if (excerpt)    blog.excerpt    = excerpt
    if (content)    blog.content    = content
    if (category)   blog.category   = category
    if (tags)       blog.tags       = JSON.parse(tags)
    if (safeStatus) blog.status     = safeStatus

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
    await destroyMany((blog.images || []).map(img => img.publicId).filter(Boolean))
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
  try {
    const {
      title, description, startDate, endDate, startTime, endTime,
      location, isVirtual, virtualUrl, registrationUrl,
      registrationDeadline, maxAttendees,
    } = req.body
    const admin = req.user

    const status = computeEventStatus(startDate, endDate)

    const images = await uploadManyToCloudinary(
      req.files?.images ?? [],
      "iet-alumni/events",
      title
    )

    const event = await Event.create({
      title, description, startDate, endDate, startTime, endTime,
      location, isVirtual: isVirtual === "true", virtualUrl,
      registrationUrl, registrationDeadline, maxAttendees,
      status,
      images,
      image: images[0] ?? {},
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
      registrationDeadline, maxAttendees, note, removeImages,
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

    if (removeImages) {
      const ids = JSON.parse(removeImages)
      if (ids.length > 0) {
        changedFields.push("images")
        await destroyMany(ids)
        event.images = (event.images || []).filter(img => !ids.includes(img.publicId))
      }
    }

    const newFiles = req.files?.images ?? []
    if (newFiles.length > 0) {
      if (!changedFields.includes("images")) changedFields.push("images")
      const uploaded = await uploadManyToCloudinary(
        newFiles,
        "iet-alumni/events",
        title || event.title
      )
      event.images = [...(event.images || []), ...uploaded]
    }

    if (event.images?.length > 0) {
      event.image = event.images[0]
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
    if (registrationUrl)      event.registrationUrl      = registrationUrl
    if (registrationDeadline) event.registrationDeadline = registrationDeadline
    if (maxAttendees)         event.maxAttendees          = maxAttendees
    if (isVirtual !== undefined) event.isVirtual = isVirtual === "true"

    const resolvedStart = startDate || event.startDate
    const resolvedEnd   = endDate   || event.endDate
    event.status = computeEventStatus(resolvedStart, resolvedEnd)

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
    await destroyMany((event.images || []).map(img => img.publicId).filter(Boolean))
    await event.deleteOne()
    res.json({ success: true, message: "Event deleted" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/events
export const getAllEventsAdmin = async (req, res) => {
  try {
    const raw    = await Event.find().sort({ startDate: -1 }).select("-editHistory")
    const events = withLiveStatus(raw)
    res.json({ success: true, events })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/events/:id
export const getEventAdmin = async (req, res) => {
  try {
    const raw = await Event.findById(req.params.id)
    if (!raw) return res.status(404).json({ success: false, message: "Event not found" })
    const event  = raw.toObject()
    event.status = computeEventStatus(event.startDate, event.endDate)
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

    const safeStatus = ["draft", "published"].includes(status) ? status : "draft"

    const images = await uploadManyToCloudinary(
      req.files?.images ?? [],
      "iet-alumni/news",
      title
    )

    const news = await News.create({
      title, excerpt, content, category,
      status: safeStatus,
      images,
      image: images[0] ?? {},
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
    const { title, excerpt, content, category, status, note, removeImages } = req.body
    const admin = req.user

    const safeStatus = status
      ? ["draft", "published"].includes(status) ? status : undefined
      : undefined

    const news = await News.findById(req.params.id)
    if (!news) return res.status(404).json({ success: false, message: "News not found" })

    const changedFields = []
    if (title      && title      !== news.title)      changedFields.push("title")
    if (excerpt    && excerpt    !== news.excerpt)    changedFields.push("excerpt")
    if (content    && content    !== news.content)    changedFields.push("content")
    if (category   && category   !== news.category)   changedFields.push("category")
    if (safeStatus && safeStatus !== news.status)     changedFields.push("status")

    if (removeImages) {
      const ids = JSON.parse(removeImages)
      if (ids.length > 0) {
        changedFields.push("images")
        await destroyMany(ids)
        news.images = (news.images || []).filter(img => !ids.includes(img.publicId))
      }
    }

    const newFiles = req.files?.images ?? []
    if (newFiles.length > 0) {
      if (!changedFields.includes("images")) changedFields.push("images")
      const uploaded = await uploadManyToCloudinary(
        newFiles,
        "iet-alumni/news",
        title || news.title
      )
      news.images = [...(news.images || []), ...uploaded]
    }

    if (news.images?.length > 0) {
      news.image = news.images[0]
    }

    if (changedFields.length > 0) {
      news.editHistory.push(buildHistoryEntry(admin, news, changedFields, note))
    }

    if (title)      news.title      = title
    if (excerpt)    news.excerpt    = excerpt
    if (content)    news.content    = content
    if (category)   news.category   = category
    if (safeStatus) news.status     = safeStatus

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
    await destroyMany((news.images || []).map(img => img.publicId).filter(Boolean))
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