"use client";
import React from 'react';
import { ArrowRight } from 'lucide-react';

const Campaign = () => {
  const cards = [
    {
      title: "CAMPUS UPDATES",
      desc: "Read the latest news and stories from the IET Lucknow community.",
      img: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?auto=format&fit=crop&q=80",
    },
    {
      title: "IMPACT REPORT",
      desc: "See how your contributions are transforming our engineering labs.",
      img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80",
    },
    {
      title: "MAKE A GIFT",
      desc: "Open doors for today's IETians through scholarships.",
      img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80",
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white overflow-visible">
      {/* Returned to a 5-7 grid split for a balanced look */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* LEFT CONTENT */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8 pt-0 md:pt-10 px-2 md:px-0">
          <h4 className="text-blue-700 font-serif italic text-2xl md:text-3xl font-[family-name:var(--font-playfair)]">
            Forward, IET Lucknow!
          </h4>
          <h2 className="text-slate-900 text-4xl md:text-6xl font-black uppercase leading-[1.1] tracking-tighter break-words">
            ENVISIONING THE <br className="hidden md:block" /> FUTURE OF <br className="hidden md:block" /> INNOVATION
          </h2>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-lg">
            This ambitious next phase of IET Lucknow’s powerful 
            fundraising and engagement campaign invites the 
            university community to help shape IET's future.
          </p>
          <button className="px-10 py-3 border-2 border-blue-700 text-blue-700 font-bold uppercase tracking-widest text-sm hover:bg-blue-700 hover:text-white transition-all duration-300">
            Learn More
          </button>
        </div>

        {/* RIGHT CARDS */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-6 mt-16 md:mt-0">
          {cards.map((card, idx) => (
            <div key={idx} className="relative flex flex-col pt-0 md:pt-32 h-full group cursor-pointer">
              
              {/* THE COLOR DIV: Slightly less wide via md:h-[84%] */}
              <div className="absolute inset-0 md:top-auto md:bottom-0 md:h-[84%] bg-red-100 rounded-br-[70px] md:rounded-br-[60px] z-0 group-hover:bg-red-200 transition-colors duration-500" />

              {/* CONTENT WRAPPER */}
              <div className="relative z-10 p-5 md:p-6 flex flex-col h-full">
                
                {/* Image: Pushed -mt-32 for that floating look */}
                <div className="aspect-[4/5] mt-0 md:-mt-32 overflow-hidden rounded-sm mb-6 md:mb-8 shadow-2xl transition-all duration-700 group-hover:-translate-y-4">
                  <img 
                    src={card.img} 
                    alt={card.title} 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Text Content */}
                <div className="flex-grow space-y-4">
                  <h5 className="font-black text-slate-900 text-[10px] md:text-xs uppercase tracking-[0.2em]">
                    {card.title}
                  </h5>
                  <p className="text-slate-800 text-xl md:text-2xl font-serif leading-tight font-[family-name:var(--font-playfair)]">
                    {card.desc}
                  </p>
                </div>

                {/* Arrow */}
                <div className="mt-8 text-blue-700 transition-transform duration-300 group-hover:translate-x-3">
                  <ArrowRight size={32} strokeWidth={2.5} />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Campaign;