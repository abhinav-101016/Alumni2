"use client";
import React from 'react';
import { motion } from 'framer-motion';

const EngagementSection = () => {
  const engagementWays = [
    {
      title: "Attend an event",
      desc: "From technical workshops to cultural fests, IET Lucknow events keep our global alumni community vibrant and connected to their roots.",
      img: "https://images.unsplash.com/photo-1540575861501-7ad058c6404a?q=80&w=2070&auto=format&fit=crop",
      linkText: "View events calendar",
      align: "right"
    },
    {
      title: "Grow your network",
      desc: "IET Connect is your gateway to an elite network of engineers and leaders. Discover professional opportunities and mentor the next generation.",
      img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop",
      linkText: "Join the network",
      align: "left"
    },
    {
      title: "Help change a life",
      desc: "Your contributions drive the 'Future Makers' campaign, providing scholarships and state-of-the-art lab facilities for deserving IETians.",
      img: "https://images.unsplash.com/photo-1523240693567-99bc8a49957b?q=80&w=2070&auto=format&fit=crop",
      linkText: "Give back today",
      align: "right"
    },
    {
      title: "Make connections",
      desc: "Join departmental affinity groups to unite with alumni from your specific engineering branch and strengthen the IET legacy.",
      img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2060&auto=format&fit=crop",
      linkText: "Learn more",
      align: "left"
    },
    {
      title: "Share your time and talents",
      desc: "Whether as a guest lecturer or a project consultant, your industry expertise is invaluable to the current students at IET Lucknow.",
      img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
      linkText: "Become a volunteer",
      align: "right"
    }
  ];

  return (
    <section className="bg-white py-20 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12 md:space-y-24">
        
        {/* HEADER: Increased letter spacing on main title */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 border-b border-slate-100 pb-10">
          <span className="text-blue-700 font-serif italic text-xl md:text-2xl font-[family-name:var(--font-playfair)] leading-none">
            Stay Connected with IET
          </span>
          <div className="hidden md:block w-px h-8 bg-slate-200" />
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.05em] text-slate-900 leading-none">
            5 Ways to Engage
          </h2>
        </div>

        {/* ROWS: Sentence case for titles */}
        {engagementWays.map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`flex flex-col ${item.align === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 lg:gap-20`}
          >
            {/* IMAGE SIDE */}
            <div className="w-full md:w-1/2">
              <div className="relative overflow-hidden rounded-2xl aspect-[16/9] shadow-xl group">
                <img 
                  src={item.img} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* TEXT SIDE: Sentence Case applied */}
            <div className={`w-full md:w-1/2 space-y-4 ${item.align === 'left' ? 'text-left md:text-right' : 'text-left'}`}>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {item.desc}
              </p>
              <div className={`pt-2 flex ${item.align === 'left' ? 'justify-start md:justify-end' : 'justify-start'}`}>
                <a 
                  href="#" 
                  className="text-slate-900 font-bold tracking-widest text-[10px] md:text-xs border-b-2 border-red-600 pb-1 hover:text-red-600 transition-colors uppercase"
                >
                  {item.linkText}
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default EngagementSection;