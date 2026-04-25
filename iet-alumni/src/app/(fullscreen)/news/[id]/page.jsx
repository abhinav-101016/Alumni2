"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, User, Calendar, Newspaper, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/400-italic.css";

const proseStyles = `
  .prose-news, .prose-news * { color: inherit; }
  .prose-news {
    color: #1e293b !important;
    background: transparent !important;
  }
  .prose-news h1, .prose-news h2, .prose-news h3, .prose-news h4 {
    font-family: 'Playfair Display', serif;
    font-weight: 800;
    color: #0f172a !important;
    background: transparent !important;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  .prose-news h2 { font-size: 1.875rem; }
  .prose-news h3 { font-size: 1.5rem; }
  .prose-news p  { margin-bottom: 1.5rem; color: #1e293b !important; }
  .prose-news a  { color: #951114; text-decoration: underline; text-underline-offset: 3px; }
  .prose-news blockquote {
    border-left: 4px solid #951114;
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: #475569 !important;
    font-size: 1.25rem;
  }
  .prose-news ul, .prose-news ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
  .prose-news li { margin-bottom: 0.5rem; color: #1e293b !important; }
  .prose-news img { width: 100%; margin: 2rem 0; }
  .prose-news strong { font-weight: 700; color: #0f172a !important; }
  .prose-news hr { border-color: #e2e8f0; margin: 3rem 0; }
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
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
        {idx + 1} / {images.length}
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2">
        <X size={22} />
      </button>
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors p-3 border border-white/20 hover:border-white/60"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-5xl max-h-[85vh] w-full mx-16 md:mx-24"
          onClick={(e) => e.stopPropagation()}
        >
          <img src={images[idx].url} alt={images[idx].altText || `Image ${idx + 1}`} className="w-full max-h-[85vh] object-contain" />
          {images[idx].altText && (
            <p className="text-center text-xs text-white/40 mt-3 font-medium">{images[idx].altText}</p>
          )}
        </motion.div>
      </AnimatePresence>
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors p-3 border border-white/20 hover:border-white/60"
        >
          <ChevronRight size={20} />
        </button>
      )}
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
const ImageGallery = ({ images, isHero = false }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <>
        <div
          className={`relative overflow-hidden group cursor-zoom-in ${isHero ? "absolute inset-0" : "mb-12 aspect-[16/7]"}`}
          onClick={() => setLightboxIdx(0)}
        >
          <Image src={images[0].url} alt={images[0].altText || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
          {!isHero && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          {isHero && (
            <div style={{ background: "linear-gradient(to bottom, rgba(248,250,252,0.15), rgba(248,250,252,0.55), #f8fafc)" }} className="absolute inset-0" />
          )}
        </div>
        <AnimatePresence>
          {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
        </AnimatePresence>
      </>
    );
  }

  // 2 images
  if (images.length === 2) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 grid grid-cols-2 gap-2"
        >
          {images.map((img, i) => (
            <div key={i} className="relative overflow-hidden aspect-[4/3] group cursor-zoom-in" onClick={() => setLightboxIdx(i)}>
              <Image src={img.url} alt={img.altText || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
          {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
        </AnimatePresence>
      </>
    );
  }

  // 3+ — mosaic
  const [hero, ...rest] = images;
  const sideImages = rest.slice(0, 2);
  const overflow   = images.length - 3;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12"
      >
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="col-span-2 relative overflow-hidden aspect-[16/10] group cursor-zoom-in" onClick={() => setLightboxIdx(0)}>
            <Image src={hero.url} alt={hero.altText || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
              <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {sideImages.map((img, i) => {
              const globalIdx = i + 1;
              const isLast    = i === sideImages.length - 1 && overflow > 0;
              return (
                <div key={globalIdx} className="relative overflow-hidden flex-1 group cursor-zoom-in" onClick={() => setLightboxIdx(globalIdx)}>
                  <Image src={img.url} alt={img.altText || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300" />
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
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{images.length} photos — click to view</p>
          <button onClick={() => setLightboxIdx(0)} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#951114] border-b border-[#951114] hover:text-slate-900 hover:border-slate-900 transition-colors">
            View all →
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
      </AnimatePresence>
    </>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────── */
const NewsDetailPage = () => {
  const { id }   = useParams();
  const router   = useRouter();
  const [news, setNews]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchNews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/news/${id}`);
        if (!res.ok) throw new Error("News article not found");
        const data = await res.json();
        setNews(data.news);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const estimateReadTime = (content = "") => {
    const words = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.round(words / 200))} min read`;
  };

  const getImages = (news) => {
    if (news.images?.length > 0) return news.images;
    if (news.image?.url)         return [news.image];
    return [];
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }} className="flex items-center justify-center">
      <div className="space-y-4 w-full max-w-3xl px-6 animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-1/5" />
        <div className="h-12 bg-slate-200 rounded w-full" />
        <div className="h-12 bg-slate-200 rounded w-2/3" />
        <div className="h-72 bg-slate-200 rounded mt-8" />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#d8d3d3" }} className="flex flex-col items-center justify-center gap-4">
      <Newspaper size={40} className="text-slate-300" />
      <p className="text-slate-500 text-lg">{error}</p>
      <button onClick={() => router.back()} className="font-bold underline underline-offset-4 transition-colors" style={{ color: "#951114" }}>
        Go Back
      </button>
    </div>
  );

  if (!news) return null;

  const images = getImages(news);
  // Use first image as hero background; all images go into gallery below
  const heroImage = images[0] ?? null;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1e293b" }}>
      <style dangerouslySetInnerHTML={{ __html: proseStyles }} />

      {/* LIGHT HERO — always uses single first image as bg */}
      <div className="relative overflow-hidden" style={{ background: "#f8fafc" }}>
        {heroImage && (
          <div className="absolute inset-0">
            <Image src={heroImage.url} alt={heroImage.altText || news.title} fill className="object-cover opacity-80" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(248,250,252,0.15), rgba(248,250,252,0.55), #f8fafc)" }} />
          </div>
        )}

        {/* Nav */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 group transition-colors"
            style={{ color: "#475569" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#951114")}
            onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <span style={{ fontFamily: "Playfair Display, serif", color: "#334155" }} className="text-sm font-bold tracking-wide hidden md:block">
            IET Alumni — News
          </span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {news.category && (
              <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 mb-6" style={{ border: "1px solid #951114", color: "#951114" }}>
                {news.category}
              </span>
            )}
            <h1 style={{ fontFamily: "Playfair Display, serif", color: "#0f172a" }} className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight mb-8 max-w-3xl">
              {news.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2" style={{ color: "#475569" }}>
                <User size={13} />
                <span className="text-xs font-bold uppercase tracking-widest">{news.createdByName || "IET Alumni"}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: "#475569" }}>
                <Calendar size={13} />
                <span className="text-xs font-bold uppercase tracking-widest">{formatDate(news.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: "#475569" }}>
                <Clock size={13} />
                <span className="text-xs font-bold uppercase tracking-widest">{estimateReadTime(news.content)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ARTICLE BODY */}
      <article className="max-w-4xl mx-auto px-6 py-16" style={{ background: "#ffffff", color: "#1e293b" }}>

        {news.excerpt && (
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontFamily: "Playfair Display, serif", color: "#475569", borderLeft: "4px solid #951114", paddingLeft: "1.5rem" }}
            className="text-xl md:text-2xl italic leading-relaxed mb-12"
          >
            {news.excerpt}
          </motion.p>
        )}

        {/* ── IMAGE GALLERY (all images, below excerpt) ── */}
        <ImageGallery images={images} />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="prose-news"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "1.125rem", lineHeight: "1.9", color: "#1e293b", background: "transparent" }}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Footer */}
        <div className="mt-20 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ borderTop: "1px solid #e2e8f0" }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Published by</p>
            <p className="text-base font-bold" style={{ color: "#0f172a" }}>{news.createdByName || "IET Alumni Network"}</p>
            {news.lastEditedAt && (
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Last updated: {formatDate(news.lastEditedAt)}</p>
            )}
          </div>
          <button
            onClick={() => router.push("/news")}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300"
            style={{ background: "#951114", color: "#ffffff" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#7a0d0f")}
            onMouseLeave={e => (e.currentTarget.style.background = "#951114")}
          >
            <ArrowLeft size={13} /> All News
          </button>
        </div>
      </article>
    </div>
  );
};

export default NewsDetailPage;