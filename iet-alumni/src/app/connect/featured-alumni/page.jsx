"use client";
import React from 'react';
import Image from 'next/image';
import { Linkedin, ExternalLink, GraduationCap } from 'lucide-react';

const alumniSpotlights = [
  {
    name: "Smt. Leena Johri",
    batch: "Class of 1988",
    branch: "Computer Science & Engineering",
    role: "IAS Officer, Govt. of India",
    bio: "A pioneer for women in engineering at IET, she has served in various high-ranking administrative roles, contributing significantly to national policy and governance.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800", // Representative image
  },
  {
    name: "Shuchi Sharma",
    batch: "Class of 1994",
    branch: "Electronics & Communication",
    role: "Global Vice President, SAP",
    bio: "Leading digital transformation on a global scale, Shuchi represents the technical prowess and leadership excellence of IETians in the private sector.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800", // Representative image
  }
];

const AlumnaeSpotlight = () => {
  return (
    <main className="bg-white min-h-screen pb-20">
      {/* HEADER SECTION */}
      <section className="bg-[#951114] text-white py-20 px-6 md:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 style={{ fontFamily: "Playfair Display" }} className="text-5xl md:text-7xl font-bold mb-6">
            Alumnae Spotlight
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl opacity-90">
            Celebrating the extraordinary women of IET Lucknow who are leading industries, 
            shaping policies, and inspiring the next generation of engineers.
          </p>
        </div>
      </section>

      {/* SPOTLIGHT GRID */}
      <section className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 gap-12">
          {alumniSpotlights.map((alumna, idx) => (
            <div key={idx} className="flex flex-col lg:flex-row bg-white shadow-2xl overflow-hidden border border-slate-100">
              
              {/* IMAGE SIDE */}
              <div className="lg:w-2/5 relative h-[400px] lg:h-auto">
                <Image 
                  src={alumna.image}
                  alt={alumna.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* CONTENT SIDE */}
              <div className="lg:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-[#951114] font-bold tracking-widest uppercase text-sm mb-4">
                  <GraduationCap size={20} />
                  {alumna.branch} | {alumna.batch}
                </div>
                
                <h2 style={{ fontFamily: "Playfair Display" }} className="text-4xl font-bold text-slate-900 mb-2">
                  {alumna.name}
                </h2>
                <h3 className="text-xl text-slate-600 font-medium mb-6 italic">
                  {alumna.role}
                </h3>
                
                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                  {alumna.bio}
                </p>

                <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#951114] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-colors">
                    View Full Profile <ExternalLink size={14} />
                  </button>
                  <button className="p-3 border-2 border-slate-200 text-slate-400 hover:text-[#0077b5] hover:border-[#0077b5] transition-colors">
                    <Linkedin size={20} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* NOMINATION CTA */}
      <section className="max-w-3xl mx-auto px-6 mt-24 text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Know an Alumna making waves?</h3>
        <p className="text-slate-600 mb-8">
          We are constantly looking to share stories of our graduates. Help us inspire the current 
          students by nominating someone for the spotlight.
        </p>
        <button className="text-[#951114] font-black uppercase tracking-[0.2em] border-b-2 border-[#951114] pb-1 hover:text-slate-900 hover:border-slate-900 transition-all">
          Submit a Nomination
        </button>
      </section>
    </main>
  );
};

export default AlumnaeSpotlight;