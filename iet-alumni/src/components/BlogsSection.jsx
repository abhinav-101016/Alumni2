"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import "@fontsource/playfair-display/700.css";

const BlogsSection = () => {
  const [blogs, setBlogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs`);
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();

        // Show only published blogs, latest 3
        const published = (data.blogs || [])
          .filter((b) => b.status === "published")
          .slice(0, 3);

        setBlogs(published);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const estimateReadTime = (content = "") => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
  };

  return (
    <section id="blogs" className="bg-white py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-[#951114] pb-4 mb-14">
          <h2
            style={{ fontFamily: "Playfair Display, serif" }}
            className="text-3xl md:text-5xl font-black uppercase text-slate-900"
          >
            Alumni Blogs
          </h2>
          <a href="/blogs" className="inline-flex items-center gap-2 group self-start md:self-end mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 border-b-2 border-[#951114] pb-1 group-hover:text-[#951114] transition-colors">
              View All Posts
            </span>
            <ArrowRight size={13} className="text-[#951114] group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-200 animate-pulse">
                <div className="h-2 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-6 bg-slate-100 rounded w-full" />
                  <div className="h-6 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full mt-2" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <p className="text-sm text-red-500 font-medium">
            Could not load blogs: {error}
          </p>
        )}

        {/* EMPTY */}
        {!loading && !error && blogs.length === 0 && (
          <p className="text-slate-500 text-base">No published blogs yet. Check back soon.</p>
        )}

        {/* CARDS */}
        {!loading && !error && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post, idx) => (
              <motion.a
                href={`/blogs/${post._id}`}
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group cursor-pointer flex flex-col border border-slate-200 hover:border-[#951114] transition-colors duration-300"
              >
                {/* Top image or colour band */}
                {post.image?.url ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={post.image.url}
                      alt={post.image.altText || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-2 bg-[#951114]" />
                )}

                <div className="flex flex-col flex-grow p-6 space-y-3">
                  {/* Tag / category */}
                  {post.category && (
                    <span className="self-start text-[9px] font-black uppercase tracking-widest bg-[#951114]/10 text-[#951114] px-2.5 py-1">
                      {post.category}
                    </span>
                  )}

                  {/* Meta */}
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Alumni Blogs
                    <span className="mx-1.5 text-slate-300">/</span>
                    <span className="font-medium lowercase tracking-normal">
                      {formatDate(post.createdAt)}
                    </span>
                  </p>

                  {/* Title */}
                  <h3
                    style={{ fontFamily: "Playfair Display, serif" }}
                    className="text-lg font-bold text-slate-900 leading-snug group-hover:text-[#951114] transition-colors duration-300 flex-grow"
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {estimateReadTime(post.content)}
                    </span>
                    <div className="w-8 h-8 border border-slate-200 flex items-center justify-center text-[#951114] group-hover:bg-[#951114] group-hover:text-white group-hover:border-[#951114] transition-all duration-300">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;