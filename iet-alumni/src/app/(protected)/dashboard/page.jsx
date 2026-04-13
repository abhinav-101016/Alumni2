// 📁 src/app/(protected)/dashboard/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Clock, CheckCircle, XCircle, ShieldCheck, Mail, Phone,
  MapPin, GraduationCap, Briefcase, Star, Github, Linkedin,
  Twitter, Globe, AlertCircle, CalendarDays,
  BookOpen, Building2, ChevronRight, ChevronLeft,
  Newspaper, Trash2, AlertTriangle, X, RefreshCw,
} from "lucide-react";

// ─── Brand token ───────────────────────────────────────────────
const RED       = "#951114";
const RED_DARK  = "#7a0d0f";
const RED_LIGHT = "#fff1f2";
const RED_BORDER= "#fecdd3";
// ────────────────────────────────────────────────────────────────

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const initials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

const PILL_S = {
  green:  { background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46" },
  amber:  { background: "#fef3c7", border: "1px solid #fcd34d", color: "#78350f" },
  red:    { background: RED_LIGHT, border: `1px solid ${RED_BORDER}`, color: RED_DARK },
  slate:  { background: "#e2e8f0", border: "1px solid #94a3b8", color: "#1e293b" },
};

const STATUS_CFG = {
  active:    { pillStyle: PILL_S.green, icon: CheckCircle, label: "Active"    },
  pending:   { pillStyle: PILL_S.amber, icon: Clock,       label: "Pending"   },
  rejected:  { pillStyle: PILL_S.red,   icon: XCircle,     label: "Rejected"  },
  suspended: { pillStyle: PILL_S.slate, icon: ShieldCheck, label: "Suspended" },
};

/* ── Pill ── */
function Pill({ children, pillStyle = {}, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${className}`}
      style={{ border: "1px solid #cbd5e1", ...pillStyle }}
    >
      {children}
    </span>
  );
}

/* ── InfoTile ── */
function InfoTile({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{value || "—"}</p>
    </div>
  );
}

/* ── StatCard ── */
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: RED }}
      >
        <Icon size={20} className="text-white" strokeWidth={2} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 leading-none tabular-nums">{value ?? 0}</p>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ── VerificationBadges ── */
function VerificationBadges({ verification, accountStatus }) {
  const st = STATUS_CFG[accountStatus] ?? STATUS_CFG.pending;
  const StatusIcon = st.icon;
  return (
    <div className="flex flex-wrap gap-2">
      <Pill pillStyle={st.pillStyle}>
        <StatusIcon size={11} /> {st.label}
      </Pill>
      <Pill pillStyle={verification?.isEmailVerified ? PILL_S.green : PILL_S.red}>
        <Mail size={11} /> Email {verification?.isEmailVerified ? "Verified" : "Unverified"}
      </Pill>
      <Pill pillStyle={verification?.isVerifiedByAdmin ? PILL_S.green : PILL_S.amber}>
        <ShieldCheck size={11} /> Admin {verification?.isVerifiedByAdmin ? "Verified" : "Pending"}
      </Pill>
    </div>
  );
}

/* ── ContactInfo ── */
function ContactInfo({ email, phone, city, country }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-slate-600 mb-4">
      <span className="flex items-center gap-1.5">
        <Mail size={12} className="text-slate-400 flex-shrink-0" />
        {email}
      </span>
      {phone && (
        <>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <Phone size={12} className="text-slate-400 flex-shrink-0" />
            {phone}
          </span>
        </>
      )}
      {city && (
        <>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-400 flex-shrink-0" />
            {city}{country ? `, ${country}` : ""}
          </span>
        </>
      )}
    </div>
  );
}

/* ── StatusBanners ── */
function StatusBanners({ user }) {
  const { verification, accountStatus, isProfileComplete, role } = user;
  const banners = [];

  if (!verification?.isEmailVerified) {
    banners.push({
      id: "email", icon: Mail,
      wrapStyle: { background: RED_LIGHT, border: `1px solid ${RED_BORDER}` },
      iconStyle: { color: RED }, titleStyle: { color: RED_DARK }, descStyle: { color: RED },
      title: "Email not verified",
      desc: "Please check your inbox and verify your email to activate your account.",
    });
  }

  if (accountStatus === "rejected") {
    banners.push({
      id: "rejected", icon: XCircle,
      wrapStyle: { background: RED_LIGHT, border: `1px solid ${RED_BORDER}` },
      iconStyle: { color: RED }, titleStyle: { color: RED_DARK }, descStyle: { color: RED },
      title: "Account rejected",
      desc: "Your registration was not approved. Please contact the admin for more information.",
    });
  }

  if (accountStatus === "suspended") {
    banners.push({
      id: "suspended", icon: ShieldCheck,
      wrapStyle: { background: "#f1f5f9", border: "1px solid #cbd5e1" },
      iconStyle: { color: "#475569" }, titleStyle: { color: "#1e293b" }, descStyle: { color: "#334155" },
      title: "Account suspended",
      desc: "Your account has been suspended. Reach out to the admin to resolve this.",
    });
  }

  if (verification?.isEmailVerified && accountStatus === "pending" && !verification?.isVerifiedByAdmin) {
    banners.push({
      id: "admin-pending", icon: Clock,
      wrapStyle: { background: "#fffbeb", border: "1px solid #fde68a" },
      iconStyle: { color: "#d97706" }, titleStyle: { color: "#78350f" }, descStyle: { color: "#92400e" },
      title: "Awaiting admin approval",
      desc: "Your email is verified. An admin will review and activate your account shortly.",
    });
  }

  if (role === "alumni" && !isProfileComplete && accountStatus !== "rejected" && accountStatus !== "suspended") {
    banners.push({
      id: "profile", icon: AlertCircle,
      wrapStyle: { background: RED_LIGHT, border: `1px solid ${RED_BORDER}` },
      iconStyle: { color: RED }, titleStyle: { color: RED_DARK }, descStyle: { color: RED },
      title: "Complete your profile",
      desc: "Add your experience, skills, and a photo so others can connect with you.",
      action: { label: "Complete Profile →", href: "/complete-profile" },
    });
  }

  if (banners.length === 0) return null;

  return (
    <div className="space-y-3">
      {banners.map(({ id, icon: Icon, wrapStyle, iconStyle, titleStyle, descStyle, title, desc, action }) => (
        <div key={id} className="flex items-start gap-4 px-5 py-4 rounded-2xl" style={wrapStyle}>
          <Icon size={18} className="mt-0.5 flex-shrink-0" style={iconStyle} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={titleStyle}>{title}</p>
            <p className="text-xs mt-0.5 leading-relaxed" style={descStyle}>{desc}</p>
          </div>
          {action && (
            <a
              href={action.href}
              className="flex-shrink-0 self-center px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors whitespace-nowrap"
              style={{ background: RED }}
              onMouseEnter={e => (e.currentTarget.style.background = RED_DARK)}
              onMouseLeave={e => (e.currentTarget.style.background = RED)}
            >
              {action.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN CONTENT SECTION
══════════════════════════════════════════ */

const TAB_CFG = {
  blogs:  { label: "Blogs",  Icon: BookOpen,     accent: RED,      light: RED_LIGHT, border: RED_BORDER },
  events: { label: "Events", Icon: CalendarDays, accent: "#0369a1", light: "#e0f2fe", border: "#7dd3fc" },
  news:   { label: "News",   Icon: Newspaper,    accent: "#b45309", light: "#fef3c7", border: "#fcd34d" },
};

const CONTENT_STATUS_CFG = {
  draft:     { label: "Draft",     bg: "#f1f5f9", border: "#cbd5e1", color: "#475569" },
  published: { label: "Published", bg: "#dcfce7", border: "#86efac", color: "#15803d" },
  archived:  { label: "Archived",  bg: "#f3f4f6", border: "#d1d5db", color: "#6b7280" },
  upcoming:  { label: "Upcoming",  bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" },
  ongoing:   { label: "Ongoing",   bg: "#dcfce7", border: "#86efac", color: "#15803d" },
  completed: { label: "Completed", bg: "#f1f5f9", border: "#cbd5e1", color: "#475569" },
  cancelled: { label: "Cancelled", bg: RED_LIGHT, border: RED_BORDER, color: RED_DARK },
};

const STATUS_OPTS = {
  blogs:  ["", "draft", "published", "archived"],
  events: ["", "upcoming", "ongoing", "completed", "cancelled"],
  news:   ["", "draft", "published", "archived"],
};

function ContentStatusPill({ status }) {
  const s = CONTENT_STATUS_CFG[status] ?? { label: status, bg: "#f1f5f9", border: "#cbd5e1", color: "#64748b" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function ContentDeleteModal({ item, tab, onConfirm, onCancel, loading }) {
  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: RED_LIGHT }}>
            <AlertTriangle size={20} style={{ color: RED }} />
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
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            style={{ background: RED }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = RED_DARK; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = RED; }}
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Trash2 size={14} />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminContentSection({ adminId }) {
  const [tab, setTab]               = useState("blogs");
  const [page, setPage]             = useState(1);
  const [status, setStatus]         = useState("");
  const [counts, setCounts]         = useState({});
  const [items, setItems]           = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]           = useState(null);

  const fetchContent = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ tab, page, limit: 8, ...(status && { status }) });
      const res  = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content?${params}`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load");
      setCounts(json.counts);
      setItems(json.items);
      setPagination(json.pagination);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [tab, page, status]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleTabChange = (t) => { setTab(t); setPage(1); setStatus(""); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/${tab}/${deleteTarget._id}`,
        { method: "DELETE", credentials: "include" }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDeleteTarget(null);
      showToast("Deleted successfully", "success");
      fetchContent();
    } catch (e) { showToast(e.message, "error"); }
    finally { setDeleteLoading(false); }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cfg = TAB_CFG[tab];

  return (
    <>
      <div className="space-y-5">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">Content Manager</h2>
          <button
            onClick={fetchContent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(TAB_CFG).map(([id, { label, Icon, accent, light, border }]) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className="bg-white border rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md text-left"
              style={{ borderColor: tab === id ? border : "#e2e8f0" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: tab === id ? accent : "#f1f5f9" }}
              >
                <Icon size={16} style={{ color: tab === id ? "white" : "#94a3b8" }} />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 tabular-nums">{counts[id] ?? "—"}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Tabs + status filter */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(TAB_CFG).map(([id, { label, Icon, accent, light, border }]) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all border"
              style={tab === id
                ? { background: light, border: `1.5px solid ${border}`, color: accent }
                : { background: "white", border: "1.5px solid #e2e8f0", color: "#64748b" }}
            >
              <Icon size={13} /> {label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                style={tab === id
                  ? { background: accent, color: "white" }
                  : { background: "#e2e8f0", color: "#64748b" }}
              >
                {counts[id] ?? 0}
              </span>
            </button>
          ))}
          <div className="flex gap-1.5 ml-auto flex-wrap">
            {STATUS_OPTS[tab].map((s) => (
              <button
                key={s || "all"}
                onClick={() => { setStatus(s); setPage(1); }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border"
                style={status === s
                  ? { background: cfg.accent, color: "white", borderColor: cfg.accent }
                  : { background: "white", color: "#64748b", borderColor: "#e2e8f0" }}
              >
                {s ? (CONTENT_STATUS_CFG[s]?.label ?? s) : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <cfg.Icon size={12} style={{ color: cfg.accent }} /> {cfg.label}
              {pagination.total != null && (
                <span className="text-slate-400 font-semibold">({pagination.total})</span>
              )}
            </span>
            {pagination.totalPages > 1 && (
              <span className="text-xs text-slate-400 font-semibold">
                Page {pagination.page} / {pagination.totalPages}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div
                className="w-6 h-6 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: RED_LIGHT, borderTopColor: cfg.accent }}
              />
              <p className="text-slate-500 text-sm font-semibold">Loading…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <AlertTriangle size={24} style={{ color: RED }} />
              <p className="text-slate-600 text-sm font-bold">{error}</p>
              <button
                onClick={fetchContent}
                className="text-xs font-bold hover:underline"
                style={{ color: RED }}
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <cfg.Icon size={24} className="text-slate-300" />
              <p className="text-slate-400 text-sm">No {cfg.label.toLowerCase()} found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const href = `/${tab}/${item._id}`;
                const isOwner = String(item.createdBy) === String(adminId);
                return (
                  <div key={item._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group">
                    <a href={href} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                        {item.image?.url
                          ? <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <cfg.Icon size={14} className="text-slate-300" />
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p
                            className="text-sm font-bold text-slate-900 truncate transition-colors"
                            style={{ "--hover-color": RED }}
                          >
                            {item.title}
                          </p>
                          <ContentStatusPill status={item.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-400">
                          <span>By <span className="font-semibold text-slate-600">{item.createdByName}</span></span>
                          <span>{fmt(item.createdAt)}</span>
                          {item.category && <span className="text-slate-500 font-semibold">{item.category}</span>}
                          {item.startDate && <span>{fmt(item.startDate)}</span>}
                          {item.location && <span>{item.location}</span>}
                        </div>
                      </div>
                    </a>
                    {isOwner && (
                      <button
                        onClick={(e) => { e.preventDefault(); setDeleteTarget(item); }}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center opacity-0 group-hover:opacity-100 flex-shrink-0 transition-all"
                        style={{ background: RED_LIGHT, borderColor: RED_BORDER, color: RED }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = RED;
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = RED;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = RED_LIGHT;
                          e.currentTarget.style.color = RED;
                          e.currentTarget.style.borderColor = RED_BORDER;
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-7 h-7 rounded-lg text-xs font-bold transition-all border"
                      style={p === page
                        ? { background: RED, color: "white", borderColor: RED }
                        : { background: "white", color: "#64748b", borderColor: "#e2e8f0" }}
                    >
                      {p}
                    </button>
                  ))}
              </div>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      <ContentDeleteModal
        item={deleteTarget}
        tab={tab}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold"
          style={toast.type === "success"
            ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d" }
            : { background: RED_LIGHT, border: `1px solid ${RED_BORDER}`, color: RED_DARK }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════ */
function AdminDashboard({ data }) {
  const { admin, stats } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
        <h1 className="text-4xl font-black text-slate-900">{admin.name}</h1>
        <p className="text-slate-600 text-sm mt-1">{admin.email}</p>
      </div>

      <div className="max-w-xs">
        <StatCard icon={Users} label="Total Admins Registered" value={stats.totalAdmins} />
      </div>

      <AdminContentSection adminId={admin._id} />
    </div>
  );
}

/* ══════════════════════════════════════════
   STUDENT DASHBOARD
══════════════════════════════════════════ */
function StudentDashboard({ data }) {
  const { user, stats } = data;

  return (
    <div className="space-y-6">
      <StatusBanners user={user} />

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`, boxShadow: `0 8px 24px ${RED}33` }}
          >
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <Pill pillStyle={{ background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569" }}>Student</Pill>
            </div>
            <ContactInfo
              email={user.email}
              phone={user.phone}
              city={user.profile?.location?.city}
              country={user.profile?.location?.country}
            />
            <VerificationBadges verification={user.verification} accountStatus={user.accountStatus} />
          </div>
          <div className="flex gap-8 text-center sm:flex-shrink-0">
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.connectionsCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Connections</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.connectionRequestsCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <GraduationCap size={13} style={{ color: RED }} /> Academic Info
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoTile label="Roll Number"  value={user.academic?.rollNumber} />
          <InfoTile label="Course"       value={user.academic?.course} />
          <InfoTile label="Branch"       value={user.academic?.branch} />
          <InfoTile label="Passing Year" value={user.academic?.passingYear} />
          <InfoTile label="Gender"       value={user.profile?.gender} />
          <InfoTile label="Blood Group"  value={user.profile?.bloodGroup} />
          {user.academic?.hostel && <InfoTile label="Hostel" value={user.academic.hostel} />}
          <InfoTile label="Joined" value={fmt(user.createdAt)} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ALUMNI DASHBOARD
══════════════════════════════════════════ */
function AlumniDashboard({ data }) {
  const { user, stats } = data;
  const experiences = user.professional?.experiences ?? [];
  const skills      = user.professional?.skills ?? [];
  const social      = user.profile?.socialLinks ?? {};

  const SOCIAL_LINKS = [
    { key: "linkedin",  Icon: Linkedin, label: "LinkedIn"  },
    { key: "github",    Icon: Github,   label: "GitHub"    },
    { key: "twitter",   Icon: Twitter,  label: "Twitter"   },
    { key: "portfolio", Icon: Globe,    label: "Portfolio" },
  ];

  const currentJob = experiences.find((e) => e.isCurrent);

  return (
    <div className="space-y-6">
      <StatusBanners user={user} />

      {/* Profile hero */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {user.profile?.profilePicUrl ? (
            <img
              src={user.profile.profilePicUrl}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
              style={{ boxShadow: `0 0 0 3px ${RED_BORDER}` }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`, boxShadow: `0 8px 24px ${RED}33` }}
            >
              {initials(user.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <Pill pillStyle={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}`, color: RED_DARK }}>Alumni</Pill>
            </div>
            {currentJob && (
              <p className="text-slate-600 text-sm font-semibold mb-2">
                {currentJob.designation} · {currentJob.company}
              </p>
            )}
            <ContactInfo
              email={user.email}
              phone={user.phone}
              city={user.profile?.location?.city}
              country={user.profile?.location?.country}
            />
            {user.profile?.bio && (
              <p className="text-slate-600 text-sm leading-relaxed mb-3 max-w-2xl">{user.profile.bio}</p>
            )}
            <VerificationBadges verification={user.verification} accountStatus={user.accountStatus} />
            {SOCIAL_LINKS.some((s) => social[s.key]) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {SOCIAL_LINKS.filter((s) => social[s.key]).map(({ key, Icon, label }) => (
                  <a
                    key={key}
                    href={social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
                    style={{ background: "#f8fafc", borderColor: "#e2e8f0", color: "#475569" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = RED_LIGHT;
                      e.currentTarget.style.borderColor = RED_BORDER;
                      e.currentTarget.style.color = RED;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#475569";
                    }}
                  >
                    <Icon size={12} /> {label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-8 text-center sm:flex-shrink-0">
            <div>
              <p className="text-2xl font-black" style={{ color: RED }}>{stats.connectionsCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Connections</p>
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color: RED }}>{stats.connectionRequestsCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Experience */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200" style={{ borderLeft: `3px solid ${RED}` }}>
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={13} style={{ color: RED }} /> Experience
            </h2>
          </div>
          {experiences.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No experience added yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {experiences.map((exp, i) => (
                <div key={i} className="px-6 py-5 flex gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}
                  >
                    <Building2 size={15} style={{ color: RED }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900">{exp.designation}</p>
                      {exp.isCurrent && <Pill pillStyle={PILL_S.green}>Current</Pill>}
                    </div>
                    <p className="text-sm text-slate-700 font-semibold">{exp.company}</p>
                    {exp.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {exp.location}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {fmt(exp.startDate)} — {exp.isCurrent ? "Present" : fmt(exp.endDate)}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills + Academic */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star size={13} style={{ color: RED }} /> Skills
            </h2>
            {skills.length === 0 ? (
              <p className="text-slate-400 text-sm">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                    style={{ background: RED }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <GraduationCap size={13} style={{ color: RED }} /> Academic
            </h2>
            <div className="space-y-2">
              <InfoTile label="Roll Number"  value={user.academic?.rollNumber} />
              <InfoTile label="Course"       value={user.academic?.course} />
              <InfoTile label="Branch"       value={user.academic?.branch} />
              <InfoTile label="Passing Year" value={user.academic?.passingYear} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE ROOT
══════════════════════════════════════════ */
export default function DashboardPage() {
  const [state, setState] = useState({ loading: true, error: null, role: null, data: null });

  useEffect(() => {
    (async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard`;
        const res  = await fetch(url, { credentials: "include" });
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          console.error("Non-JSON response:", text.slice(0, 300));
          throw new Error(
            res.status === 401 ? "Not logged in. Please sign in again."
            : res.status === 404 ? "Dashboard API route not found. Check NEXT_PUBLIC_BACKEND_URL."
            : `Server returned ${res.status}. Is the backend running at ${process.env.NEXT_PUBLIC_BACKEND_URL}?`
          );
        }
        if (!json.success) throw new Error(json.message || "Failed to load");
        setState({ loading: false, error: null, role: json.role, data: json.data });
      } catch (err) {
        setState({ loading: false, error: err.message, role: null, data: null });
      }
    })();
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: RED_LIGHT, borderTopColor: RED }}
          />
          <p className="text-slate-600 font-semibold text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle size={36} className="mx-auto mb-3" style={{ color: RED }} />
          <p className="text-slate-900 font-bold text-lg mb-1">Something went wrong</p>
          <p className="text-slate-600 text-sm">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {state.role === "admin"   && <AdminDashboard   data={state.data} />}
        {state.role === "student" && <StudentDashboard data={state.data} />}
        {state.role === "alumni"  && <AlumniDashboard  data={state.data} />}
      </div>
    </div>
  );
}