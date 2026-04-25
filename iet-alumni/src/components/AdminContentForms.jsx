"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Auth Guard ───────────────────────────────────────────────────────────────
function useAdminGuard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
      credentials: "include",
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.user?.role === "admin") {
          setAllowed(true);
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/login"));
  }, []);

  return allowed;
}

// ─── Shared ENUMS ─────────────────────────────────────────────────────────────
const BLOG_CATEGORIES  = ["Alumni Stories", "Campus Life", "Industry Insights", "Mentorship", "Announcements", "Other"];
const NEWS_CATEGORIES  = ["Announcement", "Achievement", "Event", "Research", "Industry", "General"];
const CONTENT_STATUSES = ["draft", "published"];


// ─── Shared UI Components ─────────────────────────────────────────────────────

const SectionLabel = ({ number, label }) => (
  <p className="text-[10px] font-black text-[#951114] uppercase tracking-[0.4em] mb-6 px-2 flex items-center gap-3">
    <span className="w-4 h-px bg-[#951114]" />
    {number}. {label}
  </p>
);

const Field = ({ label, name, type = "text", options, value, onChange, error, rows, placeholder, required }) => (
  <div className="flex flex-col gap-1.5 px-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">
      {label}{required && <span className="text-[#951114] ml-0.5">*</span>}
    </label>
    <div className="relative">
      {options ? (
        <select
          name={name} value={value} onChange={onChange}
          className={`w-full px-4 py-2.5 bg-white border ${error ? "border-[#951114]" : "border-slate-300"} focus:border-[#951114] outline-none text-xs text-black font-medium transition-all appearance-none cursor-pointer`}
        >
          <option value="">— Select {label} —</option>
          {options.map(o => (
            <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
          className={`w-full px-4 py-2.5 bg-white border ${error ? "border-[#951114]" : "border-slate-300"} focus:border-[#951114] outline-none text-xs text-black font-medium placeholder:text-slate-400 transition-all resize-y`}
        />
      ) : (
        <input
          type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full px-4 py-2.5 bg-white border ${error ? "border-[#951114]" : "border-slate-300"} focus:border-[#951114] outline-none text-xs text-black font-medium placeholder:text-slate-400 transition-all`}
        />
      )}
    </div>
    {error && <p className="text-[10px] text-[#951114] font-bold ml-1 uppercase tracking-wide">{error}</p>}
  </div>
);

const ImageUpload = ({ value, onChange, error }) => {
  const inputRef = useRef();
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="px-2 col-span-full">
      <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1 block mb-1.5">
        Cover Image
      </label>
      <div
        onClick={() => inputRef.current.click()}
        className={`relative border-2 border-dashed ${error ? "border-[#951114]" : "border-slate-300"} hover:border-[#951114] transition-all cursor-pointer group`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</span>
            </div>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-slate-300 flex items-center justify-center group-hover:border-[#951114] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-[#951114] transition-all">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#951114] transition-all">
              Click to Upload
            </p>
            <p className="text-[9px] text-slate-300 uppercase tracking-wider">JPG / PNG / WEBP</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {error && <p className="text-[10px] text-[#951114] font-bold ml-1 mt-1 uppercase tracking-wide">{error}</p>}
    </div>
  );
};

const CheckboxField = ({ label, name, checked, onChange }) => (
  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 cursor-pointer select-none px-2">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="accent-[#951114] w-3.5 h-3.5" />
    {label}
  </label>
);

const SubmitRow = ({ loading, label, message }) => (
  <div className="pt-8 flex flex-col items-center border-t border-slate-100 gap-4">
    <button
      type="submit" disabled={loading}
      className="w-full max-w-[260px] py-4 bg-[#951114] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all duration-300 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Submitting…" : label}
    </button>
    {message && (
      <p className={`text-[11px] font-bold uppercase tracking-widest ${message.startsWith("✅") ? "text-green-600" : "text-[#951114]"}`}>
        {message}
      </p>
    )}
  </div>
);

const FormShell = ({ title, subtitle, children }) => (
  <main className="min-h-screen bg-white flex flex-col items-center justify-start py-12 px-4">
    <div className="w-full max-w-3xl bg-white border border-slate-200 shadow-sm overflow-hidden rounded-sm">
      <div className="pt-10 pb-6 text-center border-b border-slate-100">
        <div className="w-10 h-1 bg-[#951114] mx-auto mb-4" />
        <h2 className="text-3xl font-black text-black uppercase tracking-tighter">{title}</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
    <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">Admin Panel • IET Lucknow</p>
  </main>
);

// ─── BLOG FORM ────────────────────────────────────────────────────────────────
export function BlogForm({ existing = null }) {
  const allowed = useAdminGuard();
  const router  = useRouter();
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState("");
  const [errors, setErrors]       = useState({});
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title: "", excerpt: "", content: "",
    category: "", tags: "", status: "draft", note: "",
    ...existing,
    tags: Array.isArray(existing?.tags) ? existing.tags.join(", ") : (existing?.tags ?? ""), // ✅ normalize array → string
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = "Title is required";
    if (!form.excerpt.trim()) e.excerpt = "Excerpt is required";
    if (!form.content.trim()) e.content = "Content is required";
    if (!form.category)       e.category = "Select a category";
    if (!existing && !imageFile) e.image = "Cover image is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setMessage("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, k === "tags" ? JSON.stringify((Array.isArray(v) ? v : v.split(",")).map(t => t.trim()).filter(Boolean)) : v));
      if (imageFile) fd.append("image", imageFile);

      const url = existing
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blogs/${existing._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blogs`;

      const res  = await fetch(url, {
        method: existing ? "PUT" : "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`✅ Blog ${existing ? "updated" : "created"} successfully`);
      setTimeout(() => router.push("/dashboard"), 1200); // ✅ redirect for both create and edit
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!allowed) return null;

  return (
    <FormShell title={existing ? "Edit Blog" : "New Blog Post"} subtitle="Admin Content Management">
      <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10" encType="multipart/form-data">

        <section>
          <SectionLabel number="01" label="Post Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
            <div className="col-span-full">
              <Field label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title} placeholder="Enter blog title…" required />
            </div>
            <div className="col-span-full">
              <Field label="Excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} error={errors.excerpt} rows={2} placeholder="Short description shown in previews…" required />
            </div>
            <div className="col-span-full">
              <Field label="Content" name="content" value={form.content} onChange={handleChange} error={errors.content} rows={10} placeholder="Full blog content (Markdown supported)…" required />
            </div>
          </div>
        </section>

        <section>
          <SectionLabel number="02" label="Classification" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
            <Field label="Category" name="category" options={BLOG_CATEGORIES} value={form.category} onChange={handleChange} error={errors.category} required />
            <Field label="Status"   name="status"   options={CONTENT_STATUSES} value={form.status}   onChange={handleChange} />
            <div className="col-span-full">
              <Field label="Tags (comma-separated)" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. alumni, tech, 2024" />
            </div>
          </div>
        </section>

        <section>
          <SectionLabel number="03" label="Media" />
          <div className="grid grid-cols-1 gap-y-5">
            <ImageUpload value={imageFile} onChange={setImageFile} error={errors.image} />
          </div>
        </section>

        {existing && (
          <section>
            <SectionLabel number="04" label="Edit Note" />
            <Field label="Note (optional)" name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Describe what changed and why…" />
          </section>
        )}

        <SubmitRow loading={loading} label={existing ? "Update Blog" : "Publish Blog"} message={message} />
      </form>
    </FormShell>
  );
}

// ─── EVENT FORM ───────────────────────────────────────────────────────────────
export function EventForm({ existing = null }) {
  const allowed = useAdminGuard();
  const router  = useRouter();
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState("");
  const [errors, setErrors]       = useState({});
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState(() => {
    const base = {
      title: "", description: "",
      startDate: "", endDate: "", startTime: "", endTime: "",
      location: "", isVirtual: false, virtualUrl: "",
      registrationUrl: "", registrationDeadline: "", maxAttendees: "",
      status: "upcoming", note: "",
      ...existing,
      isVirtual: existing?.isVirtual ?? false,
    };
    // ✅ Re-derive status from stored dates on initial load
    if (existing?.startDate) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const start = new Date(existing.startDate); start.setHours(0, 0, 0, 0);
      const end   = existing.endDate ? new Date(existing.endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
      if (today < start)           base.status = "upcoming";
      else if (today > (end ?? start)) base.status = "completed";
      else                         base.status = "ongoing";
    }
    return base;
  });

  // ─── Auto-derive event status from dates ────────────────────────────────
  const deriveStatus = (startDate, endDate) => {
    if (!startDate) return "upcoming";
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(startDate); start.setHours(0, 0, 0, 0);
    const end   = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    if (today < start) return "upcoming";
    if (today > (end ?? start)) return "completed";
    return "ongoing";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => {
      const updated = { ...p, [name]: type === "checkbox" ? checked : value };
      if (name === "startDate" || name === "endDate") {
        updated.status = deriveStatus(
          name === "startDate" ? value : p.startDate,
          name === "endDate"   ? value : p.endDate
        );
      }
      return updated;
    });
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.startDate)          e.startDate   = "Start date is required";
    if (!form.location.trim() && !form.isVirtual) e.location = "Location required for in-person events";
    if (form.isVirtual && !form.virtualUrl.trim()) e.virtualUrl = "Virtual URL is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setMessage("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) fd.append(k, String(v));
      });
      if (imageFile) fd.append("image", imageFile);

      const url = existing
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/events/${existing._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/events`;

      const res  = await fetch(url, {
        method: existing ? "PUT" : "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`✅ Event ${existing ? "updated" : "created"} successfully`);
      setTimeout(() => router.push("/dashboard"), 1200); // ✅ redirect for both create and edit
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!allowed) return null;

  return (
    <FormShell title={existing ? "Edit Event" : "New Event"} subtitle="Admin Content Management">
      <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10" encType="multipart/form-data">

        <section>
          <SectionLabel number="01" label="Event Details" />
          <div className="grid grid-cols-1 gap-y-5">
            <Field label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title} placeholder="Event name…" required />
            <Field label="Description" name="description" value={form.description} onChange={handleChange} error={errors.description} rows={5} placeholder="Full event description…" required />
          </div>
        </section>

        <section>
          <SectionLabel number="02" label="Schedule" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
            <Field label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} error={errors.startDate} required />
            <Field label="End Date"   name="endDate"   type="date" value={form.endDate}   onChange={handleChange} />
            <Field label="Start Time" name="startTime" type="time" value={form.startTime} onChange={handleChange} />
            <Field label="End Time"   name="endTime"   type="time" value={form.endTime}   onChange={handleChange} />
            <Field label="Registration Deadline" name="registrationDeadline" type="date" value={form.registrationDeadline} onChange={handleChange} />
            <Field label="Max Attendees" name="maxAttendees" type="number" value={form.maxAttendees} onChange={handleChange} placeholder="Leave blank for unlimited" />
            {/* ── Auto-derived status badge ── */}
            {form.startDate && (
              <div className="col-span-full px-2 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">Derived Status:</span>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                  form.status === "upcoming"  ? "bg-blue-50 border-blue-300 text-blue-700"   :
                  form.status === "ongoing"   ? "bg-green-50 border-green-300 text-green-700" :
                                               "bg-slate-100 border-slate-300 text-slate-500"
                }`}>
                  {form.status}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wide">auto-calculated from dates</span>
              </div>
            )}
          </div>
        </section>

        <section>
          <SectionLabel number="03" label="Location" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
            <div className="col-span-full px-2">
              <CheckboxField label="This is a virtual / online event" name="isVirtual" checked={form.isVirtual} onChange={handleChange} />
            </div>
            {!form.isVirtual && (
              <div className="col-span-full">
                <Field label="Venue / Location" name="location" value={form.location} onChange={handleChange} error={errors.location} placeholder="Hall / Campus / City…" required />
              </div>
            )}
            {form.isVirtual && (
              <div className="col-span-full">
                <Field label="Virtual URL" name="virtualUrl" type="url" value={form.virtualUrl} onChange={handleChange} error={errors.virtualUrl} placeholder="https://meet.google.com/…" required />
              </div>
            )}
            <div className="col-span-full">
              <Field label="Registration URL (optional)" name="registrationUrl" type="url" value={form.registrationUrl} onChange={handleChange} placeholder="https://forms.gle/…" />
            </div>
          </div>
        </section>

        <section>
          <SectionLabel number="04" label="Media" />
          <div className="grid grid-cols-1 gap-y-5">
            <ImageUpload value={imageFile} onChange={setImageFile} error={errors.image} />
          </div>
        </section>

        {existing && (
          <section>
            <SectionLabel number="05" label="Edit Note" />
            <Field label="Note (optional)" name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Describe what changed…" />
          </section>
        )}

        <SubmitRow loading={loading} label={existing ? "Update Event" : "Create Event"} message={message} />
      </form>
    </FormShell>
  );
}

// ─── NEWS FORM ────────────────────────────────────────────────────────────────
export function NewsForm({ existing = null }) {
  const allowed = useAdminGuard();
  const router  = useRouter();
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState("");
  const [errors, setErrors]       = useState({});
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title: "", excerpt: "", content: "",
    category: "", status: "draft", note: "",
    ...existing
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = "Title is required";
    if (!form.excerpt.trim()) e.excerpt = "Excerpt is required";
    if (!form.content.trim()) e.content = "Content is required";
    if (!form.category)       e.category = "Select a category";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setMessage("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      const url = existing
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/news/${existing._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/news`;

      const res  = await fetch(url, {
        method: existing ? "PUT" : "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`✅ News ${existing ? "updated" : "published"} successfully`);
      setTimeout(() => router.push("/dashboard"), 1200); // ✅ redirect for both create and edit
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!allowed) return null;

  return (
    <FormShell title={existing ? "Edit News" : "New News Article"} subtitle="Admin Content Management">
      <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10" encType="multipart/form-data">

        <section>
          <SectionLabel number="01" label="Article Details" />
          <div className="grid grid-cols-1 gap-y-5">
            <Field label="Headline" name="title" value={form.title} onChange={handleChange} error={errors.title} placeholder="News headline…" required />
            <Field label="Excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} error={errors.excerpt} rows={2} placeholder="Brief summary shown in listings…" required />
            <Field label="Full Article" name="content" value={form.content} onChange={handleChange} error={errors.content} rows={10} placeholder="Full article content…" required />
          </div>
        </section>

        <section>
          <SectionLabel number="02" label="Classification" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
            <Field label="Category" name="category" options={NEWS_CATEGORIES} value={form.category} onChange={handleChange} error={errors.category} required />
            <Field label="Status"   name="status"   options={CONTENT_STATUSES} value={form.status}   onChange={handleChange} />
          </div>
        </section>

        <section>
          <SectionLabel number="03" label="Media" />
          <div className="grid grid-cols-1 gap-y-5">
            <ImageUpload value={imageFile} onChange={setImageFile} error={errors.image} />
          </div>
        </section>

        {existing && (
          <section>
            <SectionLabel number="04" label="Edit Note" />
            <Field label="Note (optional)" name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Describe what changed…" />
          </section>
        )}

        <SubmitRow loading={loading} label={existing ? "Update Article" : "Publish Article"} message={message} />
      </form>
    </FormShell>
  );
}

// ─── Page exports (Next.js route-level) ──────────────────────────────────────
// app/admin/blogs/new/page.jsx  → export default () => <BlogForm />
// app/admin/blogs/[id]/edit/page.jsx → fetch blog, pass as <BlogForm existing={blog} />
// Same pattern for EventForm and NewsForm