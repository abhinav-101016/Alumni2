// 📁 src/app/(protected)/admin/events/[id]/edit/page.jsx
"use client";

import { EventForm } from "@/components/AdminContentForms";
import { useEffect, useState, use } from "react";

export default function EditEventPage({ params }) {
  const { id } = use(params); // ← Next.js 15: params is a Promise, must be unwrapped with use()
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/events/${id}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setEvent(d.event);
        else setError(d.message || "Failed to load event");
      })
      .catch(() => setError("Network error — could not load event"));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-bold text-red-600 mb-2">Failed to load</p>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin border-slate-200"
            style={{ borderTopColor: "#0369a1" }}
          />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading event…</p>
        </div>
      </div>
    );
  }

  return <EventForm existing={event} />;
}