"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Video, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import "@fontsource/playfair-display/700.css";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const STATUS_STYLES = {
  upcoming:  { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200",  dot: "bg-emerald-500"  },
  active:    { bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200",     dot: "bg-blue-500"     },
  past:      { bg: "bg-slate-50",    text: "text-slate-500",    border: "border-slate-200",    dot: "bg-slate-400"    },
};
// Guests only see these statuses
const PUBLIC_STATUSES  = ["upcoming", "active", "past"];
const ALL_FILTERS      = ["all", "upcoming", "active", "past"];

const SkeletonRow = () => (
  <div className="flex gap-6 md:gap-10 items-stretch animate-pulse border-b border-slate-100 pb-10">
    <div className="flex-shrink-0 w-20 h-28 md:w-28 md:h-36 bg-slate-100 border-2 border-slate-200" />
    <div className="flex-grow space-y-3 py-1">
      <div className="h-3 bg-slate-100 rounded w-1/5" />
      <div className="h-6 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-1/4 mt-2" />
      <div className="h-8 bg-slate-100 rounded w-24 mt-4" />
    </div>
  </div>
);

export default function EventsPage() {
  const router = useRouter();
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filter,     setFilter]     = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady,  setAuthReady]  = useState(false);

  // ── Auth check ──────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`,
          { credentials: "include" }
        );
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setAuthReady(true);
      }
    };
    checkAuth();
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authReady) return;
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [authReady]);

  // ── Visibility: guests only see public statuses ─────────────────────────
  const visible  = isLoggedIn ? events : events.filter(e => PUBLIC_STATUSES.includes(e.status));
  const filtered = filter === "all" ? visible : visible.filter(e => e.status === filter);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return { month: MONTHS[d.getMonth()], day: String(d.getDate()).padStart(2, "0") };
  };
  const formatTime = (s, e, v) => {
    const base = [s, e].filter(Boolean).join(" – ");
    return base ? `${base} IST` : v ? "Virtual Event" : "Time TBD";
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* NAV */}
      <div className="sticky top-0 z-50 bg-[#fafaf8]/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#951114] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <span style={{ fontFamily: "Playfair Display, serif" }} className="text-sm font-bold text-slate-400 hidden md:block">IET Alumni</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* HEADING */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#951114] mb-3">Alumni Network</p>
          <h1 style={{ fontFamily: "Playfair Display, serif" }} className="text-4xl md:text-6xl font-black uppercase text-slate-900 mb-4 border-b-4 border-[#951114] pb-4 w-fit">
            All Events
          </h1>
          <p className="text-slate-500 text-base mb-10">Browse every alumni gathering, seminar, and virtual meetup.</p>
        </motion.div>

        {/* FILTERS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 mb-12">
          {ALL_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-200 ${filter === f ? "bg-[#951114] border-[#951114] text-white" : "border-slate-300 text-slate-500 hover:border-slate-900 hover:text-slate-900"}`}>
              {f}
            </button>
          ))}
        </motion.div>

        {/* LOADING */}
        {(loading || !authReady) && <div className="space-y-10">{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</div>}

        {/* ERROR */}
        {error && !loading && <p className="text-sm text-red-500 font-medium">Could not load events: {error}</p>}

        {/* EMPTY */}
        {!loading && authReady && !error && filtered.length === 0 && (
          <div className="py-20 text-center">
            <Calendar size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-base">No events found{filter !== "all" ? ` for "${filter}"` : ""}.</p>
          </div>
        )}

        {/* LIST */}
        {!loading && authReady && !error && filtered.length > 0 && (
          <div className="divide-y divide-slate-100">
            {filtered.map((event, idx) => {
              const { month, day } = formatDate(event.startDate);
              const timeStr = formatTime(event.startTime, event.endTime, event.isVirtual);
              const locationStr = event.isVirtual
                ? (event.virtualUrl ? `Virtual — ${event.virtualUrl}` : "Virtual Event")
                : (event.location || "Venue TBD");
              const ss = STATUS_STYLES[event.status] || STATUS_STYLES.upcoming;

              return (
                <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch group py-10">

                  {/* DATE BOX */}
                  <a href={`/events/${event._id}`}
                    className="flex-shrink-0 w-20 h-28 md:w-28 md:h-36 border-2 border-slate-900 flex flex-col items-center justify-center bg-white transition-all duration-300 group-hover:border-[#951114]">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{month}</span>
                    <span className="text-4xl md:text-5xl font-black text-[#951114] tracking-tighter leading-none">{day}</span>
                  </a>

                  {/* THUMBNAIL */}
                  {event.image?.url && (
                    <a href={`/events/${event._id}`} className="flex-shrink-0 hidden sm:block w-36 h-28 md:w-44 md:h-36 overflow-hidden relative">
                      <Image src={event.image.url} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </a>
                  )}

                  {/* DETAILS */}
                  <div className="flex flex-col justify-between flex-grow py-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border ${ss.bg} ${ss.text} ${ss.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />{event.status}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {timeStr}
                        </span>
                      </div>
                      <a href={`/events/${event._id}`} className="block">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight group-hover:text-[#951114] transition-colors">{event.title}</h3>
                      </a>
                      <p className="text-sm text-slate-500 font-medium italic flex items-center gap-1.5">
                        {event.isVirtual ? <Video size={13} className="text-blue-400 flex-shrink-0" /> : <MapPin size={13} className="text-[#951114] flex-shrink-0" />}
                        {locationStr}
                      </p>
                      {event.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed hidden md:block">
                          {event.description.replace(/<[^>]*>/g, "")}
                        </p>
                      )}
                    </div>
                    <div className="pt-4 md:pt-0">
                      {event.registrationUrl && event.status !== "cancelled" && event.status !== "past" ? (
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-block px-7 py-2 border-2 border-[#951114] text-[#951114] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#951114] hover:text-white transition-all duration-300">
                          Register Now
                        </a>
                      ) : event.status === "past" ? (
                        <span className="inline-block px-7 py-2 border-2 border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">Concluded</span>
                      ) : event.status === "cancelled" ? (
                        <span className="inline-block px-7 py-2 border-2 border-red-200 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">Cancelled</span>
                      ) : (
                        <span className="inline-block px-7 py-2 border-2 border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">Registration Soon</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}