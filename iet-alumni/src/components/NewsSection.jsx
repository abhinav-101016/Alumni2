"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import "@fontsource/playfair-display/700.css";

// Fallback placeholder if a news item has no image
const PLACEHOLDER = "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800";

const NewsSection = () => {
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/news`);
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();

        // Published news only, latest 3
        const published = (data.news || [])
          .filter((n) => n.status === "published")
          .slice(0, 3);

        setNews(published);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // ── LOADING SKELETON ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <section id="news" className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full bg-[#f1f5f9] opacity-70" />
          <div className="w-2/3 h-full bg-white" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-pulse">
            <div className="lg:col-span-4 space-y-4">
              <div className="h-5 bg-slate-200 rounded w-28" />
              <div className="h-14 bg-slate-200 rounded w-48" />
              <div className="h-14 bg-slate-200 rounded w-40" />
            </div>
            <div className="lg:col-span-8 space-y-8">
              <div className="aspect-[16/9] bg-slate-200 rounded" />
              <div className="grid grid-cols-2 gap-8">
                <div className="aspect-square bg-slate-200 rounded" />
                <div className="aspect-square bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <section id="news" className="bg-white py-16 px-6 md:px-12 lg:px-24">
        <p className="text-sm text-red-500 font-medium">Could not load news: {error}</p>
      </section>
    );
  }

  // ── EMPTY ─────────────────────────────────────────────────────────────────
  if (news.length === 0) {
    return (
      <section id="news" className="bg-white py-16 px-6 md:px-12 lg:px-24">
        <p className="text-slate-500 text-base">No news published yet. Check back soon.</p>
      </section>
    );
  }

  const [featured, ...rest] = news;

  return (
    <section id="news" className="relative overflow-hidden bg-white">
      {/* BACKGROUND SPLIT */}
      <div className="absolute inset-0 flex">
        <div className="w-1/3 h-full bg-[#f1f5f9] opacity-70" />
        <div className="w-2/3 h-full bg-white" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="space-y-4">
              <span
                className="text-blue-600 font-bold text-lg"
                style={{ fontFamily: "Playfair Display" }}
              >
                Keep Exploring
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                Browse All <br /> News
              </h2>
              <div className="pt-8">
                <a href="/news" className="inline-flex items-center gap-2 group">
                  <span className="text-xs font-black uppercase tracking-[0.2em] border-b-2 border-blue-600 pb-1 text-slate-900 group-hover:text-blue-600 group-hover:border-slate-900 transition-all">
                    VIEW ALL ALUMNI NEWS
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-8">

            {/* FEATURED STORY */}
            <a href={`/news/${featured._id}`} className="mb-16 group cursor-pointer block">
              <div className="relative aspect-[16/9] overflow-hidden mb-6">
                <Image
                  src={featured.image?.url || PLACEHOLDER}
                  alt={featured.image?.altText || featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 right-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-xl group-hover:bg-[#951114] group-hover:text-white transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">
                  {featured.category || "Alumni News"}
                  <span className="mx-2 text-slate-300">/</span>
                  <span className="text-slate-500 font-medium lowercase tracking-normal">
                    {formatDate(featured.createdAt)}
                  </span>
                </p>
                <h3
                  style={{ fontFamily: "Playfair Display, serif" }}
                  className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-[#951114] transition-colors"
                >
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                    {featured.excerpt}
                  </p>
                )}
              </div>
            </a>

            {/* SMALLER GRID */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {rest.map((item) => (
                  <a key={item._id} href={`/news/${item._id}`} className="group cursor-pointer block">
                    <div className="relative aspect-square overflow-hidden mb-6">
                      <Image
                        src={item.image?.url || PLACEHOLDER}
                        alt={item.image?.altText || item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute bottom-4 right-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-xl group-hover:bg-[#951114] group-hover:text-white transition-colors">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-900">
                        {item.category || "Alumni News"}
                        <span className="mx-2 text-slate-300">/</span>
                        <span className="text-slate-500 font-medium lowercase tracking-normal">
                          {formatDate(item.createdAt)}
                        </span>
                      </p>
                      <h3
                        style={{ fontFamily: "Playfair Display, serif" }}
                        className="text-xl font-bold text-slate-900 group-hover:text-[#951114] transition-colors"
                      >
                        {item.title}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;