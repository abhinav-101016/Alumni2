// 📁 src/app/(protected)/connections/page.jsx
"use client";

import { useEffect, useState } from "react";
import { getMyConnections, removeConnection } from "@/lib/connectionApi";
import Link from "next/link";

export default function MyConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMyConnections()
      .then((res) => setConnections(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (userId, connectionId) => {
    setBusyId(connectionId);
    await removeConnection(userId);
    setConnections((prev) => prev.filter((c) => c.connectionId !== connectionId));
    setBusyId(null);
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const filtered = connections.filter((c) =>
    c.user.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-white font-sans antialiased text-slate-900">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">My Network</h1>
              <p className="text-slate-600 text-lg font-medium">
                {connections.length} connection{connections.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/connections/requests" className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#800000] text-white text-xs font-black uppercase tracking-widest hover:bg-[#6a0000] transition-all">
                View Requests
              </Link>
              <Link href="/alumni" className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-[#800000] hover:text-[#800000] transition-all">
                Browse Directory
              </Link>
            </div>
          </div>
          <div className="mt-8">
            <input
              type="text"
              placeholder="Search your connections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-[#800000] outline-none text-slate-900 font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-900 font-black">Loading Network...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-900 text-2xl font-black mb-2">
              {search ? "No results found" : "No connections yet"}
            </p>
            {!search && (
              <Link href="/alumni" className="mt-4 inline-block px-6 py-3 rounded-full bg-[#800000] text-white text-xs font-black uppercase tracking-widest hover:bg-[#6a0000] transition-all">
                Browse Alumni Directory →
              </Link>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6">
            {filtered.map((conn) => {
              const { user, connectionId, connectedAt } = conn;
              const currentExp = user?.professional?.experiences?.find((e) => e.isCurrent);
              return (
                <li key={connectionId} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 rounded-[2rem] border border-slate-200 hover:border-[#800000]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 bg-white group">
                  <div className="flex-shrink-0">
                    {user.profile?.profilePicUrl ? (
                      <img src={user.profile.profilePicUrl} alt={user.name} className="w-20 h-20 rounded-[1.25rem] object-cover ring-4 ring-slate-50 border border-slate-200" />
                    ) : (
                      <div className="w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-[#800000] to-red-900 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#800000] transition-colors">{user.name}</h3>
                    <p className="text-[#800000] font-bold text-sm uppercase tracking-wide mt-0.5">
                      {currentExp ? `${currentExp.designation} · ${currentExp.company}` : `${user.academic?.branch || ""} · Class of ${user.academic?.passingYear || ""}`}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                        Connected {new Date(connectedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                      {user.profile?.location?.city && (
                        <span className="text-slate-400 text-xs font-medium">📍 {user.profile.location.city}</span>
                      )}
                    </div>
                    {user.professional?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {user.professional.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-wide">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(user._id, connectionId)}
                    disabled={busyId === connectionId}
                    className="flex-shrink-0 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50 self-center"
                  >
                    {busyId === connectionId ? "..." : "Remove"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
