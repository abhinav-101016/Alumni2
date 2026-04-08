// (protected)/admin/blogs/[id]/edit/page.jsx
"use client";
import { BlogForm } from "@/components/AdminContentForms";
import { useEffect, useState } from "react";

export default function Page({ params }) {
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blogs/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setBlog(d.blog));
  }, []);

  if (!blog) return <p>Loading…</p>;
  return <BlogForm existing={blog} />;
}