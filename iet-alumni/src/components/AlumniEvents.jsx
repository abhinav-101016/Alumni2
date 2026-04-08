"use client";
import React, { useEffect, useState } from "react";
import "@fontsource/playfair-display/700.css";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const AlumniEvents = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();

        // Filter to only upcoming/active events, take first 3
        const upcoming = (data.events || [])
          .filter((e) => e.status === "upcoming" || e.status === "active")
          .slice(0, 3);

        setEvents(upcoming);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      month: MONTHS[d.getMonth()],
      day:   String(d.getDate()).padStart(2, "0"),
    };
  };

  const formatTime = (startTime, endTime, isVirtual) => {
    const base = [startTime, endTime].filter(Boolean).join(" – ");
    return base ? `${base} IST` : isVirtual ? "Virtual Event" : "Time TBD";
  };

  return (
    <section id="events" className="bg-white py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* SECTION HEADING */}
        <h2
          style={{ fontFamily: "Playfair Display, serif" }}
          className="text-3xl md:text-5xl font-black uppercase text-slate-900 mb-16 border-b-4 border-[#951114] pb-4 w-fit"
        >
          Attend an Upcoming Alumni Event
        </h2>

        {/* LOADING */}
        {loading && (
          <div className="space-y-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-8 items-stretch animate-pulse">
                <div className="flex-shrink-0 w-32 h-40 bg-slate-100 border-2 border-slate-200" />
                <div className="flex-grow space-y-3 py-2">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-7 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-9 bg-slate-100 rounded w-28 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <p className="text-sm text-red-500 font-medium">
            Could not load events: {error}
          </p>
        )}

        {/* EMPTY */}
        {!loading && !error && events.length === 0 && (
          <p className="text-slate-500 text-base">No upcoming events at the moment. Check back soon.</p>
        )}

        {/* EVENTS LIST */}
        {!loading && !error && events.length > 0 && (
          <div className="space-y-16">
            {events.map((event) => {
              const { month, day } = formatDate(event.startDate);
              const timeStr = formatTime(event.startTime, event.endTime, event.isVirtual);
              const locationStr = event.isVirtual
                ? event.virtualUrl
                  ? `Virtual Event — ${event.virtualUrl}`
                  : "Virtual Event"
                : event.location || "Venue TBD";

              return (
                <div
                  key={event._id}
                  className="flex flex-col md:flex-row gap-8 items-stretch group"
                >
                  {/* DATE BOX */}
                  <div className="flex-shrink-0 w-24 h-32 md:w-32 md:h-40 border-2 border-slate-900 flex flex-col items-center justify-center bg-white transition-all duration-300 group-hover:border-[#951114]">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] mb-1">
                      {month}
                    </span>
                    <span className="text-4xl md:text-6xl font-black text-[#951114] tracking-tighter">
                      {day}
                    </span>
                  </div>

                  {/* EVENT DETAILS */}
                  <div className="flex flex-col justify-between flex-grow py-1">
                    <div className="space-y-2">
                      <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest">
                        {timeStr}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight group-hover:text-[#951114] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-base md:text-lg text-slate-600 font-medium italic">
                        {locationStr}
                      </p>
                    </div>

                    <div className="pt-6 md:pt-0">
                      {event.registrationUrl ? (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-8 py-2.5 border-2 border-[#951114] text-[#951114] text-xs font-black uppercase tracking-[0.2em] hover:bg-[#951114] hover:text-white transition-all duration-300 active:scale-95"
                        >
                          Register Now
                        </a>
                      ) : (
                        <button
                          disabled
                          className="px-8 py-2.5 border-2 border-slate-300 text-slate-400 text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed"
                        >
                          Registration Soon
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default AlumniEvents;