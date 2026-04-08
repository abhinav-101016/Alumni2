"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Clock, MapPin, Globe,
  Users, ExternalLink, Video, CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import "@fontsource/playfair-display/700.css";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const STATUS_STYLES = {
  upcoming:  { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200",  dot: "bg-emerald-500"  },
  active:    { bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200",     dot: "bg-blue-500"     },
  past:      { bg: "bg-slate-50",    text: "text-slate-500",    border: "border-slate-200",    dot: "bg-slate-400"    },
  cancelled: { bg: "bg-red-50",      text: "text-red-700",      border: "border-red-200",      dot: "bg-red-500"      },
};

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

  // ── LOADING ───────────────────────────────────────────────────────────────
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

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center gap-4">
      <Calendar size={40} className="text-slate-300" />
      <p className="text-slate-500 text-lg">{error}</p>
      <button onClick={() => router.back()} className="text-[#951114] font-bold underline underline-offset-4">
        Go Back
      </button>
    </div>
  );

  if (!event) return null;

  const status = STATUS_STYLES[event.status] || STATUS_STYLES.upcoming;
  const startParts = getDateParts(event.startDate);
  const multiDay = event.endDate && !isSameDay(event.startDate, event.endDate);

  return (
    <div className="min-h-screen bg-[#fafaf8]">

      {/* ── STICKY NAV ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#fafaf8]/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#951114] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <span
            style={{ fontFamily: "Playfair Display, serif" }}
            className="text-sm font-bold text-slate-400 hidden md:block"
          >
            IET Alumni — Events
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* ── STATUS BADGE ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border ${status.bg} ${status.text} ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {event.status}
          </span>
        </motion.div>

        {/* ── TITLE ────────────────────────────────────────────────────── */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          style={{ fontFamily: "Playfair Display, serif" }}
          className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-10"
        >
          {event.title}
        </motion.h1>

        {/* ── HERO IMAGE ───────────────────────────────────────────────── */}
        {event.image?.url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-full aspect-[16/7] overflow-hidden mb-10"
          >
            <Image
              src={event.image.url}
              alt={event.image.altText || event.title}
              fill
              className="object-cover"
            />
          </motion.div>
        )}

        {/* ── INFO CARDS GRID ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
        >

          {/* Date card */}
          <div className="flex items-start gap-4 border-2 border-slate-200 p-5 bg-white">
            {/* Big date stamp */}
            <div className="flex-shrink-0 w-16 h-20 border-2 border-[#951114] flex flex-col items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                {startParts.month}
              </span>
              <span className="text-3xl font-black text-[#951114] leading-none">
                {startParts.day}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                <Calendar size={10} /> Date
              </p>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {formatFullDate(event.startDate)}
              </p>
              {multiDay && (
                <>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 mb-0.5">
                    — Until
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {formatFullDate(event.endDate)}
                  </p>
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
                <p className="text-sm font-bold text-slate-900">
                  {event.startTime}{event.endTime ? ` — ${event.endTime}` : ""}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">Time TBD</p>
              )}
            </div>
          </div>

          {/* Location card */}
          <div className="flex items-start gap-4 border-2 border-slate-200 p-5 bg-white">
            <div className="w-10 h-10 border-2 border-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
              {event.isVirtual
                ? <Video size={18} className="text-blue-500" />
                : <MapPin size={18} className="text-[#951114]" />
              }
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {event.isVirtual ? "Virtual Event" : "Venue"}
              </p>
              {event.isVirtual ? (
                event.virtualUrl ? (
                  <a
                    href={event.virtualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-blue-600 underline underline-offset-2 break-all"
                  >
                    {event.virtualUrl}
                  </a>
                ) : (
                  <p className="text-sm text-slate-500 italic">Link will be shared soon</p>
                )
              ) : (
                <p className="text-sm font-bold text-slate-900">{event.location || "Venue TBD"}</p>
              )}
            </div>
          </div>

          {/* Capacity card */}
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
                  {new Date(event.registrationDeadline).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── DESCRIPTION ──────────────────────────────────────────────── */}
        {event.description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <h2
              style={{ fontFamily: "Playfair Display, serif" }}
              className="text-2xl font-black text-slate-900 mb-4 pb-3 border-b-2 border-[#951114] w-fit"
            >
              About this Event
            </h2>
            <div
              style={{ fontFamily: "'Georgia', serif", lineHeight: "1.85", color: "#334155" }}
              className="text-base"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </motion.div>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200"
        >
          {event.registrationUrl && event.status !== "cancelled" && event.status !== "past" ? (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#951114] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all duration-300"
            >
              Register Now
              <ExternalLink size={13} />
            </a>
          ) : event.status === "past" ? (
            <span className="inline-flex items-center gap-2 px-10 py-4 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed">
              Event Concluded
            </span>
          ) : event.status === "cancelled" ? (
            <span className="inline-flex items-center gap-2 px-10 py-4 bg-red-50 text-red-400 border border-red-200 text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed">
              Event Cancelled
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-10 py-4 border-2 border-slate-300 text-slate-400 text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed">
              Registration Opening Soon
            </span>
          )}

          <button
            onClick={() => router.push("/events")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-900 text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all duration-300"
          >
            <ArrowLeft size={13} />
            All Events
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default EventDetailPage;