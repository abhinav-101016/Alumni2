import React from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, Briefcase, Camera, GraduationCap, Award } from 'lucide-react';

const ExecutiveCommittee = () => {
  const members = [
    {
      role: "President",
      name: "Anupma Singh",
      batch: "EC 1993",
      phone: "9532718869",
      email: "anupma@ietlaa.com",
      location: "Gorakhpur",
      profilePic: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500", // Nature/Environmental
        "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?q=80&w=500", // Tree plantation
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=500"  // Education/Preschool
      ],
      highlights: [
        "Worked with LML Limited, Kanpur for 5 years while completing MBA in Operations Management.",
        "Founder of a successful play school initiative in Gorakhpur.",
        "Organized the 1993 batch Silver Jubilee tree plantation drive at IET Lucknow.",
        "Pioneered the plantation of rare 'Yellow and Pink Tabebuia Rosea' in the city of Lucknow.",
        "Dedicated social worker focusing on free medicine distribution and environmental conservation."
      ]
    },
    {
      role: "Vice President",
      name: "Mrigendra Kumar Anil",
      batch: "CE 1995",
      phone: "7007331492",
      email: "mrigendra@ietlaa.com",
      location: "Hardoi",
      profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500", // Highway/Infrastructure
        "https://images.unsplash.com/photo-1590486803833-ffc475d5c399?q=80&w=500", // Civil Engineering
        "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=500"  // Road Project
      ],
      highlights: [
        "Currently serving as Superintending Engineer, UP PWD, Agra.",
        "Project Director for the prestigious Purvanchal Expressway (2018–2023).",
        "Lead the Agra-Lucknow Expressway Project as Project Director (2015–2018).",
        "Managed large-scale National Highway and World Bank projects.",
        "Over two decades of experience in the UPPWD and PMGSY schemes."
      ]
    },
    {
      role: "General Secretary",
      name: "Ashish Yadav",
      batch: "CE 2008",
      phone: "8004360920",
      email: "ashish@ietlaa.com",
      location: "Lucknow",
      profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1466611664455-94baa71481fd?q=80&w=500", // Irrigation/Water
        "https://images.unsplash.com/photo-1521791136364-798a7bc0d26e?q=80&w=500", // Association/Leadership
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=500"  // Engineering Board
      ],
      highlights: [
        "Executive Engineer, UP Irrigation Department, Government of Uttar Pradesh.",
        "General Secretary of the UP Engineers Association.",
        "Secretary General of the Indian Engineers Federation (Northern Region).",
        "Past professional tenure at Bharat Heavy Electricals Ltd (BHEL) and UPPCL.",
        "Principal Secretary General of the UP Adhikari Maha Parishad."
      ]
    },
    {
      role: "Treasurer",
      name: "Sachin Kumar Jaiswal",
      batch: "EE 2008",
      phone: "7705005684",
      email: "sachin@ietlaa.com",
      location: "Lucknow",
      profilePic: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1556125574-d7f27ec36a06?q=80&w=500", // Metro Train
        "https://images.unsplash.com/photo-1560177112-fbfd5fde9566?q=80&w=500", // Urban Transport
        "https://images.unsplash.com/photo-1454165833267-028ec342718c?q=80&w=500"  // Metro Control
      ],
      highlights: [
        "Assistant Manager at Uttar Pradesh Metro Rail Corporation (UPMRCL).",
        "Currently leading metro operations/management in Kanpur.",
        "Started professional career with the Delhi Metro Rail Corporation (DMRC).",
        "Specializes in Electrical Engineering systems within urban transit networks.",
        "Part of the core team facilitating metro expansions in Uttar Pradesh."
      ]
    },
    {
      role: "Secretary- I",
      name: "Harshad Das",
      batch: "CE 2015",
      phone: "9795856780",
      email: "harshad@ietlaa.com",
      location: "Varanasi",
      profilePic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500", // Oil & Gas
        "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=500", // Distribution Network
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=500"  // Industrial Project
      ],
      highlights: [
        "Manager at Indian Oil Corporation (IOCL), Varanasi.",
        "Successfully managed Petrol and LPG networks across Jaunpur, Azamgarh, and Mau.",
        "Part of the core organizing committee for the launch of Ujjwala Phase-2.",
        "Led the technological automation of Petrol Pumps in the Varanasi divisional office.",
        "Joined IOCL as a top-performer through the GATE 2016 examination."
      ]
    },
    {
      role: "Secretary- II",
      name: "Srishti Singh",
      batch: "CE 2023",
      phone: "8957437317",
      email: "srishti@ietlaa.com",
      location: "Lucknow",
      profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&h=400&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1523050338392-06ba56741472?q=80&w=500", // Management/IIM
        "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=500", // Corporate Intern
        "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=500"  // Presentation/CAT
      ],
      highlights: [
        "Currently pursuing MBA at IIM Rohtak (Final Year).",
        "Named 'Best Intern' at Honda Motorcycle and Scooter India during a 2-month tenure.",
        "Secured 99.06 Percentile (AIR 1585) in UPSEE 2019.",
        "Top performer in CAT 2022 with 97.34 percentile in Quantitative Aptitude.",
        "Trainee experience with PWD Sitapur and active young leader for IETLAA."
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans">
      
      {/* Executive Header */}
      <section className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-16 h-1.5 bg-[#951114] mx-auto mb-8"></div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-6">
            Executive Committee
          </h1>
          <p className="text-[#951114] text-xs md:text-sm font-black uppercase tracking-[0.4em]">
            IETLAA Board • 2024 — 2026
          </p>
          <p className="mt-8 text-slate-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-medium">
            The following members have been elected to the Executive Committee (EC) for the 
            upcoming two-year tenure to manage the association&apos;s operations and vision.
          </p>
        </div>
      </section>

      {/* EC Members Section */}
      <main className="max-w-6xl mx-auto py-12 px-6 space-y-20 bg-white">
        {members.map((member, index) => (
          <article key={index} className="group flex flex-col bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            
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
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#951114] block mb-2">{member.role}</span>
                  <h2 className="text-xl font-black text-black uppercase leading-tight">
                    {member.name}
                  </h2>
                  <p className="text-slate-500 font-bold text-[10px] mt-2 uppercase tracking-widest">
                    {member.batch}
                  </p>
                </div>
                
                <div className="mt-8 space-y-4 w-full pt-6 border-t border-slate-200">
                  <ContactItem icon={<MapPin size={14}/>} text={member.location} />
                  <ContactItem icon={<Mail size={14}/>} text={member.email} />
                  <ContactItem icon={<Phone size={14}/>} text={member.phone} />
                </div>
              </div>

              {/* Highlights Section */}
              <div className="flex-1 p-8 md:p-14 bg-white">
                <div className="flex items-center gap-3 mb-10">
                  <Briefcase className="text-[#951114]" size={22} />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">
                    Professional Highlights
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
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Activity Log & Domain</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {member.gallery.map((img, i) => (
                    <div key={i} className="relative h-56 overflow-hidden rounded-sm shadow-sm group">
                      <Image 
                        src={img} 
                        alt="Domain Activity" 
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
          IET Lucknow Alumni Association • Executive Board Record
        </p>
      </footer>
    </div>
  );
};

const ContactItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#951114] transition-colors cursor-default">
    <span className="text-[#951114]">{icon}</span>
    {text}
  </div>
);

export default ExecutiveCommittee;