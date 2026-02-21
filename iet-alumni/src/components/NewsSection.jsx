"use client";
import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import "@fontsource/playfair-display/700.css";

const newsItems = [
  {
    category: "ALUMNI COMMUNITY",
    date: "February 20, 2026",
    title: "Innovating for India: How IETian Alumnus Neeraj Gupta is Transforming Agri-Tech",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "CAMPUS NEWS",
    date: "February 13, 2026",
    title: "Rewind 1995: A Nostalgic Look Back at the First Technical Fest of IET Lucknow",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "ALUMNI COMMUNITY",
    date: "February 12, 2026",
    title: "Engineering the Future: Two IETians Selected for Global Innovation Fellowship",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
  }
];

const NewsSection = () => {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* BACKGROUND SPLIT - Mimicking the sidebar aesthetic in your screenshots */}
      <div className="absolute inset-0 flex">
        <div className="w-1/3 h-full bg-[#f1f5f9] opacity-70"></div>
        <div className="w-2/3 h-full bg-white"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT SIDEBAR: Heading Section */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="space-y-4">
              <span className="text-blue-600 font-bold text-lg" style={{ fontFamily: "Playfair Display" }}>
                Keep Exploring
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                Browse All <br /> News
              </h2>
              <div className="pt-8">
                <a href="#" className="inline-flex items-center gap-2 group">
                  <span className="text-xs font-black uppercase tracking-[0.2em] border-b-2 border-blue-600 pb-1 text-slate-900 group-hover:text-blue-600 group-hover:border-slate-900 transition-all">
                    VIEW ALL ALUMNI NEWS
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Content Grid */}
          <div className="lg:col-span-8">
            {/* FEATURED STORY (Top Row) */}
            <div className="mb-16 group cursor-pointer">
              <div className="relative aspect-[16/9] overflow-hidden mb-6">
                <Image 
                  src={newsItems[0].image} 
                  alt="Featured Story" 
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
                  {newsItems[0].category} <span className="mx-2 text-slate-300">/</span> <span className="text-slate-500 font-medium lowercase tracking-normal">{newsItems[0].date}</span>
                </p>
                <h3 
                  style={{ fontFamily: "Playfair Display, serif" }} 
                  className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-[#951114] transition-colors"
                >
                  {newsItems[0].title}
                </h3>
              </div>
            </div>

            {/* SMALLER GRID (Bottom Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {newsItems.slice(1).map((item, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="relative aspect-square overflow-hidden mb-6">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
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
                      {item.category} <span className="mx-2 text-slate-300">/</span> <span className="text-slate-500 font-medium lowercase tracking-normal">{item.date}</span>
                    </p>
                    <h3 
                      style={{ fontFamily: "Playfair Display, serif" }} 
                      className="text-xl font-bold text-slate-900 group-hover:text-[#951114] transition-colors"
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default NewsSection;