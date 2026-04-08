"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, User, Calendar, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
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
  .prose-news a  { color: #2563eb; text-decoration: underline; text-underline-offset: 3px; }
  .prose-news blockquote {
    border-left: 4px solid #2563eb;
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
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });

  const estimateReadTime = (content = "") => {
    const words = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.round(words / 200))} min read`;
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
    <div style={{ minHeight: "100vh", background: "#ffffff" }} className="flex flex-col items-center justify-center gap-4">
      <Newspaper size={40} className="text-slate-300" />
      <p className="text-slate-500 text-lg">{error}</p>
      <button onClick={() => router.back()} className="text-blue-600 font-bold underline underline-offset-4">Go Back</button>
    </div>
  );

  if (!news) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1e293b" }}>

      {/* Plain <style> tag — works in App Router unlike styled-jsx */}
      <style dangerouslySetInnerHTML={{ __html: proseStyles }} />

      {/* DARK HERO — intentionally dark, uses inline styles so globals can't bleed in */}
      <div className="relative overflow-hidden" style={{ background: "#020617" }}>
        {news.image?.url && (
          <div className="absolute inset-0">
            <Image src={news.image.url} alt={news.image.altText || news.title} fill className="object-cover opacity-20" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(2,6,23,0.6), rgba(2,6,23,0.85), #020617)" }} />
          </div>
        )}

        {/* Nav */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 group transition-colors" style={{ color: "#94a3b8" }}>
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <span style={{ fontFamily: "Playfair Display, serif", color: "#64748b" }} className="text-sm font-bold tracking-wide hidden md:block">
            IET Alumni — News
          </span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {news.category && (
              <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 mb-6" style={{ border: "1px solid #60a5fa", color: "#60a5fa" }}>
                {news.category}
              </span>
            )}
            <h1 style={{ fontFamily: "Playfair Display, serif", color: "#ffffff" }} className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight mb-8 max-w-3xl">
              {news.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2" style={{ color: "#94a3b8" }}>
                <User size={13} />
                <span className="text-xs font-bold uppercase tracking-widest">{news.createdByName || "IET Alumni"}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: "#94a3b8" }}>
                <Calendar size={13} />
                <span className="text-xs font-bold uppercase tracking-widest">{formatDate(news.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: "#94a3b8" }}>
                <Clock size={13} />
                <span className="text-xs font-bold uppercase tracking-widest">{estimateReadTime(news.content)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ARTICLE BODY — explicit white background via inline style */}
      <article className="max-w-4xl mx-auto px-6 py-16" style={{ background: "#ffffff", color: "#1e293b" }}>

        {news.excerpt && (
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontFamily: "Playfair Display, serif", color: "#475569", borderLeft: "4px solid #2563eb", paddingLeft: "1.5rem" }}
            className="text-xl md:text-2xl italic leading-relaxed mb-12"
          >
            {news.excerpt}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="prose-news"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "1.125rem", lineHeight: "1.9", color: "#1e293b", background: "transparent" }}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

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
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 hover:bg-[#951114]"
            style={{ background: "#020617", color: "#ffffff" }}
          >
            <ArrowLeft size={13} /> All News
          </button>
        </div>
      </article>
    </div>
  );
};

export default NewsDetailPage;