"use client";
import Link from "next/link"
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      // 4MB loads fast, but we still force play to ensure it hits the 'onLoadedData' event
      videoRef.current.play().catch(err => console.log("Video playback note:", err));
    }
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="relative w-full bg-[#a51214] flex flex-col overflow-hidden pt-12 md:pt-20">
      
      {/* 1. THE VIDEO PALETTE - Using your 4MB compressed file */}
      <div className="relative w-full flex justify-end pt-10 md:pt-16 md:pr-16 lg:pr-24 px-6 md:px-0">
        <div className="w-full md:w-[78%] h-[250px] md:h-[550px] relative z-10 bg-black/10 overflow-hidden">
          
          {/* Subtle loading shimmer */}
          {!isVideoReady && (
            <div className="absolute inset-0 bg-white/5 animate-pulse z-20" />
          )}

          <video 
            ref={videoRef}
            autoPlay 
            muted 
            loop 
            playsInline
            onLoadedData={() => setIsVideoReady(true)}
            /* Standard poster to show while loading */
            poster="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=40&w=800"
            className={`w-full h-full object-cover shadow-2xl rounded-sm block transition-opacity duration-700 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Points to public/heroVideo.mp4 */}
            <source src="/heroVideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* 2. THE TEXT - Left Aligned on Mobile & Precision Baseline for Desktop */}
      <div className="relative z-30 max-w-7xl mx-auto w-full px-6">
        <div className="flex flex-col items-start justify-end">
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            /* md:-mt-[98px] aligns the first line's baseline with the video bottom */
            className="text-white text-4xl md:text-8xl font-black uppercase leading-[0.8] tracking-tighter mt-8 md:-mt-[98px] mb-16 md:mb-20 drop-shadow-xl text-left"
          >
            Connections Begin Here <br /> 
            <span className="text-white/90">and Go Beyond.</span>
          </motion.h1>
        </div>

        {/* 3. NAVIGATION SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 pb-16 border-t border-white/30 pt-12 relative z-40">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="hidden md:block">
            <a href="#" className="inline-block group">
              <span className="text-white text-3xl font-black uppercase border-b-4 border-white pb-1 group-hover:text-red-200 transition-colors">
                Get Started
              </span>
            </a>
          </motion.div>

       {[
  { title: "Alumni Directory", desc: "Browse and connect with IET Lucknow graduates across the world.", href: "/alumni" },
  { title: "My Network", desc: "View your connections and grow your professional circle.", href: "/connections" },
  { title: "Featured Alumni", desc: "Meet our distinguished alumni making an impact.", href: "/connect/featured-alumni" }
].map((item, idx) => (
  <motion.div key={idx} variants={fadeInUp} initial="hidden" animate="visible" className="relative flex flex-col items-start text-left">
    <div className="block md:hidden w-24 h-[2px] bg-white/60 mb-10" />
    <Link href={item.href} className="flex flex-col px-0 md:px-10 border-l-0 md:border-l border-white/20 group mb-10 md:mb-0">
      <h3 className="text-white text-2xl md:text-3xl font-serif font-medium mb-3 leading-tight tracking-tight">
        {item.title}
      </h3>
      <p className="text-red-100 text-lg mb-6 opacity-90 max-w-[280px] md:max-w-none">
        {item.desc}
      </p>
      <ArrowRight className="text-white group-hover:translate-x-3 transition-transform" size={32} />
    </Link>
  </motion.div>
))}
        </div>
      </div>
    </section>
  );
};

export default Hero;