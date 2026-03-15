// 📁 src/app/(protected)/alumni/page.jsx
"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import { MessageCircle } from "lucide-react";
import ConnectionButton from "@/components/ConnectionButton";
import { ChatContext } from "@/context/ChatContext";
import { getOrCreateDmRoom } from "@/lib/chatApi";

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const BRANCHES     = ["Computer Science","Information Technology","Electronics","Mechanical","Civil","Electrical","Chemical"];

// ── Message button ────────────────────────────────────────────────
function MessageButton({ targetUserId }) {
  const ctx = useContext(ChatContext);
  console.log("ChatContext:", ctx);
  console.log("targetUserId:", targetUserId);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!ctx) return;
    setLoading(true);
    try {
      const data = await getOrCreateDmRoom(targetUserId);
      ctx.openRoom(data.room);
    } catch (e) {
      console.error("Failed to open DM:", e.message);
      alert(e.message || "Could not open chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || !ctx}
      title="Send Message"
      className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#800000]/30 text-[#800000] bg-white text-xs font-black uppercase tracking-widest hover:bg-[#800000] hover:text-white hover:border-[#800000] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <MessageCircle size={14} />
      {loading ? "Opening..." : "Message"}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function AlumniDirectory() {
  const [alumni,       setAlumni]       = useState([]);
  const [myId,         setMyId]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    search: "", bloodGroup: "", passingYear: "", company: "",
    position: "", city: "", country: "", branch: "",
  });

  // Fetch alumni list
  const fetchAlumni = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alumni/directory?${queryParams}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch alumni");
      const result = await res.json();
      setAlumni(result.data);
      setMyId(result.currentUserId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ── Fetch accepted connections ────────────────────────────────
  // Your API: GET /api/connections
  // Returns:  { success, count, data: [ { connectionId, connectedAt, user: { _id, ... } } ] }
  // We just need the Set of user._id strings to know who we can message
  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connections`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();

      // data.data is the array — each item has a `user` object with `_id`
      const ids = new Set(
        (data.data || []).map((item) => item.user?._id?.toString())
        .filter(Boolean)
      );
      setConnectedIds(ids);
    } catch (e) {
      console.error("fetchConnections error:", e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchAlumni(), 300);
    return () => clearTimeout(timer);
  }, [fetchAlumni]);

  // Fetch connections once on mount (no dependency on myId needed
  // since the API uses the cookie for auth)
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="w-full min-h-screen bg-white font-sans antialiased text-slate-900">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Alumni Directory</h1>
          <p className="text-slate-600 text-lg font-medium">Browse and connect with verified members of our community.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Filters */}
        <div className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap gap-3 bg-slate-50 p-4 md:p-6 rounded-[2rem] border border-slate-200 mb-12 shadow-sm">
          <div className="col-span-2 md:flex-1">
            <input
              type="text"
              placeholder="Search by name, skills, company..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-[#800000] outline-none text-slate-900 font-medium placeholder:text-slate-400"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select
            className="w-full md:w-36 p-3 rounded-2xl border border-slate-300 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#800000]"
            value={filters.bloodGroup}
            onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}
          >
            <option value="">Blood Group</option>
            {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
          </select>
          <input
            type="number"
            placeholder="Year"
            className="w-full md:w-28 p-3 rounded-2xl border border-slate-300 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#800000]"
            value={filters.passingYear}
            onChange={(e) => setFilters((f) => ({ ...f, passingYear: e.target.value }))}
          />
          <select
            className="w-full md:w-44 p-3 rounded-2xl border border-slate-300 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#800000]"
            value={filters.branch}
            onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
          >
            <option value="">Branch</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {[
            { id: "company",  placeholder: "Company"  },
            { id: "position", placeholder: "Position" },
            { id: "city",     placeholder: "City"     },
            { id: "country",  placeholder: "Country"  },
          ].map((field) => (
            <input
              key={field.id}
              type="text"
              placeholder={field.placeholder}
              className="w-full md:w-36 p-3 rounded-2xl border border-slate-300 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#800000]"
              value={filters[field.id]}
              onChange={(e) => setFilters((f) => ({ ...f, [field.id]: e.target.value }))}
            />
          ))}
          <button
            onClick={() => setFilters({ search:"", bloodGroup:"", passingYear:"", company:"", position:"", city:"", country:"", branch:"" })}
            className="col-span-2 md:w-auto px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#800000] transition-colors"
          >
            Reset All
          </button>
        </div>

        {/* Alumni cards */}
        <div className="grid grid-cols-1 gap-8">
          {loading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-900 font-black">Syncing Network...</p>
            </div>
          ) : alumni.length > 0 ? (
            alumni.map((person) => {
              const isMe        = person._id === myId;
              const isConnected = connectedIds.has(person._id?.toString());
              const currentJob  = person.professional?.experiences?.find((e) => e.isCurrent)
                               || person.professional?.experiences?.[0];

              return (
                <div
                  key={person._id}
                  className="flex flex-col md:flex-row gap-10 p-10 rounded-[2.5rem] border border-slate-200 hover:border-[#800000]/30 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 bg-white group overflow-hidden"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mx-auto md:mx-0">
                    {person.profile?.profilePicUrl ? (
                      <img
                        src={person.profile.profilePicUrl}
                        className="w-40 h-40 rounded-[2.5rem] object-cover ring-8 ring-slate-50 border border-slate-200"
                        alt={person.name}
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-[#800000] to-red-900 flex items-center justify-center text-white text-6xl font-black shadow-xl">
                        {getInitials(person.name)}
                      </div>
                    )}
                    {isMe && (
                      <span className="absolute -top-3 -right-3 bg-green-600 text-white text-[12px] font-black px-4 py-1.5 rounded-2xl border-4 border-white shadow-lg animate-bounce">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                      <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-[#800000] transition-colors">
                          {person.name}
                        </h2>
                        <p className="text-[#800000] font-black text-lg mt-1 uppercase tracking-wider">
                          {currentJob?.designation || "Professional"}
                          <span className="text-slate-300 mx-3 font-light">/</span>
                          {currentJob?.company || "Open to Network"}
                        </p>
                        <p className="text-slate-500 font-medium text-sm mt-1">
                          {person.academic?.course} - {person.academic?.branch}
                        </p>
                        <p className="text-slate-500 font-medium text-sm mt-1">
                          {person.profile?.location?.city && `${person.profile.location.city},`}{" "}
                          {person.profile?.location?.country || ""}
                        </p>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className="bg-slate-900 text-white text-xs font-black px-5 py-2 rounded-full tracking-widest">
                          CLASS OF {person.academic?.passingYear}
                        </span>
                        {person.profile?.bloodGroup && (
                          <span className="text-red-600 font-black text-sm border-b-2 border-red-100">
                            🩸 {person.profile.bloodGroup}
                          </span>
                        )}

                        {!isMe && (
                          <div className="flex items-center gap-2 flex-wrap justify-end mt-1">
                            {/* Message button — only for accepted connections */}
                            {isConnected && <MessageButton targetUserId={person._id} />}
                            <ConnectionButton targetUserId={person._id} currentUserId={myId} />
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-700 text-lg font-medium italic leading-relaxed mb-6 border-l-4 border-slate-100 pl-4">
                      "{person.profile?.bio || "An IET Lucknow Alumnus making an impact in the professional world."}"
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {person.professional?.skills?.map((skill, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-black rounded-xl border border-slate-200 uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
              <p className="text-slate-900 text-2xl font-black">No batchmates found.</p>
              <p className="text-slate-500 font-medium">Try clearing your filters to see the full list.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
