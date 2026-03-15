"use client";

import { useState } from "react";
import { Trash2, SmilePlus, Check, CheckCheck } from "lucide-react";
import { getSocket } from "@/lib/socket";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function getInitials(name) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, isOwn, roomId, currentUserId }) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojis,  setShowEmojis]  = useState(false);

  const isDeleted  = message.isDeleted;
  const isFailed   = message.status === "failed";
  const isSending  = message.status === "sending";
  const readByOthers = message.readBy?.some(
    (r) => (r.user?._id || r.user) !== currentUserId
  );

  const handleDelete = () => {
    getSocket()?.emit("message:delete", { messageId: message._id, roomId });
    setShowActions(false);
  };

  const handleReact = (emoji) => {
    getSocket()?.emit("message:react", { messageId: message._id, roomId, emoji });
    setShowEmojis(false);
    setShowActions(false);
  };

  const reactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={`flex items-end gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojis(false); }}
    >
      {!isOwn && (
        <div className="flex-shrink-0 mb-1">
          {message.sender?.profile?.profilePicUrl ? (
            <img src={message.sender.profile.profilePicUrl} alt={message.sender.name} className="w-8 h-8 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#951114] to-red-900 flex items-center justify-center text-white text-xs font-black">
              {getInitials(message.sender?.name)}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
            {message.sender?.name}
          </span>
        )}

        <div className={`flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`relative px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed transition-all duration-200 ${
            isDeleted
              ? "bg-slate-100 text-slate-400 italic border border-dashed border-slate-200"
              : isOwn
              ? "bg-[#951114] text-white rounded-br-sm"
              : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm"
          } ${isFailed ? "opacity-60 border border-red-300" : ""}`}>
            {isDeleted ? (
              <span className="flex items-center gap-1.5"><Trash2 size={12} /> This message was deleted</span>
            ) : message.type === "emoji" ? (
              <span className="text-3xl leading-none">{message.content}</span>
            ) : (
              message.content
            )}
          </div>

          {!isDeleted && showActions && (
            <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
              <div className="relative">
                <button onClick={() => setShowEmojis(!showEmojis)} className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-[#951114] transition-colors">
                  <SmilePlus size={14} />
                </button>
                {showEmojis && (
                  <div className={`absolute bottom-8 ${isOwn ? "right-0" : "left-0"} bg-white border border-slate-200 rounded-2xl shadow-xl p-2 flex gap-1 z-10`}>
                    {QUICK_EMOJIS.map((e) => (
                      <button key={e} onClick={() => handleReact(e)} className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
                    ))}
                  </div>
                )}
              </div>
              {isOwn && (
                <button onClick={handleDelete} className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {Object.keys(reactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactions).map(([emoji, count]) => (
              <button key={emoji} onClick={() => handleReact(emoji)} className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-full px-2 py-0.5 text-xs font-black shadow-sm hover:border-[#951114]/30 transition-colors">
                {emoji} <span className="text-slate-500 ml-0.5">{count}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-slate-400 font-medium">{formatTime(message.createdAt)}</span>
          {isOwn && !isDeleted && (
            <span className="text-[10px]">
              {isFailed   ? <span className="text-red-400 font-black">Failed</span>
               : isSending ? <span className="text-slate-300">•</span>
               : readByOthers
                 ? <CheckCheck size={12} className="text-blue-400" />
                 : <Check size={12} className="text-slate-400" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
