"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Tag, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";
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

  if (loading) return (
  <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
    <div className="space-y-4 w-full max-w-2xl px-6 animate-pulse">
      <div className="h-3 bg-slate-200 rounded w-1/4" />
      <div className="h-10 bg-slate-200 rounded w-full" />
      <div className="h-10 bg-slate-200 rounded w-3/4" />
      <div className="h-64 bg-slate-200 rounded mt-8" />
      <div className="space-y-3 mt-8">
        {/* ✅ Fixed — stable widths, no Math.random() */}
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

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Plain <style> tag — works in Next.js App Router, unlike styled-jsx */}
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

        {/* Hero image */}
        {blog.image?.url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-14 overflow-hidden"
          >
            <img src={blog.image.url} alt={blog.image.altText || blog.title} className="w-full max-h-[520px] object-cover" />
          </motion.div>
        )}

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