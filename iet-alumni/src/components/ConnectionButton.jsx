"use client";

import { useState, useEffect } from "react";
import {
  sendRequest,
  cancelRequest,
  removeConnection,
  acceptRequest,
  rejectRequest,
  getConnectionStatus,
} from "@/lib/connectionApi";

export default function ConnectionButton({ targetUserId, currentUserId }) {
  const [status, setStatus] = useState("loading");
  const [connectionId, setConnectionId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isSelf =
    currentUserId &&
    targetUserId &&
    currentUserId.toString() === targetUserId.toString();

  useEffect(() => {
    if (isSelf || !targetUserId || !currentUserId) return;
    getConnectionStatus(targetUserId)
      .then((res) => { setStatus(res.status); setConnectionId(res.connectionId); })
      .catch(() => setStatus("none"));
  }, [targetUserId, currentUserId]);

  const handle = async (action) => {
    setBusy(true);
    setError("");
    try {
      switch (action) {
        case "send":    await sendRequest(targetUserId); setStatus("pending_sent"); break;
        case "cancel":  await cancelRequest(targetUserId); setStatus("none"); setConnectionId(null); break;
        case "accept":  await acceptRequest(connectionId); setStatus("accepted"); break;
        case "reject":  await rejectRequest(connectionId); setStatus("none"); setConnectionId(null); break;
        case "remove":  await removeConnection(targetUserId); setStatus("none"); setConnectionId(null); break;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isSelf) return null;

  const base = "mt-2 px-5 py-2 text-xs font-black uppercase tracking-widest rounded-full border transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  if (status === "loading") {
    return <button disabled className={`${base} border-slate-200 text-slate-400`}><Spinner /> Loading</button>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {status === "none" && (
        <button onClick={() => handle("send")} disabled={busy} className={`${base} border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white`}>
          {busy ? <Spinner /> : <IconPlus />} Connect
        </button>
      )}
      {status === "pending_sent" && (
        <button onClick={() => handle("cancel")} disabled={busy} className={`${base} border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100`}>
          {busy ? <Spinner /> : <IconClock />} Pending · Cancel
        </button>
      )}
      {status === "pending_received" && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => handle("accept")} disabled={busy} className={`${base} border-green-600 text-green-700 bg-green-50 hover:bg-green-600 hover:text-white`}>
            {busy ? <Spinner /> : <IconCheck />} Accept
          </button>
          <button onClick={() => handle("reject")} disabled={busy} className={`${base} border-slate-300 text-slate-500 hover:bg-slate-100`}>
            Reject
          </button>
        </div>
      )}
      {status === "accepted" && (
        <button onClick={() => handle("remove")} disabled={busy} title="Click to remove" className={`${base} group border-green-500 text-green-700 bg-green-50 hover:bg-red-50 hover:border-red-400 hover:text-red-600`}>
          {busy ? <Spinner /> : <><IconConnected className="group-hover:hidden" /><IconMinus className="hidden group-hover:block" /></>}
          <span className="group-hover:hidden">Connected</span>
          <span className="hidden group-hover:block">Remove</span>
        </button>
      )}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const Spinner = () => (
  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);
const IconPlus = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IconClock = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 7v5l3 2" />
  </svg>
);
const IconCheck = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconConnected = ({ className = "" }) => (
  <svg className={`h-3 w-3 ${className}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);
const IconMinus = ({ className = "" }) => (
  <svg className={`h-3 w-3 ${className}`} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);
