"use client";
import React from 'react';
import "@fontsource/playfair-display/700.css";

const events = [
  {
    day: "MAR",
    date: "15",
    time: "11:00am IST - 2:00pm IST",
    title: "IET Lucknow Annual Alumni Meet 2026",
    location: "Main Auditorium, IET Campus",
  },
  {
    day: "APR",
    date: "05",
    time: "6:30pm IST - 8:30pm IST",
    title: "Global Tech Leaders: Alumni Panel Discussion",
    location: "Virtual Event (Zoom)",
  },
  {
    day: "MAY",
    date: "22",
    time: "10:00am IST - 4:00pm IST",
    title: "Lucknow Regional Chapter Startup Pitch Day",
    location: "Incubation Center, IET Lucknow",
  }
];

const AlumniEvents = () => {
  return (
    <section className="bg-white py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* SECTION HEADING */}
        <h2 
          style={{ fontFamily: "Playfair Display, serif" }} 
          className="text-3xl md:text-5xl font-black uppercase  text-slate-900 mb-16 border-b-4 border-[#951114] pb-4 w-fit"
        >
          Attend an Upcoming Alumni Event
        </h2>

        <div className="space-y-16">
          {events.map((event, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-8 items-stretch group">
              
              {/* DATE BOX - Red Accents */}
              <div className="flex-shrink-0 w-24 h-32 md:w-32 md:h-40 border-2 border-slate-900 flex flex-col items-center justify-center bg-white transition-all duration-300 group-hover:border-[#951114]">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] mb-1">
                  {event.day}
                </span>
                <span className="text-4xl md:text-6xl font-black text-[#951114] tracking-tighter">
                  {event.date}
                </span>
              </div>

              {/* EVENT DETAILS - Flex-col with justify-between for alignment */}
              <div className="flex flex-col justify-between flex-grow py-1">
                <div className="space-y-2">
                  <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest">
                    {event.time}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight group-hover:text-[#951114] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-base md:text-lg text-slate-600 font-medium italic">
                    {event.location}
                  </p>
                </div>

                {/* REGISTER BUTTON - Aligned to bottom of the date box */}
                <div className="pt-6 md:pt-0">
                  <button className="px-8 py-2.5 border-2 border-[#951114] text-[#951114] text-xs font-black uppercase tracking-[0.2em] hover:bg-[#951114] hover:text-white transition-all duration-300 transform active:scale-95">
                    Register Now
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlumniEvents;