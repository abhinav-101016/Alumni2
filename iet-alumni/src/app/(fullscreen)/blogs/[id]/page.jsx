"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Tag, User, Calendar, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/400-italic.css";

const proseStyles = `
  .prose-blog h1, .prose-blog h2, .prose-blog h3, .prose-blog h4 {
    font-family: 'Playfair Display', serif;
    font-weight: 800;
    color: #0f172a;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  .prose-blog h2 { font-size: 1.875rem; }
  .prose-blog h3 { font-size: 1.5rem; }
  .prose-blog p  { margin-bottom: 1.5rem; }
  .prose-blog a  { color: #951114; text-decoration: underline; text-underline-offset: 3px; }
  .prose-blog blockquote {
    border-left: 4px solid #951114;
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: #475569;
    font-size: 1.25rem;
  }
  .prose-blog ul, .prose-blog ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
  .prose-blog li { margin-bottom: 0.5rem; }
  .prose-blog img { width: 100%; margin: 2rem 0; }
  .prose-blog strong { font-weight: 700; color: #0f172a; }
  .prose-blog hr { border-color: #e2e8f0; margin: 3rem 0; }
  .prose-blog pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 1.5rem;
    overflow-x: auto;
    margin: 2rem 0;
    font-size: 0.9rem;
  }
  .prose-blog code {
    background: #f1f5f9;
    padding: 0.15rem 0.4rem;
    font-size: 0.875rem;
    color: #951114;
  }
`;

/* ─── Lightbox ──────────────────────────────────────────────────────────── */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
        {idx + 1} / {images.length}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2"
      >
        <X size={22} />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors p-3 border border-white/20 hover:border-white/60"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-5xl max-h-[85vh] w-full mx-16 md:mx-24"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[idx].url}
            alt={images[idx].altText || `Image ${idx + 1}`}
            className="w-full max-h-[85vh] object-contain"
          />
          {images[idx].altText && (
            <p className="text-center text-xs text-white/40 mt-3 font-medium">{images[idx].altText}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors p-3 border border-white/20 hover:border-white/60"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Filmstrip thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`relative w-12 h-8 overflow-hidden transition-all duration-200 ${i === idx ? "ring-2 ring-[#951114] opacity-100" : "opacity-40 hover:opacity-70"}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ─── Image Gallery ─────────────────────────────────────────────────────── */
const ImageGallery = ({ images }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (!images || images.length === 0) return null;

  // Single image — full-width cover
  if (images.length === 1) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-14 overflow-hidden relative group cursor-zoom-in"
          onClick={() => setLightboxIdx(0)}
        >
          <img
            src={images[0].url}
            alt={images[0].altText || ""}
            className="w-full max-h-[520px] object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </motion.div>

        <AnimatePresence>
          {lightboxIdx !== null && (
            <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // 2 images — side by side
  if (images.length === 2) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-14 grid grid-cols-2 gap-2"
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden aspect-[4/3] group cursor-zoom-in"
              onClick={() => setLightboxIdx(i)}
            >
              <img src={img.url} alt={img.altText || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="absolute bottom-2 right-2 text-[9px] font-black tracking-widest text-white/70 bg-black/40 px-1.5 py-0.5">
                {i + 1}/{images.length}
              </span>
            </div>
          ))}
        </motion.div>

        <AnimatePresence>
          {lightboxIdx !== null && (
            <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // 3+ images — editorial mosaic: big hero + side stack
  const [hero, ...rest] = images;
  const sideImages = rest.slice(0, 2); // show max 2 in side column
  const overflow   = images.length - 3; // remaining count if > 3

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-14"
      >
        {/* Mosaic grid */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {/* Hero — spans 2 cols */}
          <div
            className="col-span-2 relative overflow-hidden aspect-[16/10] group cursor-zoom-in"
            onClick={() => setLightboxIdx(0)}
          >
            <img src={hero.url} alt={hero.altText || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
              <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-2">
            {sideImages.map((img, i) => {
              const globalIdx = i + 1;
              const isLast    = i === sideImages.length - 1 && overflow > 0;
              return (
                <div
                  key={globalIdx}
                  className="relative overflow-hidden flex-1 group cursor-zoom-in"
                  onClick={() => setLightboxIdx(globalIdx)}
                >
                  <img src={img.url} alt={img.altText || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300" />

                  {/* "+N more" overlay on the last visible side image */}
                  {isLast && (
                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">+{overflow}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/70 mt-1">more</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Caption row */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            {images.length} photos — click to view
          </p>
          <button
            onClick={() => setLightboxIdx(0)}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#951114] border-b border-[#951114] hover:text-slate-900 hover:border-slate-900 transition-colors"
          >
            View all →
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────── */
const BlogDetailPage = () => {
  const { id }   = useParams();
  const router   = useRouter();
  const [blog, setBlog]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs/${id}`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        setBlog(data.blog);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });

  const estimateReadTime = (content = "") => {
    const words = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.round(words / 200))} min read`;
  };

  // Normalise: prefer images[], fall back to [image]
  const getImages = (blog) => {
    if (blog.images?.length > 0) return blog.images;
    if (blog.image?.url)         return [blog.image];
    return [];
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="space-y-4 w-full max-w-2xl px-6 animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded w-full" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-64 bg-slate-200 rounded mt-8" />
        <div className="space-y-3 mt-8">
          {["w-4/5", "w-11/12", "w-3/4", "w-5/6", "w-10/12", "w-4/6"].map((w, i) => (
            <div key={i} className={`h-4 bg-slate-100 rounded ${w}`} />
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500 text-lg">{error}</p>
      <button onClick={() => router.back()} className="text-[#951114] font-bold underline underline-offset-4">
        Go Back
      </button>
    </div>
  );

  if (!blog) return null;

  const images = getImages(blog);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <style dangerouslySetInnerHTML={{ __html: proseStyles }} />

      {/* NAV */}
      <div className="sticky top-0 z-50 bg-[#fafaf8]/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#951114] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <span style={{ fontFamily: "Playfair Display, serif" }} className="text-sm font-bold text-slate-400 tracking-wide hidden md:block">
            IET Alumni — Blogs
          </span>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-16">

        {/* Category + tags + read time */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-wrap items-center gap-4 mb-6">
          {blog.category && (
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#951114] text-white px-3 py-1.5">
              {blog.category}
            </span>
          )}
          {blog.tags?.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2.5 py-1">
              <Tag size={9} />{tag}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Clock size={10} />{estimateReadTime(blog.content)}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
          style={{ fontFamily: "Playfair Display, serif" }}
          className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6"
        >
          {blog.title}
        </motion.h1>

        {/* Excerpt */}
        {blog.excerpt && (
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontFamily: "Playfair Display, serif" }}
            className="text-xl md:text-2xl text-slate-500 italic leading-relaxed mb-10 border-l-4 border-[#951114] pl-6"
          >
            {blog.excerpt}
          </motion.p>
        )}

        {/* Meta bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap items-center gap-6 py-5 border-y border-slate-200 mb-12"
        >
          <div className="flex items-center gap-2 text-slate-500">
            <User size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">{blog.createdByName || "IET Alumni"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">{formatDate(blog.createdAt)}</span>
          </div>
          {blog.lastEditedAt && blog.lastEditedAt !== blog.createdAt && (
            <span className="text-xs text-slate-400">Updated {formatDate(blog.lastEditedAt)}</span>
          )}
        </motion.div>

        {/* ── IMAGE GALLERY ── */}
        <ImageGallery images={images} />

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="prose-blog"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "1.125rem", lineHeight: "1.9", color: "#1e293b" }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Footer */}
        <div className="mt-20 pt-8 border-t-4 border-[#951114] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Written by</p>
            <p className="text-base font-bold text-slate-900">{blog.createdByName || "IET Alumni Network"}</p>
          </div>
          <button
            onClick={() => router.push("/blogs")}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#951114] text-[#951114] text-xs font-black uppercase tracking-widest hover:bg-[#951114] hover:text-white transition-all duration-300"
          >
            <ArrowLeft size={13} /> All Blogs
          </button>
        </div>
      </article>
    </div>
  );
};

export default BlogDetailPage;