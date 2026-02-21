"use client";
import React from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-16 md:pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 md:gap-12 lg:gap-0 mb-16 md:mb-24">
          
          {/* LEFT PART: Identity & Contact */}
          <div className="lg:col-span-3 space-y-6 md:space-y-10 pr-4">
            <div className="space-y-4 md:space-y-6">
               <h2 className="text-slate-900 text-2xl md:text-4xl font-black uppercase leading-[1.05] tracking-tighter">
                DEVELOPMENT AND <br /> ALUMNI RELATIONS <br /> IET LUCKNOW
              </h2>
              <div className="text-slate-600 space-y-1 md:space-y-2 text-base md:text-lg leading-relaxed">
                <p className="font-medium">Sitapur Road, Lucknow,</p>
                <p>Uttar Pradesh 226021</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <a href="tel:05222730633" className="flex items-center gap-2 text-slate-800 hover:text-red-600 transition-all font-bold text-base md:text-lg w-fit">
                (0522) 2730633 <ExternalLink size={16} className="text-blue-600" />
              </a>
              <a href="mailto:alumni@ietlucknow.ac.in" className="flex items-center gap-2 text-slate-800 hover:text-red-600 transition-all font-bold text-base md:text-lg w-fit">
                alumni@ietlucknow.ac.in <ExternalLink size={16} className="text-blue-600" />
              </a>
            </div>

         {/* BRAND LOGO SECTION */}
{/* BRAND LOGO SECTION */}
<div className="flex items-center  pt-2 md:pt-4 group cursor-pointer">
  <div className="relative w-24 h-24 md:w-32 md:h-32 transition-transform duration-300 group-hover:scale-105">
    <Image 
      src="/images/IETLAA.svg" 
      alt="IET Alumni Association Logo" 
      fill
      className="object-contain transform scale-110" 
    />
  </div>
  <div className="flex flex-col">
    <span className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter leading-none uppercase">
      IET Lucknow
    </span>
    <span className="text-[10px] md:text-[14px] font-bold text-red-600 uppercase tracking-[0.3em] mt-1">
      Alumni Association
    </span>
  </div>
</div>
          </div>

          {/* RIGHT PART: Link Columns */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8 lg:pl-4">
            <h3 className="text-slate-900 font-bold text-xs md:text-sm uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-2 w-fit">
              Learn More
            </h3>
            <ul className="space-y-3 md:space-y-5 text-slate-700 text-base md:text-lg font-medium">
              <li><a href="#" className="hover:text-red-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-red-600 transition-colors">Contact Us</a></li>
              <li><a href="#" className="flex items-center gap-2 hover:text-red-600 transition-colors">
                IET Campaign <ExternalLink size={14} className="text-blue-600" />
              </a></li>
            </ul>
          </div>

          <div className="lg:col-span-1 space-y-6 md:space-y-8 lg:pl-4">
            <h3 className="text-slate-900 font-bold text-xs md:text-sm uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-2 w-fit">
              Resources
            </h3>
            <ul className="space-y-3 md:space-y-5 text-slate-700 text-base md:text-lg font-medium">
              <li><a href="#" className="flex items-center gap-2 hover:text-red-600 transition-colors">Bookstore <ExternalLink size={14} className="text-blue-600" /></a></li>
              <li><a href="#" className="flex items-center gap-2 hover:text-red-600 transition-colors">Library <ExternalLink size={14} className="text-blue-600" /></a></li>
              <li><a href="#" className="flex items-center gap-2 hover:text-red-600 transition-colors">Transcripts <ExternalLink size={14} className="text-blue-600" /></a></li>
            </ul>
          </div>

          <div className="lg:col-span-1 space-y-6 md:space-y-8 lg:pl-4">
            <h3 className="text-slate-900 font-bold text-xs md:text-sm uppercase tracking-[0.2em] border-b-2 border-slate-100 pb-2 w-fit">
              Connect
            </h3>
            <ul className="space-y-3 md:space-y-5 text-slate-700 text-base md:text-lg font-medium">
              <li><a href="#" className="flex items-center gap-2 hover:text-red-600 transition-colors">Facebook <ExternalLink size={14} className="text-blue-600" /></a></li>
              <li><a href="#" className="flex items-center gap-2 hover:text-red-600 transition-colors">Instagram <ExternalLink size={14} className="text-blue-600" /></a></li>
              <li><a href="#" className="flex items-center gap-2 hover:text-red-600 transition-colors">LinkedIn <ExternalLink size={14} className="text-blue-600" /></a></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-8 border-t border-slate-100 flex flex-col lg:grid lg:grid-cols-6 gap-6 lg:gap-0 items-start">
          <p className="lg:col-span-3 text-xs md:text-sm font-medium text-slate-500 order-2 lg:order-1">
            © {currentYear} Institute of Engineering & Technology, Lucknow.
          </p>
          
          <div className="lg:col-span-3 flex flex-col lg:flex-row justify-between w-full uppercase tracking-widest text-[10px] md:text-[11px] font-bold text-slate-500 gap-4 lg:gap-0 order-1 lg:order-2">
            <a href="#" className="hover:text-blue-600 transition-colors lg:pl-4">Web Accessibility</a>
            <a href="#" className="hover:text-blue-600 transition-colors lg:pl-4">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors font-black text-slate-900 lg:pl-4">
              Design by IETians
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;