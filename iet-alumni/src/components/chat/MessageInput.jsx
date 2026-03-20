"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Smile, X } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useChat } from "@/context/ChatContext";
import { useTyping } from "@/hooks/useTyping";

const EMOJI_GROUPS = {
  "Faces":   ["😀","😂","😍","🥰","😎","😭","😤","🤔","😴","🤩","😅","🫡","😮","😢","😡","🤣"],
  "Hands":   ["👍","👎","👏","🙏","💪","🤝","✌️","🫶","🤞","👌"],
  "Objects": ["🔥","🎉","✅","⚡","💯","💡","🎯","🏆","❤️","💔"],
};

export default function MessageInput({ roomId, currentUserId }) {
  const [text,        setText]       = useState("");
  const [showEmoji,   setShowEmoji]  = useState(false);
  const [emojiGroup,  setEmojiGroup] = useState("Faces");
  const inputRef = useRef(null);
  const { addOptimisticMessage, replaceOptimisticMessage, markOptimisticFailed } = useChat();
  const { onType, onBlur } = useTyping(roomId);

  const sendMessage = useCallback((content, type = "text") => {
    if (!content.trim() || !roomId) return;
    const socket = getSocket();
    if (!socket) return;

    const tempId = `temp_${Date.now()}`;
    addOptimisticMessage(roomId, {
      _id: tempId, roomId, content: content.trim(), type,
      sender: { _id: currentUserId },
      readBy: [], createdAt: new Date().toISOString(), status: "sending",
    });

    socket.emit("message:send", { roomId, content: content.trim(), type, tempId }, (ack) => {
      if (ack?.success) {
        replaceOptimisticMessage(roomId, tempId, {
          _id: ack.messageId, roomId, content: content.trim(), type,
          sender: { _id: currentUserId },
          readBy: [], createdAt: new Date().toISOString(),
        });
      } else {
        markOptimisticFailed(roomId, tempId);
      }
    });
  }, [roomId, currentUserId, addOptimisticMessage, replaceOptimisticMessage, markOptimisticFailed]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex-shrink-0 border-t border-slate-100 bg-white">

      {/* Emoji picker */}
      {showEmoji && (
        <div className="border-b border-slate-100 px-3 pt-3 pb-2">
          {/* Group tabs */}
          <div className="flex gap-1 mb-2">
            {Object.keys(EMOJI_GROUPS).map((group) => (
              <button
                key={group}
                onClick={() => setEmojiGroup(group)}
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all ${
                  emojiGroup === group
                    ? "bg-[#951114] text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {group}
              </button>
            ))}
            <button
              onClick={() => setShowEmoji(false)}
              className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={13} />
            </button>
          </div>
          {/* Emojis */}
          <div className="flex flex-wrap gap-1">
            {EMOJI_GROUPS[emojiGroup].map((e) => (
              <button
                key={e}
                onClick={() => { sendMessage(e, "emoji"); setShowEmoji(false); }}
                className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-slate-50 leading-none"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-3">
        {/* Emoji toggle */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
            showEmoji
              ? "bg-[#951114]/10 border-[#951114]/20 text-[#951114]"
              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-[#951114] hover:border-[#951114]/20"
          }`}
        >
          <Smile size={17} />
        </button>

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => { setText(e.target.value); onType(); }}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            placeholder="Write a message..."
            rows={1}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#951114]/15 focus:border-[#951114]/30 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none bg-slate-50 focus:bg-white transition-all"
            style={{ maxHeight: "100px", overflowY: "auto" }}
          />
        </div>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-[#951114] text-white flex-shrink-0 hover:bg-[#7a0d0f] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
