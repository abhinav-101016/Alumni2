"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Hash, MoreVertical } from "lucide-react";
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
  const label = names.length === 1
    ? `${names[0]} is typing`
    : `${names.slice(0, 2).join(" & ")} are typing`;
  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
        <span className="text-[11px] text-slate-500 font-medium ml-1 italic">{label}</span>
      </div>
    </div>
  );
}

// Date divider between messages
function DateDivider({ date }) {
  const label = (() => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  })();
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
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

  const roomId      = activeRoom?._id;
  const roomMsgs    = messages[roomId] || [];
  const typingMap   = typingUsers[roomId] || {};
  const typingNames = Object.values(typingMap).map((u) => u.userName);
  const otherUser   = activeRoom?.otherUser;
  const isOnline    = otherUser && onlineUsers.has(otherUser._id?.toString());
  const isGroup     = activeRoom?.type === "community";

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

  // Group messages by date for date dividers
  const groupedMsgs = roomMsgs.reduce((acc, msg, idx) => {
    const date = new Date(msg.createdAt).toDateString();
    const prevDate = idx > 0 ? new Date(roomMsgs[idx - 1].createdAt).toDateString() : null;
    if (date !== prevDate) acc.push({ type: "divider", date: msg.createdAt, key: `d-${idx}` });
    acc.push({ type: "message", msg, key: msg._id });
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Chat header ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-[#951114] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={17} />
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {isGroup ? (
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Hash size={15} className="text-white" />
            </div>
          ) : otherUser?.profile?.profilePicUrl ? (
            <img src={otherUser.profile.profilePicUrl} alt={otherUser.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#951114] to-red-800 flex items-center justify-center text-white text-xs font-black">
              {getInitials(otherUser?.name || activeRoom.name)}
            </div>
          )}
          {!isGroup && isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 truncate leading-tight">
            {isGroup ? activeRoom.name : otherUser?.name}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-widest leading-tight mt-0.5">
            {isGroup ? (
              <span className="text-slate-400">{activeRoom.members?.length || 0} members</span>
            ) : isOnline ? (
              <span className="text-green-500 font-black">● Online</span>
            ) : (
              <span className="text-slate-400">{otherUser?.role}</span>
            )}
          </p>
        </div>

        {/* Red accent line */}
        <div className="w-px h-8 bg-[#951114]/20 flex-shrink-0" />
        <div className="text-[10px] font-black uppercase tracking-widest text-[#951114]/60 flex-shrink-0">
          {isGroup ? "Community" : "Direct"}
        </div>
      </div>

      {/* ── Messages area ───────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2"
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Load older */}
        {hasMore && (
          <div className="text-center py-3">
            <button
              onClick={() => loadHistory(page + 1, true)}
              disabled={loading}
              className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#951114] transition-colors px-4 py-1.5 rounded-full border border-slate-200 hover:border-[#951114]/20"
            >
              {loading ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {loading && roomMsgs.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-7 h-7 border-[3px] border-[#951114] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Loading</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && roomMsgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-slate-900 font-black text-sm mb-1">Say hello!</p>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              This is the beginning of your conversation with{" "}
              <span className="text-[#951114] font-black">
                {isGroup ? activeRoom.name : otherUser?.name}
              </span>
            </p>
          </div>
        )}

        {/* Messages with date dividers */}
        <div className="space-y-1">
          {groupedMsgs.map((item) =>
            item.type === "divider" ? (
              <DateDivider key={item.key} date={item.date} />
            ) : (
              <div key={item.key} className="px-4">
                <MessageBubble
                  message={item.msg}
                  isOwn={
                    item.msg.sender?._id?.toString() === currentUserId ||
                    item.msg.sender?.toString() === currentUserId
                  }
                  roomId={roomId}
                  currentUserId={currentUserId}
                />
              </div>
            )
          )}
        </div>

        <TypingIndicator names={typingNames} />
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* ── Input ───────────────────────────────────────────── */}
      <MessageInput roomId={roomId} currentUserId={currentUserId} />
    </div>
  );
}
