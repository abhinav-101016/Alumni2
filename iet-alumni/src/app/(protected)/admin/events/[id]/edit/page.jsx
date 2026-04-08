"use client";
import { EventForm } from "@/components/AdminContentForms";
import { useEffect, useState } from "react";

export default function Page({ params }) {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/events/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setEvent(d.event));
  }, []);

  if (!event) return <p>Loading…</p>;
  return <EventForm existing={event} />;
}