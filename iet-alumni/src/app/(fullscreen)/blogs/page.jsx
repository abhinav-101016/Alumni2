"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import "@fontsource/playfair-display/700.css";

const STATUS_STYLES = {
  published: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  draft:     { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"  },
};

// Guests only see published content
const PUBLIC_STATUSES    = ["published"];
// Logged-in users can filter by all statuses
const LOGGED_IN_FILTERS  = ["all"];
const PUBLIC_FILTERS     = ["all"];  // guests only have one effective view

const SkeletonRow = () => (
  <div className="flex gap-6 md:gap-10 items-start animate-pulse border-b border-slate-100 pb-10">
    <div className="flex-shrink-0 w-36 h-28 md:w-44 md:h-32 bg-slate-100" />
    <div className="flex-grow space-y-3 py-1">
      <div className="h-3 bg-slate-100 rounded w-1/5" />
      <div className="h-6 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/4 mt-3" />
    </div>
  </div>
);

export default function BlogsPage() {
  const router = useRouter();
  const [blogs,      setBlogs]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filter,     setFilter]     = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady,  setAuthReady]  = useState(false);

  // ── Auth check ──────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`,
          { credentials: "include" }
        );
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setAuthReady(true);
      }
    };
    checkAuth();
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authReady) return;
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs`);
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [authReady]);

  // ── Visibility: guests only see published, never draft/archived ─────────
  const visible  = isLoggedIn
    ? blogs
    : blogs.filter(b => PUBLIC_STATUSES.includes(b.status));

  const filtered = filter === "all"
    ? visible
    : visible.filter(b => b.status === filter);

  const FILTERS = isLoggedIn ? LOGGED_IN_FILTERS : PUBLIC_FILTERS;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* NAV */}
      <div className="sticky top-0 z-50 bg-[#fafaf8]/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#951114] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <span style={{ fontFamily: "Playfair Display, serif" }} className="text-sm font-bold text-slate-400 hidden md:block">IET Alumni</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* HEADING */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#951114] mb-3">Alumni Network</p>
          <h1 style={{ fontFamily: "Playfair Display, serif" }} className="text-4xl md:text-6xl font-black uppercase text-slate-900 mb-4 border-b-4 border-[#951114] pb-4 w-fit">
            All Blogs
          </h1>
          <p className="text-slate-500 text-base mb-10">Stories, insights, and perspectives from the IET alumni community.</p>
        </motion.div>

        {/* FILTERS — only shown to logged-in users since guests only see published */}
        {isLoggedIn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 mb-12">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-200 ${filter === f ? "bg-[#951114] border-[#951114] text-white" : "border-slate-300 text-slate-500 hover:border-slate-900 hover:text-slate-900"}`}>
                {f}
              </button>
            ))}
          </motion.div>
        )}
        {/* Spacer for guests */}
        {!isLoggedIn && authReady && <div className="mb-12" />}

        {/* LOADING */}
        {(loading || !authReady) && <div className="space-y-10">{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</div>}

        {/* ERROR */}
        {error && !loading && <p className="text-sm text-red-500 font-medium">Could not load blogs: {error}</p>}

        {/* EMPTY */}
        {!loading && authReady && !error && filtered.length === 0 && (
          <div className="py-20 text-center">
            <BookOpen size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-base">No blogs found{filter !== "all" ? ` for "${filter}"` : ""}.</p>
          </div>
        )}

        {/* LIST */}
        {!loading && authReady && !error && filtered.length > 0 && (
          <div className="divide-y divide-slate-100">
            {filtered.map((blog, idx) => {
              const ss = STATUS_STYLES[blog.status] || STATUS_STYLES.published;
              const dateStr = blog.publishedAt || blog.createdAt;

              return (
                <motion.div key={blog._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="flex flex-col sm:flex-row gap-6 md:gap-10 items-start group py-10">

                  {/* THUMBNAIL */}
                  <a href={`/blogs/${blog._id}`} className="flex-shrink-0 w-full sm:w-44 md:w-52 h-32 md:h-36 overflow-hidden relative bg-slate-100">
                    {blog.image?.url ? (
                      <Image src={blog.image.url} alt={blog.image.altText || blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen size={28} className="text-slate-300" /></div>
                    )}
                  </a>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-between flex-grow py-1 min-w-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Status badge only visible to logged-in users */}
                        {isLoggedIn && (
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border ${ss.bg} ${ss.text} ${ss.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />{blog.status}
                          </span>
                        )}
                        {blog.category && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 px-2.5 py-1">{blog.category}</span>
                        )}
                      </div>

                      <a href={`/blogs/${blog._id}`} className="block">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight group-hover:text-[#951114] transition-colors">{blog.title}</h3>
                      </a>

                      {blog.excerpt && (
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                      )}
                    </div>

                    <div className="pt-4 flex items-center gap-4 flex-wrap">
                      {blog.createdByName && <span className="text-xs font-bold text-slate-500">By {blog.createdByName}</span>}
                      {dateStr && <span className="text-xs text-slate-400">{formatDate(dateStr)}</span>}
                      <a href={`/blogs/${blog._id}`}
                        className="ml-auto text-[10px] font-black uppercase tracking-[0.2em] text-[#951114] border-b-2 border-[#951114] hover:text-slate-900 hover:border-slate-900 transition-colors">
                        Read More →
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}