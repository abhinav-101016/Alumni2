"use client";
import React from 'react';
import { motion } from 'framer-motion';

const ReunionBanner = () => {
  return (
    <section className="relative w-full py-24 bg-white overflow-visible">
      {/* Full-width Green Background Div */}
      <div className="w-full bg-[#1e2220] relative min-h-[380px] flex items-center">
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 px-6 lg:px-8 gap-10 lg:gap-16">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-5 py-16 z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Changed to match the new Red theme accent */}
              <p className="text-[#8B0000] font-bold text-base tracking-widest uppercase">
                IET Lucknow
              </p>
              
              <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                Save the Date: <br />
                Reunion 2026 <br />
                <span className="text-[#a51214]">June 11-14</span>
              </h2>
              
              <div className="space-y-3 max-w-sm">
                <p className="text-gray-300 text-lg font-medium leading-relaxed">
                  Join your classmates and friends for the biggest event on Sitapur Road.
                </p>
                <p className="text-white font-extrabold text-lg italic">
                  Registration opens in Spring 2026.
                </p>
              </div>

              {/* Updated Button Colors: Dark Red (#8B0000) */}
              <button className="mt-2 px-10 py-3 border-2 border-[#a51214] text-[#a51214] font-black tracking-widest uppercase hover:bg-[#a51214] hover:text-white transition-all duration-300">
                Explore Reunion
              </button>
            </motion.div>
          </div>

          {/* RIGHT IMAGE - Reduced Height (top/bottom -12) */}
          <div className="lg:col-span-7 relative h-full">
            <motion.div 
              initial={{ opacity: 0, scale: 1.02 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative lg:absolute lg:-top-12 lg:-bottom-12 lg:-right-20 w-full lg:w-[120%] z-20 shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2070&auto=format&fit=crop" 
                alt="IET Lucknow Alumni Reunion" 
                className="w-full h-full object-cover shadow-inner"
              />
              
              {/* Decorative circles updated to match red theme subtly */}
              <div className="hidden xl:flex absolute -right-8 top-1/2 -translate-y-1/2 flex-col gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#8B0000]/20" />
                ))}
              </div>
            </motion.div>
          </div>

        </div>

        {/* Mobile Gradient */}
        <div className="absolute inset-0 bg-[#1e2220] lg:hidden" />
      </div>
    </section>
  );
};

export default ReunionBanner;