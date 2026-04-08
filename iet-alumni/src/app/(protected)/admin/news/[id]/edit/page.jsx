"use client";
import { NewsForm } from "@/components/AdminContentForms";
import { useEffect, useState } from "react";

export default function Page({ params }) {
  const [news, setNews] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/news/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setNews(d.news));
  }, []);

  if (!news) return <p>Loading…</p>;
  return <NewsForm existing={news} />;
}