"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Clock, MapPin, Globe,
  Users, ExternalLink, Video, CheckCircle2, X, ChevronLeft, ChevronRight, ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import "@fontsource/playfair-display/700.css";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const STATUS_STYLES = {
  upcoming:  { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200",  dot: "bg-emerald-500"  },
  active:    { bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200",     dot: "bg-blue-500"     },
  past:      { bg: "bg-slate-50",    text: "text-slate-500",    border: "border-slate-200",    dot: "bg-slate-400"    },
  cancelled: { bg: "bg-red-50",      text: "text-red-700",      border: "border-red-200",      dot: "bg-red-500"      },
};

/* ─── Lightbox ──────────────────────────────────────────────────────────── */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
        {idx + 1} / {images.length}
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2">
        <X size={22} />
      </button>
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors p-3 border border-white/20 hover:border-white/60"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-5xl max-h-[85vh] w-full mx-16 md:mx-24"
          onClick={(e) => e.stopPropagation()}
        >
          <img src={images[idx].url} alt={images[idx].altText || `Image ${idx + 1}`} className="w-full max-h-[85vh] object-contain" />
          {images[idx].altText && (
            <p className="text-center text-xs text-white/40 mt-3 font-medium">{images[idx].altText}</p>
          )}
        </motion.div>
      </AnimatePresence>
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors p-3 border border-white/20 hover:border-white/60"
        >
          <ChevronRight size={20} />
        </button>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`relative w-12 h-8 overflow-hidden transition-all duration-200 ${i === idx ? "ring-2 ring-[#951114] opacity-100" : "opacity-40 hover:opacity-70"}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ─── Image Gallery ─────────────────────────────────────────────────────── */
const ImageGallery = ({ images }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="relative w-full aspect-[16/7] overflow-hidden mb-10 group cursor-zoom-in"
          onClick={() => setLightboxIdx(0)}
        >
          <Image src={images[0].url} alt={images[0].altText || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </motion.div>
        <AnimatePresence>
          {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
        </AnimatePresence>
      </>
    );
  }

  if (images.length === 2) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10 grid grid-cols-2 gap-2"
        >
          {images.map((img, i) => (
            <div key={i} className="relative overflow-hidden aspect-[4/3] group cursor-zoom-in" onClick={() => setLightboxIdx(i)}>
              <Image src={img.url} alt={img.altText || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="absolute bottom-2 right-2 text-[9px] font-black tracking-widest text-white/70 bg-black/40 px-1.5 py-0.5">
                {i + 1}/{images.length}
              </span>
            </div>
          ))}
        </motion.div>
        <AnimatePresence>
          {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
        </AnimatePresence>
      </>
    );
  }

  // 3+ — mosaic
  const [hero, ...rest] = images;
  const sideImages = rest.slice(0, 2);
  const overflow   = images.length - 3;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-10"
      >
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="col-span-2 relative overflow-hidden aspect-[16/10] group cursor-zoom-in" onClick={() => setLightboxIdx(0)}>
            <Image src={hero.url} alt={hero.altText || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
              <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {sideImages.map((img, i) => {
              const globalIdx = i + 1;
              const isLast    = i === sideImages.length - 1 && overflow > 0;
              return (
                <div key={globalIdx} className="relative overflow-hidden flex-1 group cursor-zoom-in" onClick={() => setLightboxIdx(globalIdx)}>
                  <Image src={img.url} alt={img.altText || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300" />
                  {isLast && (
                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">+{overflow}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/70 mt-1">more</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{images.length} photos — click to view</p>
          <button onClick={() => setLightboxIdx(0)} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#951114] border-b border-[#951114] hover:text-slate-900 hover:border-slate-900 transition-colors">
            View all →
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
      </AnimatePresence>
    </>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────── */
const EventDetailPage = () => {
  const { id }   = useParams();
  const router   = useRouter();
  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events/${id}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data.event);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const formatFullDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

  const getDateParts = (dateStr) => {
    const d = new Date(dateStr);
    return { month: MONTHS[d.getMonth()], day: String(d.getDate()).padStart(2, "0") };
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return true;
    return new Date(d1).toDateString() === new Date(d2).toDateString();
  };

  const getImages = (event) => {
    if (event.images?.length > 0) return event.images;
    if (event.image?.url)         return [event.image];
    return [];
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="w-full max-w-2xl px-6 animate-pulse space-y-6">
        <div className="h-3 bg-slate-200 rounded w-1/6" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-52 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded" />)}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center gap-4">
      <Calendar size={40} className="text-slate-300" />
      <p className="text-slate-500 text-lg">{error}</p>
      <button onClick={() => router.back()} className="text-[#951114] font-bold underline underline-offset-4">Go Back</button>
    </div>
  );

  if (!event) return null;

  const status     = STATUS_STYLES[event.status] || STATUS_STYLES.upcoming;
  const startParts = getDateParts(event.startDate);
  const multiDay   = event.endDate && !isSameDay(event.startDate, event.endDate);
  const images     = getImages(event);

  return (
    <div className="min-h-screen bg-[#fafaf8]">

      {/* STICKY NAV */}
      <div className="sticky top-0 z-50 bg-[#fafaf8]/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#951114] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <span style={{ fontFamily: "Playfair Display, serif" }} className="text-sm font-bold text-slate-400 hidden md:block">IET Alumni — Events</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* STATUS BADGE */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
          <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border ${status.bg} ${status.text} ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{event.status}
          </span>
        </motion.div>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
          style={{ fontFamily: "Playfair Display, serif" }}
          className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-10"
        >
          {event.title}
        </motion.h1>

        {/* ── IMAGE GALLERY ── */}
        <ImageGallery images={images} />

        {/* INFO CARDS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
        >
          {/* Date card */}
          <div className="flex items-start gap-4 border-2 border-slate-200 p-5 bg-white">
            <div className="flex-shrink-0 w-16 h-20 border-2 border-[#951114] flex flex-col items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{startParts.month}</span>
              <span className="text-3xl font-black text-[#951114] leading-none">{startParts.day}</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Calendar size={10} /> Date</p>
              <p className="text-sm font-bold text-slate-900 leading-snug">{formatFullDate(event.startDate)}</p>
              {multiDay && (
                <>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 mb-0.5">— Until</p>
                  <p className="text-sm font-bold text-slate-700">{formatFullDate(event.endDate)}</p>
                </>
              )}
            </div>
          </div>

          {/* Time card */}
          <div className="flex items-start gap-4 border-2 border-slate-200 p-5 bg-white">
            <div className="w-10 h-10 border-2 border-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
              <Clock size={18} className="text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time (IST)</p>
              {event.startTime ? (
                <p className="text-sm font-bold text-slate-900">{event.startTime}{event.endTime ? ` — ${event.endTime}` : ""}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">Time TBD</p>
              )}
            </div>
          </div>

          {/* Location card */}
          <div className="flex items-start gap-4 border-2 border-slate-200 p-5 bg-white">
            <div className="w-10 h-10 border-2 border-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
              {event.isVirtual ? <Video size={18} className="text-blue-500" /> : <MapPin size={18} className="text-[#951114]" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {event.isVirtual ? "Virtual Event" : "Venue"}
              </p>
              {event.isVirtual ? (
                event.virtualUrl ? (
                  <a href={event.virtualUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 underline underline-offset-2 break-all">{event.virtualUrl}</a>
                ) : (
                  <p className="text-sm text-slate-500 italic">Link will be shared soon</p>
                )
              ) : (
                <p className="text-sm font-bold text-slate-900">{event.location || "Venue TBD"}</p>
              )}
            </div>
          </div>

          {/* Capacity */}
          {event.maxAttendees && (
            <div className="flex items-start gap-4 border-2 border-slate-200 p-5 bg-white">
              <div className="w-10 h-10 border-2 border-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                <Users size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Capacity</p>
                <p className="text-sm font-bold text-slate-900">{event.maxAttendees} attendees</p>
              </div>
            </div>
          )}

          {/* Registration deadline */}
          {event.registrationDeadline && (
            <div className="flex items-start gap-4 border-2 border-amber-100 p-5 bg-amber-50">
              <div className="w-10 h-10 border-2 border-amber-200 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Register By</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(event.registrationDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* DESCRIPTION */}
        {event.description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <h2 style={{ fontFamily: "Playfair Display, serif" }} className="text-2xl font-black text-slate-900 mb-4 pb-3 border-b-2 border-[#951114] w-fit">
              About this Event
            </h2>
            <div style={{ fontFamily: "'Georgia', serif", lineHeight: "1.85", color: "#334155" }} className="text-base" dangerouslySetInnerHTML={{ __html: event.description }} />
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200"
        >
          {event.registrationUrl && event.status !== "cancelled" && event.status !== "past" ? (
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#951114] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all duration-300">
              Register Now <ExternalLink size={13} />
            </a>
          ) : event.status === "past" ? (
            <span className="inline-flex items-center gap-2 px-10 py-4 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed">Event Concluded</span>
          ) : event.status === "cancelled" ? (
            <span className="inline-flex items-center gap-2 px-10 py-4 bg-red-50 text-red-400 border border-red-200 text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed">Event Cancelled</span>
          ) : (
            <span className="inline-flex items-center gap-2 px-10 py-4 border-2 border-slate-300 text-slate-400 text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed">Registration Opening Soon</span>
          )}

          <button onClick={() => router.push("/events")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-900 text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all duration-300">
            <ArrowLeft size={13} /> All Events
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default EventDetailPage;