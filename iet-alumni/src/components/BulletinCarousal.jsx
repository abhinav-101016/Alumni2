"use client";
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BulletinCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      season: "Batch of 2029",
      title: "MEET THE NEW IETIANS",
      desc: "Welcoming the brightest minds to the Sitapur Road campus. Discover the stories and aspirations of our newest engineering batch as they begin their journey.",
      // High-quality student/campus life image
      img: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop",
      linkText: "READ THE BULLETIN"
    },
    {
      season: "Alumni Reunion 2026",
      title: "RELIVING THE CAMPUS DAYS",
      desc: "From the old canteen to the new lecture halls, join us for the Annual Global Alumni Meet to reconnect with your batchmates and mentors.",
      // High-quality networking/event image
      img: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop",
      linkText: "VIEW THE IMPACT"
    },
    {
      season: "Innovation Milestone",
      title: "40 YEARS OF EXCELLENCE",
      desc: "Commemorating four decades of technical brilliance at IET Lucknow with stories from our very first graduating batch and their global success.",
      // High-quality robotics/tech lab image
      img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop",
      linkText: "EXPLORE STORIES"
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="bg-[#1e2220] text-white overflow-hidden min-h-[600px] flex items-center">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 items-center">
        
        {/* LEFT CONTENT */}
        <div className="p-8 md:p-16 lg:p-24 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h4 className="text-blue-400 font-serif italic text-xl md:text-2xl font-[family-name:var(--font-playfair)]">
                {slides[currentIndex].season}
              </h4>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                {slides[currentIndex].title}
              </h2>
              <p className="text-gray-300 text-lg md:text-xl font-serif leading-relaxed max-w-md font-[family-name:var(--font-playfair)]">
                {slides[currentIndex].desc}
              </p>
              
              <button className="flex items-center gap-2 px-8 py-3 border-2 border-blue-400 text-white font-bold text-sm tracking-widest hover:bg-blue-400 transition-all group">
                {slides[currentIndex].linkText} 
                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT IMAGE SLIDER */}
        <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={slides[currentIndex].img}
              alt={slides[currentIndex].title}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* NAVIGATION CONTROLS */}
          <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
            <div className="flex gap-2 mr-4">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 transition-all duration-300 ${i === currentIndex ? 'w-8 bg-blue-400' : 'w-4 bg-white/30'}`} 
                />
              ))}
            </div>
            
            <button 
              onClick={handlePrev}
              className="p-3 border border-white/40 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={handleNext}
              className="p-3 border border-white/40 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Subtle Red/Grey Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e2220] via-transparent to-transparent lg:block hidden" />
        </div>

      </div>
    </section>
  );
};

export default BulletinCarousel;