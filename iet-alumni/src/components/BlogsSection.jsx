"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import "@fontsource/playfair-display/700.css";

const blogPosts = [
  {
    category: "ALUMNI STORIES",
    date: "March 18, 2026",
    tag: "Career",
    title: "From Sitapur Road to Silicon Valley: A Journey Across Two Decades",
    excerpt: "How the lessons learned in the labs of IET Lucknow laid the foundation for a career spanning three continents and two unicorn startups.",
    readTime: "6 min read",
  },
  {
    category: "CAMPUS LIFE",
    date: "March 10, 2026",
    tag: "Nostalgia",
    title: "The Canteen, The Hostels, and The Friendships That Never Fade",
    excerpt: "Alumni from the batch of 2001 revisit the campus they once called home — and find both change and comfort in familiar corridors.",
    readTime: "4 min read",
  },
  {
    category: "INDUSTRY INSIGHTS",
    date: "February 28, 2026",
    tag: "Technology",
    title: "AI is Reshaping Civil Engineering — And IETians Are Leading the Charge",
    excerpt: "Three alumni building at the intersection of infrastructure and machine learning share what the future of the built world looks like.",
    readTime: "8 min read",
  },
];

const BlogsSection = () => {
  return (
    <section id="blogs" className="bg-white py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">

        {/* ── HEADER — matches AlumniEvents / NewsSection style ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-[#951114] pb-4 mb-14">
          <h2
            style={{ fontFamily: "Playfair Display, serif" }}
            className="text-3xl md:text-5xl font-black uppercase text-slate-900"
          >
            Alumni Blogs
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-2 group self-start md:self-end mb-1"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 border-b-2 border-[#951114] pb-1 group-hover:text-[#951114] transition-colors">
              View All Posts
            </span>
            <ArrowRight size={13} className="text-[#951114] group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* ── CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group cursor-pointer flex flex-col border border-slate-200 hover:border-[#951114] transition-colors duration-300"
            >
              {/* Colour band at top instead of image — clean, no dark bg issues */}
              <div className="h-2 bg-[#951114]" />

              <div className="flex flex-col flex-grow p-6 space-y-3">
                {/* Tag pill */}
                <span className="self-start text-[9px] font-black uppercase tracking-widest bg-[#951114]/10 text-[#951114] px-2.5 py-1">
                  {post.tag}
                </span>

                {/* Meta */}
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {post.category}
                  <span className="mx-1.5 text-slate-300">/</span>
                  <span className="font-medium lowercase tracking-normal">{post.date}</span>
                </p>

                {/* Title */}
                <h3
                  style={{ fontFamily: "Playfair Display, serif" }}
                  className="text-lg font-bold text-slate-900 leading-snug group-hover:text-[#951114] transition-colors duration-300 flex-grow"
                >
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-slate-500 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    {post.readTime}
                  </span>
                  <div className="w-8 h-8 border border-slate-200 flex items-center justify-center text-[#951114] group-hover:bg-[#951114] group-hover:text-white group-hover:border-[#951114] transition-all duration-300">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogsSection;