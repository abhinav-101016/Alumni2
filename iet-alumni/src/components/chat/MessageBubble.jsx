"use client";

import { useState } from "react";
import { Trash2, SmilePlus, Check, CheckCheck, RotateCcw } from "lucide-react";
import { getSocket } from "@/lib/socket";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅"];

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

  const isDeleted    = message.isDeleted;
  const isFailed     = message.status === "failed";
  const isSending    = message.status === "sending";
  const isEmoji      = message.type === "emoji";
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
      className={`flex items-end gap-2 py-0.5 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojis(false); }}
    >
      {/* Avatar — others only */}
      {!isOwn && (
        <div className="flex-shrink-0 mb-1">
          {message.sender?.profile?.profilePicUrl ? (
            <img
              src={message.sender.profile.profilePicUrl}
              alt={message.sender.name}
              className="w-7 h-7 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#951114] to-red-800 flex items-center justify-center text-white text-[10px] font-black">
              {getInitials(message.sender?.name)}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[68%] ${isOwn ? "items-end" : "items-start"}`}>

        {/* Sender name for group chats */}
        {!isOwn && message.sender?.name && (
          <span className="text-[10px] font-black uppercase tracking-widest text-[#951114]/70 mb-1 ml-1">
            {message.sender.name}
          </span>
        )}

        <div className={`flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>

          {/* Bubble */}
          <div className={`
            relative px-3.5 py-2.5 text-sm font-medium leading-relaxed
            ${isEmoji ? "bg-transparent px-0 py-0" : ""}
            ${isDeleted
              ? "bg-slate-100 text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-2xl"
              : isEmoji
              ? ""
              : isOwn
              ? "bg-[#951114] text-white rounded-2xl rounded-br-md shadow-sm"
              : "bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl rounded-bl-md"
            }
            ${isFailed ? "opacity-50" : ""}
            ${isSending ? "opacity-70" : ""}
          `}>
            {isDeleted ? (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Trash2 size={11} /> Deleted
              </span>
            ) : isEmoji ? (
              <span className="text-4xl leading-none select-none">{message.content}</span>
            ) : (
              <span style={{ wordBreak: "break-word" }}>{message.content}</span>
            )}
          </div>

          {/* Action buttons — on hover */}
          {!isDeleted && showActions && (
            <div className={`flex items-center gap-0.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
              <div className="relative">
                <button
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-[#951114] hover:border-[#951114]/20 transition-all"
                >
                  <SmilePlus size={13} />
                </button>
                {showEmojis && (
                  <div className={`absolute bottom-9 ${isOwn ? "right-0" : "left-0"} bg-white border border-slate-200 rounded-2xl shadow-xl p-2 flex gap-0.5 z-20 whitespace-nowrap`}>
                    {QUICK_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => handleReact(e)}
                        className="text-base hover:scale-125 transition-transform p-1 rounded-lg hover:bg-slate-50"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              )}
              {isFailed && (
                <button
                  onClick={() => {/* retry logic */}}
                  className="p-1.5 rounded-lg bg-white border border-red-200 shadow-sm text-red-400 hover:text-red-600 transition-all"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-full px-2 py-0.5 text-xs shadow-sm hover:border-[#951114]/20 hover:bg-[#951114]/5 transition-all"
              >
                <span className="text-sm">{emoji}</span>
                <span className="text-[10px] text-slate-500 font-black ml-0.5">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time + status */}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-slate-400">{formatTime(message.createdAt)}</span>
          {isOwn && !isDeleted && (
            <>
              {isFailed   && <span className="text-[10px] text-red-400 font-black">Failed</span>}
              {isSending  && <span className="text-[10px] text-slate-300">•••</span>}
              {!isFailed && !isSending && (
                readByOthers
                  ? <CheckCheck size={11} className="text-blue-400" />
                  : <Check size={11} className="text-slate-400" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
