"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const RegisterCTA = () => {
  return (
    <section className="w-full bg-[#951114] py-20 md:py-28 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-10">

        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4 max-w-lg"
        >
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.35em]">
            IET Hub · iethub.org
          </p>
          <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95]">
            Want to Register as Alumni or Student?
          </h2>
          <p className="text-white/70 text-base md:text-lg font-medium leading-relaxed">
            Join IET Hub — our official platform for the IET Lucknow community. Free to join for alumni and students alike.
          </p>
        </motion.div>

        {/* Right — CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex-shrink-0"
        >
          <a
            href="https://www.iethub.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-4 bg-white hover:bg-slate-900 transition-colors duration-300 px-10 py-7"
          >
            <span className="text-[#951114] group-hover:text-white font-black uppercase tracking-widest text-sm transition-colors duration-300">
              Register on IET Hub
            </span>
            <ArrowRight
              size={18}
              className="text-[#951114] group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
            />
          </a>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-3">
            Alumni · Students · Faculty
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default RegisterCTA;