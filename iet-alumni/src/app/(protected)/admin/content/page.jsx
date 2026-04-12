// 📁 src/app/(protected)/admin/content/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, CalendarDays, Newspaper, Trash2, ChevronLeft,
  ChevronRight, AlertTriangle, X, Search, Filter, RefreshCw,
  ExternalLink, Clock, CheckCircle, Archive, FileEdit, MapPin,
  Wifi, Eye, TrendingUp,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const TAB_CFG = {
  blogs:  { label: "Blogs",  Icon: BookOpen,     accent: "#7c3aed", light: "#ede9fe", border: "#c4b5fd" },
  events: { label: "Events", Icon: CalendarDays, accent: "#0369a1", light: "#e0f2fe", border: "#7dd3fc" },
  news:   { label: "News",   Icon: Newspaper,    accent: "#b45309", light: "#fef3c7", border: "#fcd34d" },
};

const STATUS_CFG = {
  // blogs / news
  draft:     { label: "Draft",     bg: "#f1f5f9", border: "#cbd5e1", color: "#475569" },
  published: { label: "Published", bg: "#dcfce7", border: "#86efac", color: "#15803d" },
  archived:  { label: "Archived",  bg: "#f3f4f6", border: "#d1d5db", color: "#6b7280" },
  // events
  upcoming:  { label: "Upcoming",  bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" },
  ongoing:   { label: "Ongoing",   bg: "#dcfce7", border: "#86efac", color: "#15803d" },
  completed: { label: "Completed", bg: "#f1f5f9", border: "#cbd5e1", color: "#475569" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", border: "#fca5a5", color: "#dc2626" },
};

const STATUS_OPTS = {
  blogs:  ["", "draft", "published", "archived"],
  events: ["", "upcoming", "ongoing", "completed", "cancelled"],
  news:   ["", "draft", "published", "archived"],
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ─────────────────────────────────────────────
   SMALL ATOMS
───────────────────────────────────────────── */
function StatusPill({ status }) {
  const s = STATUS_CFG[status] ?? { label: status, bg: "#f1f5f9", border: "#cbd5e1", color: "#64748b" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function TabBtn({ id, label, Icon, accent, light, border, count, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className="relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap"
      style={
        active
          ? { background: light, border: `1.5px solid ${border}`, color: accent }
          : { background: "white", border: "1.5px solid #e2e8f0", color: "#64748b" }
      }
    >
      <Icon size={15} />
      {label}
      {count != null && (
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-black"
          style={
            active
              ? { background: accent, color: "white" }
              : { background: "#e2e8f0", color: "#64748b" }
          }
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────────────── */
function DeleteModal({ item, tab, onConfirm, onCancel, loading }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">Delete {tab.slice(0, -1)}?</h3>
            <p className="text-slate-500 text-sm mt-1">This action cannot be undone.</p>
          </div>
          <button onClick={onCancel} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Title</p>
          <p className="text-sm font-semibold text-slate-800 line-clamp-2">{item.title}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTENT ROWS
───────────────────────────────────────────── */
function BlogRow({ item, onDelete }) {
  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
        {item.image?.url
          ? <img src={item.image.url} alt={item.image.altText || item.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen size={18} className="text-slate-300" /></div>
        }
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
          <StatusPill status={item.status} />
          {item.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
              {item.category}
            </span>
          )}
        </div>
        {item.excerpt && <p className="text-xs text-slate-500 line-clamp-1 mb-1">{item.excerpt}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
          <span>By <span className="font-semibold text-slate-600">{item.createdByName}</span></span>
          <span>Created {fmt(item.createdAt)}</span>
          {item.publishedAt && <span>Published {fmt(item.publishedAt)}</span>}
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(item)}
          className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function EventRow({ item, onDelete }) {
  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
        {item.image?.url
          ? <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><CalendarDays size={18} className="text-slate-300" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
          <StatusPill status={item.status} />
          {item.isVirtual && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Wifi size={9} /> Virtual
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 mb-1">
          {item.location && (
            <span className="flex items-center gap-1"><MapPin size={9} />{item.location}</span>
          )}
          <span className="flex items-center gap-1"><Clock size={9} />{fmt(item.startDate)}{item.endDate ? ` → ${fmt(item.endDate)}` : ""}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-400">
          <span>By <span className="font-semibold text-slate-600">{item.createdByName}</span></span>
          <span>Posted {fmt(item.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(item)}
          className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function NewsRow({ item, onDelete }) {
  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
        {item.image?.url
          ? <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Newspaper size={18} className="text-slate-300" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
          <StatusPill status={item.status} />
          {item.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {item.category}
            </span>
          )}
        </div>
        {item.excerpt && <p className="text-xs text-slate-500 line-clamp-1 mb-1">{item.excerpt}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
          <span>By <span className="font-semibold text-slate-600">{item.createdByName}</span></span>
          <span>Created {fmt(item.createdAt)}</span>
          {item.publishedAt && <span>Published {fmt(item.publishedAt)}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(item)}
          className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AdminContentPage() {
  const [tab, setTab]         = useState("blogs");
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState("");
  const [counts, setCounts]   = useState({});
  const [items, setItems]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  /* ── Fetch ── */
  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ tab, page, limit: 10, ...(status && { status }) });
      const res = await fetch(`${API}/api/admin/content?${params}`, { credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load");
      setCounts(json.counts);
      setItems(json.items);
      setPagination(json.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab, page, status]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  /* ── Tab switch resets page & status ── */
  const handleTabChange = (t) => { setTab(t); setPage(1); setStatus(""); };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/content/${tab}/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDeleteTarget(null);
      showToast("Deleted successfully", "success");
      fetchContent();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cfg = TAB_CFG[tab];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Admin Panel</p>
            <h1 className="text-3xl font-black text-slate-900">Content Manager</h1>
            <p className="text-slate-500 text-sm mt-1">View and moderate blogs, events, and news.</p>
          </div>
          <button
            onClick={fetchContent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Summary stat cards ── */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(TAB_CFG).map(([id, { label, Icon, accent, light, border }]) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className="bg-white border rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md text-left"
              style={{ borderColor: tab === id ? border : "#e2e8f0" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: tab === id ? accent : "#f1f5f9" }}>
                <Icon size={18} style={{ color: tab === id ? "white" : "#94a3b8" }} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tabular-nums">{counts[id] ?? "—"}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(TAB_CFG).map(([id, props]) => (
            <TabBtn key={id} id={id} {...props} count={counts[id]} active={tab === id} onClick={handleTabChange} />
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Filter size={12} /> Filter by status
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTS[tab].map((s) => (
              <button
                key={s || "all"}
                onClick={() => { setStatus(s); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border"
                style={
                  status === s
                    ? { background: cfg.accent, color: "white", borderColor: cfg.accent }
                    : { background: "white", color: "#64748b", borderColor: "#e2e8f0" }
                }
              >
                {s ? (STATUS_CFG[s]?.label ?? s) : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content table ── */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <cfg.Icon size={13} style={{ color: cfg.accent }} />
              {cfg.label}
              {pagination.total != null && (
                <span className="text-slate-400 font-semibold">({pagination.total})</span>
              )}
            </h2>
            {pagination.totalPages > 1 && (
              <p className="text-xs text-slate-400 font-semibold">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            )}
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: cfg.light, borderTopColor: cfg.accent }} />
              <p className="text-slate-500 text-sm font-semibold">Loading {cfg.label.toLowerCase()}…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <AlertTriangle size={28} className="text-red-400" />
              <p className="text-slate-700 font-bold">{error}</p>
              <button onClick={fetchContent} className="text-xs text-blue-600 font-bold hover:underline mt-1">
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <cfg.Icon size={28} className="text-slate-300" />
              <p className="text-slate-400 text-sm font-semibold">No {cfg.label.toLowerCase()} found.</p>
            </div>
          ) : (
            <div>
              {tab === "blogs"  && items.map((item) => <BlogRow  key={item._id} item={item} onDelete={setDeleteTarget} />)}
              {tab === "events" && items.map((item) => <EventRow key={item._id} item={item} onDelete={setDeleteTarget} />)}
              {tab === "news"   && items.map((item) => <NewsRow  key={item._id} item={item} onDelete={setDeleteTarget} />)}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg text-xs font-bold transition-all border"
                      style={
                        p === page
                          ? { background: cfg.accent, color: "white", borderColor: cfg.accent }
                          : { background: "white", color: "#64748b", borderColor: "#e2e8f0" }
                      }
                    >
                      {p}
                    </button>
                  ))}
              </div>

              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      <DeleteModal
        item={deleteTarget}
        tab={tab}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold transition-all"
          style={
            toast.type === "success"
              ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d" }
              : { background: "#fff1f2", border: "1px solid #fca5a5", color: "#dc2626" }
          }
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}