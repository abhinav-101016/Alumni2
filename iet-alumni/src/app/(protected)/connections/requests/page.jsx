// 📁 src/app/(protected)/connections/requests/page.jsx
"use client";

import { useEffect, useState } from "react";
import { getReceivedRequests, getSentRequests, acceptRequest, rejectRequest, cancelRequest } from "@/lib/connectionApi";
import Link from "next/link";

export default function ConnectionRequestsPage() {
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    Promise.all([getReceivedRequests(), getSentRequests()])
      .then(([r, s]) => { setReceived(r.data); setSent(s.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (connectionId) => {
    setBusyId(connectionId);
    await acceptRequest(connectionId);
    setReceived((prev) => prev.filter((r) => r._id !== connectionId));
    setBusyId(null);
  };

  const handleReject = async (connectionId) => {
    setBusyId(connectionId);
    await rejectRequest(connectionId);
    setReceived((prev) => prev.filter((r) => r._id !== connectionId));
    setBusyId(null);
  };

  const handleCancel = async (conn) => {
    setBusyId(conn._id);
    await cancelRequest(conn.receiver._id);
    setSent((prev) => prev.filter((r) => r._id !== conn._id));
    setBusyId(null);
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const list = tab === "received" ? received : sent;

  return (
    <div className="w-full min-h-screen bg-white font-sans antialiased text-slate-900">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Connection Requests</h1>
              <p className="text-slate-600 text-lg font-medium">Manage your incoming and outgoing requests.</p>
            </div>
            <Link href="/connections" className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-[#800000] hover:text-[#800000] transition-all">
              ← My Network
            </Link>
          </div>
          <div className="flex gap-1 mt-8 bg-slate-100 p-1 rounded-2xl w-fit">
            {["received", "sent"].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${tab === t ? "bg-[#800000] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t === "received" ? "Received" : "Sent"}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${tab === t ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {t === "received" ? received.length : sent.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-900 font-black">Loading Requests...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-900 text-2xl font-black mb-2">No {tab} requests</p>
            <p className="text-slate-500 font-medium">
              {tab === "received" ? "When someone connects with you, they'll appear here." : "Requests you've sent will appear here."}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6">
            {list.map((req) => {
              const person = tab === "received" ? req.sender : req.receiver;
              const currentExp = person?.professional?.experiences?.find((e) => e.isCurrent);
              return (
                <li key={req._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 rounded-[2rem] border border-slate-200 hover:border-[#800000]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 bg-white group">
                  <div className="flex-shrink-0">
                    {person.profile?.profilePicUrl ? (
                      <img src={person.profile.profilePicUrl} alt={person.name} className="w-20 h-20 rounded-[1.25rem] object-cover ring-4 ring-slate-50 border border-slate-200" />
                    ) : (
                      <div className="w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-[#800000] to-red-900 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                        {getInitials(person.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#800000] transition-colors">{person.name}</h3>
                    <p className="text-[#800000] font-bold text-sm uppercase tracking-wide mt-0.5">
                      {currentExp ? `${currentExp.designation} · ${currentExp.company}` : `${person.academic?.branch || ""} · Class of ${person.academic?.passingYear || ""}`}
                    </p>
                    {req.message && (
                      <p className="text-slate-500 italic text-sm mt-2 border-l-2 border-slate-200 pl-3">"{req.message}"</p>
                    )}
                    <p className="text-slate-400 text-xs font-medium mt-2 uppercase tracking-widest">
                      {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0 self-center">
                    {tab === "received" ? (
                      <>
                        <button onClick={() => handleAccept(req._id)} disabled={busyId === req._id} className="px-5 py-2.5 rounded-full bg-[#800000] text-white text-xs font-black uppercase tracking-widest hover:bg-[#6a0000] transition-all disabled:opacity-50">
                          {busyId === req._id ? "..." : "Accept"}
                        </button>
                        <button onClick={() => handleReject(req._id)} disabled={busyId === req._id} className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50">
                          Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleCancel(req)} disabled={busyId === req._id} className="px-5 py-2.5 rounded-full border border-amber-300 text-amber-700 bg-amber-50 text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all disabled:opacity-50">
                        {busyId === req._id ? "..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
