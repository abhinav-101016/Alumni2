import React from 'react';
import Image from 'next/image';
import { Phone, Mail, Twitter, MapPin, Briefcase, Camera, ExternalLink } from 'lucide-react';

const AdvisoryCommittee = () => {
  const members = [
    {
      name: "Pradeep Mishra",
      batch: "CE 1991",
      phone: "+91-9313325973",
      email: "pradeep@ietlaa.com",
      twitter: "@Pradeep1299",
      location: "New Delhi",
      profilePic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500", // Skyscrapers
        "https://images.unsplash.com/photo-1503387762-592dee58c460?q=80&w=500", // Construction site
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=500"  // Modern Office
      ],
      highlights: [
        "Founder & CMD of REPL: Integrated Urban Development & Infrastructure Consultancy, listed at NSE.",
        "Director in NMBPL: A leading Real Estate Developer & EPC firm.",
        "Director in RIPL: Digital Transformation Partner for AEC Sector.",
        "Leading strategist for multiple Smart Cities (Varanasi, Indore, Kanpur, Dehradun).",
        "Recipient of ‘Economic Times Promising Entrepreneurs of India, 2016’."
      ]
    },
    {
      name: "Shakti Pratap Singh",
      batch: "EE 1994",
      phone: "+91-7007158911",
      email: "shakti@ietlaa.com",
      twitter: "@Shakti792",
      location: "Lucknow",
      profilePic: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500", // Justice/Govt
        "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=500", // Corporate building
        "https://images.unsplash.com/photo-1591115765373-520b7a2d7a59?q=80&w=500"  // Presentation/Seminar
      ],
      highlights: [
        "Joint Commissioner, Commercial Taxes and GST Lucknow.",
        "Master Trainer of GST for Advocates, CAs, and Entrepreneurs.",
        "Former Assistant Engineer in UP State Electricity Board.",
        "Extensive experience in BHEL and selection in multiple PSUs.",
        "Regular practitioner of Taekwondo (Red-one belt) and Vipassana."
      ]
    },
    {
      name: "Sarthak Verma",
      batch: "ME 2008",
      phone: "+91-9838641122",
      email: "sarthak@ietlaa.com",
      twitter: "@Sarthak1858",
      location: "Lucknow",
      profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=500", // Hospital Hallway
        "https://images.unsplash.com/photo-1538108197017-c1a92a3935d1?q=80&w=500", // Medical Lab
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500"  // Modern Hospital Room
      ],
      highlights: [
        "Managing Director of Sushma Hospital & Research Centre Pvt Ltd.",
        "Topper of IIM Lucknow's General Management Programme for Executives (2023).",
        "Lead Sushma Hospital as a designated Covid facility with Govt. recognition.",
        "NTSE Scholar and CAT Topper (99.93 percentile).",
        "Awarded for excellence in healthcare by Deputy CM Mr. Brajesh Pathak."
      ]
    }
  ];

  return (
    /* Force white background for the whole page */
    <div className="bg-white min-h-screen text-slate-900 font-sans">
      
      {/* Professional Header */}
      <section className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-16 h-1.5 bg-[#951114] mx-auto mb-8"></div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-6">
            Advisory Committee
          </h1>
          <p className="text-[#951114] text-xs md:text-sm font-black uppercase tracking-[0.4em]">
            IETLAA Council • 2023 — 2027
          </p>
          <p className="mt-8 text-slate-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-medium">
            Following a unanimous selection process in Oct 2023, these distinguished alumni lead 
            the Advisory Committee for a four-year tenure.
          </p>
        </div>
      </section>

      {/* Members Section */}
      <main className="max-w-6xl mx-auto py-12 px-6 space-y-20 bg-white">
        {members.map((member, index) => (
          <article key={index} className="group flex flex-col bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            
            {/* Top Identity Block */}
            <div className="flex flex-col lg:flex-row">
              {/* Profile Sidebar */}
              <div className="lg:w-80 bg-slate-50/50 p-10 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-slate-100">
                <div className="relative w-44 h-44 mb-8">
                  <Image 
                    src={member.profilePic} 
                    alt={member.name} 
                    fill 
                    className="object-cover rounded-full border-4 border-white shadow-md grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h2 className="text-xl font-black text-black text-center uppercase leading-tight">
                  {member.name}
                </h2>
                <p className="text-[#951114] font-black text-[10px] mt-2 uppercase tracking-widest bg-[#951114]/5 px-3 py-1 rounded-full">
                  Batch of {member.batch.split(' ')[1]}
                </p>
                
                <div className="mt-8 space-y-4 w-full pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <MapPin size={14} className="text-[#951114]"/> {member.location}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Mail size={14} className="text-[#951114]"/> {member.email}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Phone size={14} className="text-[#951114]"/> {member.phone}
                  </div>
                </div>
              </div>

              {/* Highlights Section */}
              <div className="flex-1 p-8 md:p-14 bg-white">
                <div className="flex items-center gap-3 mb-10">
                  <Briefcase className="text-[#951114]" size={22} />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">
                    Professional Brief
                  </h3>
                </div>
                <div className="grid gap-6">
                  {member.highlights.map((h, i) => (
                    <div key={i} className="flex gap-4 group/item">
                      <div className="h-px w-6 bg-slate-200 mt-3 group-hover/item:w-10 group-hover/item:bg-[#951114] transition-all duration-300 shrink-0"></div>
                      <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                        {h}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Gallery Bar */}
            <div className="bg-slate-50 p-6 md:p-10 border-t border-slate-100">
               <div className="flex items-center gap-2 mb-6">
                 <Camera size={16} className="text-[#951114]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Activity Log</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {member.gallery.map((img, i) => (
                    <div key={i} className="relative h-56 overflow-hidden rounded-sm shadow-sm group">
                      <Image 
                        src={img} 
                        alt="Gallery Image" 
                        fill 
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500"></div>
                    </div>
                  ))}
               </div>
            </div>

          </article>
        ))}
      </main>

      <footer className="bg-white py-16 border-t border-slate-100 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
          IET Lucknow Alumni Association • Official Record
        </p>
      </footer>
    </div>
  );
};

export default AdvisoryCommittee;