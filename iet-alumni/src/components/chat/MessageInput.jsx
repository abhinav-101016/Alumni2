"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Smile } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useChat } from "@/context/ChatContext";
import { useTyping } from "@/hooks/useTyping";

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😎","😭","😤","🤔","😴","🤩",
  "👍","👎","❤️","🔥","🎉","✅","⚡","💯","🙏","🤝",
  "😮","😢","😡","🤣","😅","🫡","💪","👏","🎯","💡",
];

export default function MessageInput({ roomId, currentUserId }) {
  const [text,      setText]      = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
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
    <div className="border-t border-slate-100 bg-white px-4 py-3">
      {showEmoji && (
        <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex flex-wrap gap-2">
            {EMOJI_LIST.map((e) => (
              <button key={e} onClick={() => { sendMessage(e, "emoji"); setShowEmoji(false); }}
                className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={`p-2.5 rounded-2xl border transition-all flex-shrink-0 ${
            showEmoji
              ? "bg-[#951114]/10 border-[#951114]/20 text-[#951114]"
              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-[#951114] hover:border-[#951114]/20"
          }`}
        >
          <Smile size={18} />
        </button>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => { setText(e.target.value); onType(); }}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          placeholder="Write a message..."
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#951114]/20 focus:border-[#951114]/40 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none bg-slate-50 focus:bg-white transition-all"
          style={{ maxHeight: "120px", overflowY: "auto" }}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-2.5 rounded-2xl bg-[#951114] text-white flex-shrink-0 hover:bg-[#6a0000] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
