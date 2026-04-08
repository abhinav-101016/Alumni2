"use client";
import React from 'react';
import { Users, Briefcase, Home, Globe, ArrowRight } from 'lucide-react';

const affinityGroups = [
  {
    category: "Professional Alliances",
    icon: <Briefcase className="text-[#951114]" size={24} />,
    description: "Connect with IETians leading in specific global industries.",
    groups: [
      "IET Silicon Valley Tech Leaders",
      "Civil Services Forum (IAS/IPS/IES)",
      "IET Entrepreneurs & Founders Club",
      "Core Engineering Global Network"
    ]
  },
  {
    category: "Hostel Legacies",
    icon: <Home className="text-[#951114]" size={24} />,
    description: "Rekindle the bonds formed in the corridors of IET hostels.",
    groups: [
      "Ramanujan & Aryabhatt Veterans",
      "Bhabha & Vishveshwarya Alliance",
      "Sarojini & Gargi Alumnae Circle",
      "Hostel H-1 to H-10 Alumni"
    ]
  },
  {
    category: "Regional Chapters",
    icon: <Globe className="text-[#951114]" size={24} />,
    description: "Find your local IET family in your current city.",
    groups: [
      "Lucknow Local Chapter",
      "NCR - Delhi/Noida/Gurgaon",
      "Bangalore Tech Chapter",
      "Europe & UK Alumni"
    ]
  },
  {
    category: "Identity & Interests",
    icon: <Users className="text-[#951114]" size={24} />,
    description: "Groups based on shared experiences and passions.",
    groups: [
      "Young Alumni (Batches 2020-2025)",
      "Pioneer Batches (1984-1990)",
      "IET Cultural & Encore Legends",
      "Women in Engineering Circle"
    ]
  }
];

const AffinityPrograms = () => {
  return (
    <main className="bg-white min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-slate-50 border-b border-slate-200 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 style={{ fontFamily: "Playfair Display" }} className="text-4xl md:text-6xl font-black text-slate-900 mb-6 uppercase tracking-tight">
            Affinity Programs
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
            IET Lucknow is more than just a college; it's a collection of diverse stories. 
            Find the specific community that matches your professional path, campus memories, or location.
          </p>
        </div>
      </section>

      {/* GROUPS GRID */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {affinityGroups.map((section, idx) => (
            <div key={idx} className="group p-8 border border-slate-100 bg-white hover:shadow-2xl transition-all duration-500 rounded-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-full group-hover:bg-[#951114]/10 transition-colors">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                  {section.category}
                </h2>
              </div>
              
              <p className="text-slate-800 mb-8 font-medium italic">
                {section.description}
              </p>

              <ul className="space-y-4">
                {section.groups.map((group, i) => (
                  <li key={i} className="flex items-center justify-between p-4 bg-slate-40 hover:bg-[#951114] hover:text-white transition-all cursor-pointer rounded-sm group/item">
                    <span className="font-bold text-sm  tracking-wide">{group}</span>
                    <ArrowRight size={16} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-[#951114] py-16 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Don't see your group?</h2>
        <p className="mb-8 opacity-80 max-w-xl mx-auto text-lg">
          We encourage alumni to start new affinity groups. If you have an idea for a professional or interest-based circle, let us help you build it.
        </p>
        <button className="px-10 py-4 bg-white text-[#951114] font-black uppercase tracking-widest text-sm hover:bg-slate-900 hover:text-white transition-all shadow-xl">
          Propose a New Group
        </button>
      </section>
    </main>
  );
};

export default AffinityPrograms;