"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Hash, Search, Wifi, WifiOff } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { getCommunityRooms, joinCommunityRoom } from "@/lib/chatApi";
import { motion, AnimatePresence } from "framer-motion";

function getInitials(name) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function RoomList() {
  const { rooms, openRoom, activeRoom, onlineUsers, connected, loadRooms } = useChat();
  const [tab,            setTab]           = useState("dms");
  const [communityRooms, setCommunityRooms] = useState([]);
  const [search,         setSearch]        = useState("");
  const [joiningId,      setJoiningId]     = useState(null);
  const [loadingComm,    setLoadingComm]   = useState(false);

  useEffect(() => {
    if (tab === "community") {
      setLoadingComm(true);
      getCommunityRooms()
        .then((d) => setCommunityRooms(d.rooms || []))
        .finally(() => setLoadingComm(false));
    }
  }, [tab]);

  const dmRooms     = rooms.filter((r) => r.type === "dm");
  const myCommRooms = rooms.filter((r) => r.type === "community");

  const filteredDms = dmRooms.filter((r) =>
    r.otherUser?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoinCommunity = async (room) => {
    setJoiningId(room._id);
    try {
      await joinCommunityRoom(room._id);
      await loadRooms();
      openRoom({ ...room, type: "community" });
    } catch (e) {
      console.error(e);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Messages</h2>
          {connected
            ? <Wifi size={14} className="text-green-500" />
            : <WifiOff size={14} className="text-slate-300 animate-pulse" />
          }
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#951114]/20 focus:border-[#951114]/40 transition-all"
          />
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
          {[
            { id: "dms",       label: "Direct",    icon: MessageCircle },
            { id: "community", label: "Community", icon: Hash },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                tab === id ? "bg-[#951114] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {tab === "dms" && (
            <motion.div key="dms" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}>
              {filteredDms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                    <MessageCircle size={22} className="text-slate-300" />
                  </div>
                  <p className="text-slate-900 font-black text-sm">No conversations yet</p>
                  <p className="text-slate-400 text-xs font-medium mt-1">Visit Alumni Directory to start a DM</p>
                </div>
              ) : (
                <ul className="py-2">
                  {filteredDms.map((room) => {
                    const other    = room.otherUser;
                    const isOnline = other && onlineUsers.has(other._id?.toString());
                    const isActive = activeRoom?._id === room._id;
                    return (
                      <li key={room._id}>
                        <button
                          onClick={() => openRoom(room)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 ${
                            isActive ? "bg-[#951114]/5 border-r-2 border-[#951114]" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            {other?.profile?.profilePicUrl ? (
                              <img src={other.profile.profilePicUrl} alt={other.name} className="w-11 h-11 rounded-2xl object-cover border border-slate-200" />
                            ) : (
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#951114] to-red-900 flex items-center justify-center text-white text-sm font-black">
                                {getInitials(other?.name)}
                              </div>
                            )}
                            {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm font-black text-slate-900 truncate">{other?.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium ml-2 flex-shrink-0">{timeAgo(room.lastMessage?.sentAt)}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium truncate">{room.lastMessage?.content || "No messages yet"}</p>
                            {other?.role && <span className="text-[9px] font-black uppercase tracking-widest text-[#951114]">{other.role}</span>}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          )}

          {tab === "community" && (
            <motion.div key="community" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
              {loadingComm ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <div className="w-8 h-8 border-4 border-[#951114] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-slate-400">Loading rooms...</p>
                </div>
              ) : communityRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                    <Hash size={22} className="text-slate-300" />
                  </div>
                  <p className="text-slate-900 font-black text-sm">No community rooms yet</p>
                </div>
              ) : (
                <ul className="py-2">
                  {communityRooms.map((room) => {
                    const joined   = myCommRooms.some((r) => r._id === room._id);
                    const isActive = activeRoom?._id === room._id;
                    return (
                      <li key={room._id}>
                        <button
                          onClick={() => joined ? openRoom(room) : handleJoinCommunity(room)}
                          disabled={joiningId === room._id}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 ${
                            isActive ? "bg-[#951114]/5 border-r-2 border-[#951114]" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                            <Hash size={18} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm font-black text-slate-900 truncate">{room.name}</span>
                              {!joined && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#951114] bg-[#951114]/10 px-2 py-0.5 rounded-full ml-1 flex-shrink-0">
                                  {joiningId === room._id ? "..." : "Join"}
                                </span>
                              )}
                            </div>
                            {room.description && <p className="text-xs text-slate-400 font-medium truncate">{room.description}</p>}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
