// 📁 src/app/(protected)/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Users, Clock, CheckCircle, XCircle, ShieldCheck, Mail, Phone,
  MapPin, GraduationCap, Briefcase, Star, Github, Linkedin,
  Twitter, Globe, UserCheck, UserPlus, AlertCircle, CalendarDays,
  BookOpen, Building2, ChevronRight, Hash
} from "lucide-react";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const initials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

const PILL_S = {
  green:  { background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46" },
  amber:  { background: "#fef3c7", border: "1px solid #fcd34d", color: "#78350f" },
  red:    { background: "#fee2e2", border: "1px solid #fca5a5", color: "#7f1d1d" },
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
function StatCard({ icon: Icon, label, value, accentClass }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accentClass}`}>
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
      wrapStyle: { background: "#fff1f2", border: "1px solid #fecdd3" },
      iconStyle: { color: "#dc2626" }, titleStyle: { color: "#991b1b" }, descStyle: { color: "#b91c1c" },
      title: "Email not verified",
      desc: "Please check your inbox and verify your email to activate your account.",
    });
  }

  if (accountStatus === "rejected") {
    banners.push({
      id: "rejected", icon: XCircle,
      wrapStyle: { background: "#fff1f2", border: "1px solid #fecdd3" },
      iconStyle: { color: "#dc2626" }, titleStyle: { color: "#991b1b" }, descStyle: { color: "#b91c1c" },
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
      wrapStyle: { background: "#f0f9ff", border: "1px solid #bae6fd" },
      iconStyle: { color: "#0284c7" }, titleStyle: { color: "#0c4a6e" }, descStyle: { color: "#0369a1" },
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
            <a href={action.href}
              className="flex-shrink-0 self-center px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors whitespace-nowrap"
              style={{ background: "#0284c7" }}>
              {action.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════ */
function AdminDashboard({ data }) {
  const { admin, stats, recentUsers } = data;

  const cards = [
    { icon: Users,       label: "Total Users",      value: stats.totalUsers,           accentClass: "bg-violet-600" },
    { icon: UserPlus,    label: "New This Week",     value: stats.newRegistrations,     accentClass: "bg-sky-600"    },
    { icon: Clock,       label: "Pending Approval",  value: stats.pendingVerifications, accentClass: "bg-amber-600"  },
    { icon: UserCheck,   label: "Active Users",      value: stats.activeUsers,          accentClass: "bg-emerald-600"},
    { icon: AlertCircle, label: "Suspended",         value: stats.suspendedUsers,       accentClass: "bg-rose-700"   },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
        <h1 className="text-4xl font-black text-slate-900">{admin.name}</h1>
        <p className="text-slate-600 text-sm mt-1">{admin.email}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Recent registrations */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">Recent Registrations</h2>
          <a href="/admin/verify-users"
            className="text-xs font-bold text-[#c0392b] flex items-center gap-1 hover:text-red-500 transition-colors">
            View all <ChevronRight size={12} />
          </a>
        </div>
        <div className="divide-y divide-slate-100">
          {recentUsers.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-10">No users yet.</p>
          )}
          {recentUsers.map((u) => {
            const st = STATUS_CFG[u.accountStatus] ?? STATUS_CFG.pending;
            const SIcon = st.icon;
            return (
              <div key={u._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#800000] to-red-900 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                  {initials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase hidden md:block">{u.role}</span>
                <Pill pillStyle={st.pillStyle} className="hidden sm:inline-flex">
                  <SIcon size={10} /> {st.label}
                </Pill>
                <p className="text-xs text-slate-400 hidden lg:block whitespace-nowrap">{fmt(u.createdAt)}</p>
              </div>
            );
          })}
        </div>
      </div>
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

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#800000] to-red-900 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg shadow-red-900/20">
            {initials(user.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <Pill pillStyle={{ background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569" }}>Student</Pill>
            </div>

            {/* ── Fixed contact info spacing ── */}
            <ContactInfo
              email={user.email}
              phone={user.phone}
              city={user.profile?.location?.city}
              country={user.profile?.location?.country}
            />

            <VerificationBadges verification={user.verification} accountStatus={user.accountStatus} />
          </div>

          {/* Connection counts */}
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

      {/* Academic info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <GraduationCap size={13} /> Academic Info
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
  const skills = user.professional?.skills ?? [];
  const social = user.profile?.socialLinks ?? {};

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
          {/* Avatar / pic */}
          {user.profile?.profilePicUrl ? (
            <img src={user.profile.profilePicUrl} alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-200 flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#800000] to-red-900 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg shadow-red-900/20">
              {initials(user.name)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <Pill pillStyle={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239" }}>Alumni</Pill>
            </div>

            {currentJob && (
              <p className="text-slate-600 text-sm font-semibold mb-2">
                {currentJob.designation} · {currentJob.company}
              </p>
            )}

            {/* ── Fixed contact info spacing ── */}
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

            {/* Social links */}
            {SOCIAL_LINKS.some((s) => social[s.key]) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {SOCIAL_LINKS.filter((s) => social[s.key]).map(({ key, Icon, label }) => (
                  <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all text-xs font-semibold">
                    <Icon size={12} /> {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Experience */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={13} /> Experience
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
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 size={15} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900">{exp.designation}</p>
                      {exp.isCurrent && (
                        <Pill pillStyle={PILL_S.green}>Current</Pill>
                      )}
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
              <Star size={13} /> Skills
            </h2>
            {skills.length === 0 ? (
              <p className="text-slate-400 text-sm">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((sk, i) => (
                 <span key={i}
  className="px-3 py-1.5 rounded-xl bg-[#951114] text-white text-xs font-bold">
  {sk}
</span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <GraduationCap size={13} /> Academic
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
        const res = await fetch(url, { credentials: "include" });
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
          <div className="w-10 h-10 rounded-full border-4 border-[#800000] border-t-transparent animate-spin" />
          <p className="text-slate-600 font-semibold text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
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