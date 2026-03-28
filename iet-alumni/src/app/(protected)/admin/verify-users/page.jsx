// 📁 src/app/(protected)/admin/verify-users/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, ShieldCheck, Search, RefreshCw, Users, GraduationCap, UserCheck } from "lucide-react";

const STATUS_STYLES = {
  pending:   "bg-amber-50 text-amber-700 border border-amber-200",
  active:    "bg-green-50 text-green-700 border border-green-200",
  rejected:  "bg-red-50 text-red-700 border border-red-200",
  suspended: "bg-slate-100 text-slate-600 border border-slate-200",
};

const STATUS_ICONS = {
  pending:   <Clock size={12} />,
  active:    <CheckCircle size={12} />,
  rejected:  <XCircle size={12} />,
  suspended: <ShieldCheck size={12} />,
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

export default function AdminVerifyUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null); // which user is in-flight
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("pending");
  const [roleFilter, setRole]     = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (roleFilter)   params.set("role",   roleFilter);
      if (search)       params.set("search", search);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users?${params}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error("fetchUsers error:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleAction = async (userId, action) => {
    setActionId(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/${userId}/${action}`,
        { method: "PATCH", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? data.data : u))
        );
      }
    } catch (err) {
      console.error("action error:", err);
    } finally {
      setActionId(null);
    }
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const counts = {
    total:    users.length,
    pending:  users.filter((u) => u.accountStatus === "pending").length,
    active:   users.filter((u) => u.accountStatus === "active").length,
    rejected: users.filter((u) => u.accountStatus === "rejected").length,
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans antialiased text-slate-900">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#800000] flex items-center justify-center shadow-lg">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">User Verification</h1>
          </div>
          <p className="text-slate-500 text-lg font-medium ml-16">
            Review and approve newly registered students and alumni.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users size={20} className="text-slate-600" />}      label="Total Loaded" value={counts.total}    color="bg-slate-100" />
          <StatCard icon={<Clock size={20} className="text-amber-600" />}      label="Pending"      value={counts.pending}  color="bg-amber-50"  />
          <StatCard icon={<UserCheck size={20} className="text-green-600" />}  label="Verified"     value={counts.active}   color="bg-green-50"  />
          <StatCard icon={<XCircle size={20} className="text-red-600" />}      label="Rejected"     value={counts.rejected} color="bg-red-50"    />
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-[#800000] outline-none text-slate-900 font-medium placeholder:text-slate-400 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="w-full md:w-40 p-3 rounded-2xl border border-slate-300 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#800000]"
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            className="w-full md:w-36 p-3 rounded-2xl border border-slate-300 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#800000]"
            value={roleFilter}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>

          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-300 text-sm font-black text-slate-600 hover:border-[#800000] hover:text-[#800000] transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── User List ── */}
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-900 font-black">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-900 text-2xl font-black">No users found.</p>
            <p className="text-slate-500 font-medium">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {users.map((user) => {
              const isLoading = actionId === user._id;
              const isPending  = user.accountStatus === "pending";
              const isActive   = user.accountStatus === "active";
              const isRejected = user.accountStatus === "rejected";

              return (
                <div
                  key={user._id}
                  className="flex flex-col md:flex-row gap-8 p-8 rounded-[2rem] border border-slate-200 hover:border-[#800000]/30 hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 bg-white group"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 flex items-start mx-auto md:mx-0">
                    {user.profile?.profilePicUrl ? (
                      <img
                        src={user.profile.profilePicUrl}
                        className="w-24 h-24 rounded-[1.5rem] object-cover ring-4 ring-slate-100 border border-slate-200"
                        alt={user.name}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-[#800000] to-red-900 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">

                      {/* Left: Name + status */}
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-2xl font-black text-slate-900 group-hover:text-[#800000] transition-colors">
                            {user.name}
                          </h2>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${STATUS_STYLES[user.accountStatus]}`}>
                            {STATUS_ICONS[user.accountStatus]}
                            {user.accountStatus}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-slate-900 text-white">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm mt-1">{user.email}</p>
                      </div>

                      {/* Right: Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Verify */}
                        {!isActive && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleAction(user._id, "verify")}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 text-white text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            <CheckCircle size={14} />
                            {isLoading ? "..." : "Verify"}
                          </button>
                        )}
                        {/* Reject */}
                        {!isRejected && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleAction(user._id, "reject")}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-200 text-red-600 bg-white text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={14} />
                            {isLoading ? "..." : "Reject"}
                          </button>
                        )}
                        {/* Suspend (only for active users) */}
                        {isActive && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleAction(user._id, "suspend")}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-500 bg-white text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck size={14} />
                            {isLoading ? "..." : "Suspend"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Roll No",      value: user.academic?.rollNumber   },
                        { label: "Course",        value: user.academic?.course       },
                        { label: "Branch",        value: user.academic?.branch       },
                        { label: "Passing Year",  value: user.academic?.passingYear  },
                        { label: "Phone",         value: user.phone                  },
                        { label: "City",          value: user.profile?.location?.city },
                        { label: "Gender",        value: user.profile?.gender        },
                        { label: "Joined",        value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                          <p className="text-sm font-bold text-slate-700 truncate">{value || "—"}</p>
                        </div>
                      ))}
                    </div>

                    {/* Verification flags */}
                    <div className="flex gap-3 mt-4 flex-wrap">
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${user.verification?.isEmailVerified ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-400"}`}>
                        ✉ Email {user.verification?.isEmailVerified ? "Verified" : "Unverified"}
                      </span>
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${user.verification?.isVerifiedByAdmin ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                        🛡 Admin {user.verification?.isVerifiedByAdmin ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}