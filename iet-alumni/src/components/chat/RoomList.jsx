"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Hash, Search, Wifi, WifiOff, Users } from "lucide-react";
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

      {/* Search + connection status */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#951114]/15 focus:border-[#951114]/30 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {connected
              ? <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
            }
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-2.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "dms",       label: "Direct",    icon: MessageCircle, count: dmRooms.length },
            { id: "community", label: "Community", icon: Hash,          count: myCommRooms.length },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                tab === id
                  ? "bg-[#951114] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={11} />
              {label}
              {count > 0 && (
                <span className={`text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 ${
                  tab === id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── DMs ── */}
          {tab === "dms" && (
            <motion.div key="dms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              {filteredDms.length === 0 ? (
                <EmptyState
                  icon={<MessageCircle size={28} className="text-slate-300" />}
                  title="No conversations yet"
                  subtitle="Message a connected alumni to start"
                />
              ) : (
                <ul>
                  {filteredDms.map((room) => {
                    const other    = room.otherUser;
                    const isOnline = other && onlineUsers.has(other._id?.toString());
                    const isActive = activeRoom?._id === room._id;
                    const preview  = room.lastMessage?.content || "No messages yet";
                    const isEmoji  = room.lastMessage?.type === "emoji";

                    return (
                      <li key={room._id}>
                        <button
                          onClick={() => openRoom(room)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                            isActive
                              ? "bg-[#951114]/8 border-r-[3px] border-[#951114]"
                              : "hover:bg-slate-50 border-r-[3px] border-transparent"
                          }`}
                        >
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            {other?.profile?.profilePicUrl ? (
                              <img src={other.profile.profilePicUrl} alt={other.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#951114] to-red-800 flex items-center justify-center text-white text-xs font-black">
                                {getInitials(other?.name)}
                              </div>
                            )}
                            {isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-sm font-black truncate ${isActive ? "text-[#951114]" : "text-slate-900"}`}>
                                {other?.name}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                                {timeAgo(room.lastMessage?.sentAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {isEmoji ? preview : preview}
                            </p>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#951114]/70">
                              {other?.role}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          )}

          {/* ── Community ── */}
          {tab === "community" && (
            <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              {loadingComm ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-7 h-7 border-[3px] border-[#951114] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading</p>
                </div>
              ) : communityRooms.length === 0 ? (
                <EmptyState
                  icon={<Hash size={28} className="text-slate-300" />}
                  title="No community rooms"
                  subtitle="Rooms will appear here"
                />
              ) : (
                <ul>
                  {communityRooms.map((room) => {
                    const joined   = myCommRooms.some((r) => r._id === room._id);
                    const isActive = activeRoom?._id === room._id;
                    return (
                      <li key={room._id}>
                        <button
                          onClick={() => joined ? openRoom(room) : handleJoinCommunity(room)}
                          disabled={joiningId === room._id}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                            isActive
                              ? "bg-[#951114]/8 border-r-[3px] border-[#951114]"
                              : "hover:bg-slate-50 border-r-[3px] border-transparent"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                            <Hash size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-sm font-black truncate ${isActive ? "text-[#951114]" : "text-slate-900"}`}>
                                {room.name}
                              </span>
                              {!joined && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#951114] bg-[#951114]/10 px-2 py-0.5 rounded-full ml-1 flex-shrink-0">
                                  {joiningId === room._id ? "..." : "Join"}
                                </span>
                              )}
                              {joined && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1 flex-shrink-0">
                                  Joined
                                </span>
                              )}
                            </div>
                            {room.description && (
                              <p className="text-[11px] text-slate-400 truncate">{room.description}</p>
                            )}
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

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-slate-900 font-black text-sm">{title}</p>
      <p className="text-slate-400 text-xs font-medium mt-1">{subtitle}</p>
    </div>
  );
}
