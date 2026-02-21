"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="relative w-full bg-[#a51214] flex flex-col overflow-hidden">
      
      {/* 1. THE IMAGE - Wider width (78%) reaching further left */}
      <div className="relative w-full flex justify-end pt-10 md:pt-16 md:pr-16 lg:pr-24 px-6 md:px-0">
        <div className="w-full md:w-[78%] h-[250px] md:h-[550px] relative z-10">
          <img 
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80" 
            alt="IET Lucknow Alumni" 
            className="w-full h-full object-cover shadow-2xl rounded-sm"
          />
        </div>
      </div>

      {/* 2. THE TEXT - Adjusted positioning to align bottom with image bottom */}
      <div className="relative z-30 max-w-7xl mx-auto w-full px-6">
        <div className="flex flex-col justify-end">
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            /* md:-mt-24 pulls the text up so its baseline matches the image bottom */
            className="text-white text-4xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mt-12 md:-mt-24 mb-16 md:mb-20 drop-shadow-xl text-center md:text-left"
          >
            Connections Begin Here <br /> 
            <span className="text-white/90">and Go Beyond.</span>
          </motion.h1>
        </div>

        {/* 3. NAVIGATION SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 pb-16 border-t border-white/30 pt-12 relative z-40">
          
          {/* Get Started */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="hidden md:block">
            <a href="#" className="inline-block group">
              <span className="text-white text-3xl font-black uppercase border-b-4 border-white pb-1 group-hover:text-red-200 transition-colors">
                Get Started
              </span>
            </a>
          </motion.div>

          {/* Link 1 */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative flex flex-col items-center md:items-start text-center md:text-left">
            <div className="block md:hidden w-24 h-[2px] bg-white/60 mb-10 mx-auto" />
            <a href="#" className="flex flex-col px-0 md:px-10 border-l-0 md:border-l border-white/20 group mb-10 md:mb-0">
              <h3 className="text-white text-2xl md:text-3xl font-serif font-medium mb-3 font-[family-name:var(--font-playfair)] leading-tight tracking-tight">
                Update your info
              </h3>
              <p className="text-red-100 text-lg mb-6 opacity-90 max-w-[280px] md:max-w-none mx-auto md:mx-0">
                New address? New email? Let us know!
              </p>
              <ArrowRight className="text-white mx-auto md:mx-0 group-hover:translate-x-3 transition-transform" size={32} />
            </a>
          </motion.div>

          {/* Link 2 */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative flex flex-col items-center md:items-start text-center md:text-left">
            <div className="block md:hidden w-24 h-[2px] bg-white/60 mb-10 mx-auto" />
            <a href="#" className="flex flex-col px-0 md:px-10 border-l-0 md:border-l border-white/20 group mb-10 md:mb-0">
              <h3 className="text-white text-2xl md:text-3xl font-serif font-medium mb-3 font-[family-name:var(--font-playfair)] leading-tight tracking-tight">
                Explore Programs
              </h3>
              <p className="text-red-100 text-lg mb-6 opacity-90 max-w-[280px] md:max-w-none mx-auto md:mx-0">
                Build your network and get involved.
              </p>
              <ArrowRight className="text-white mx-auto md:mx-0 group-hover:translate-x-3 transition-transform" size={32} />
            </a>
          </motion.div>

          {/* Link 3 */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative flex flex-col items-center md:items-start text-center md:text-left">
            <div className="block md:hidden w-24 h-[2px] bg-white/60 mb-10 mx-auto" />
            <a href="#" className="flex flex-col px-0 md:px-10 border-l-0 md:border-l border-white/20 group">
              <h3 className="text-white text-2xl md:text-3xl font-serif font-medium mb-3 font-[family-name:var(--font-playfair)] leading-tight tracking-tight">
                Attend an Event
              </h3>
              <p className="text-red-100 text-lg mb-6 opacity-90 max-w-[280px] md:max-w-none mx-auto md:mx-0">
                Connect with alumni in-person or online.
              </p>
              <ArrowRight className="text-white mx-auto md:mx-0 group-hover:translate-x-3 transition-transform" size={32} />
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;