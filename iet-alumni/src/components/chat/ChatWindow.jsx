"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Hash } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { getMessages } from "@/lib/chatApi";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { motion } from "framer-motion";

function getInitials(name) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function TypingIndicator({ names }) {
  if (!names.length) return null;
  const label = names.length === 1 ? `${names[0]} is typing` : `${names.slice(0, 2).join(", ")} are typing`;
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <span className="text-xs text-slate-400 font-medium italic">{label}...</span>
    </div>
  );
}

export default function ChatWindow({ currentUserId, onBack }) {
  const { activeRoom, messages, setMessages, typingUsers, onlineUsers } = useChat();
  const [loading, setLoading] = useState(false);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  const roomId    = activeRoom?._id;
  const roomMsgs  = messages[roomId] || [];
  const typingMap = typingUsers[roomId] || {};
  const typingNames = Object.values(typingMap).map((u) => u.userName);

  const otherUser = activeRoom?.otherUser;
  const isOnline  = otherUser && onlineUsers.has(otherUser._id?.toString());
  const isGroup   = activeRoom?.type === "community";

  const loadHistory = useCallback(async (pageNum = 1, append = false) => {
    if (!roomId) return;
    setLoading(true);
    try {
      const data = await getMessages(roomId, pageNum, 30);
      setMessages((prev) => ({
        ...prev,
        [roomId]: append ? [...data.messages, ...(prev[roomId] || [])] : data.messages,
      }));
      setHasMore(data.pagination?.hasMore || false);
      setPage(pageNum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [roomId, setMessages]);

  useEffect(() => {
    if (!roomId) return;
    loadHistory(1, false);
  }, [roomId, loadHistory]);

  useEffect(() => {
    if (page === 1) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMsgs.length, page]);

  const handleScroll = () => {
    if (scrollRef.current?.scrollTop === 0 && hasMore && !loading) loadHistory(page + 1, true);
  };

  if (!activeRoom) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-white flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0">
          <ArrowLeft size={18} />
        </button>

        <div className="relative flex-shrink-0">
          {isGroup ? (
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
              <Hash size={16} className="text-white" />
            </div>
          ) : otherUser?.profile?.profilePicUrl ? (
            <img src={otherUser.profile.profilePicUrl} alt={otherUser.name} className="w-10 h-10 rounded-2xl object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#951114] to-red-900 flex items-center justify-center text-white text-sm font-black">
              {getInitials(otherUser?.name || activeRoom.name)}
            </div>
          )}
          {!isGroup && isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 truncate">{isGroup ? activeRoom.name : otherUser?.name}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isGroup
              ? `${activeRoom.members?.length || ""} members`
              : isOnline
              ? <span className="text-green-500">Online</span>
              : otherUser?.role}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ overscrollBehavior: "contain" }}>
        {hasMore && (
          <div className="text-center">
            <button onClick={() => loadHistory(page + 1, true)} disabled={loading}
              className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#951114] transition-colors px-4 py-2 rounded-full border border-slate-200 hover:border-[#951114]/20">
              {loading ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {loading && roomMsgs.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-[#951114] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400">Loading messages...</p>
          </div>
        )}

        {!loading && roomMsgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-slate-900 font-black text-sm">Start the conversation</p>
            <p className="text-slate-400 text-xs font-medium mt-1">Say hello to {isGroup ? activeRoom.name : otherUser?.name}</p>
          </div>
        )}

        {roomMsgs.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.sender?._id?.toString() === currentUserId || msg.sender?.toString() === currentUserId}
            roomId={roomId}
            currentUserId={currentUserId}
          />
        ))}

        <TypingIndicator names={typingNames} />
        <div ref={bottomRef} />
      </div>

      <MessageInput roomId={roomId} currentUserId={currentUserId} />
    </motion.div>
  );
}
