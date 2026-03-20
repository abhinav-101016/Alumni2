"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/context/ChatContext";
import RoomList from "./RoomList";
import ChatWindow from "./ChatWindow";

export default function ChatSidebar({ currentUserId }) {
  const { sidebarOpen, closeSidebar, activeRoom, closeRoom } = useChat();

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") closeSidebar(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeSidebar]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
          />

          {/* ── DESKTOP: Centered floating panel ─────────────── */}
          <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center pointer-events-none">
            <motion.div
              key="desktop-panel"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="pointer-events-auto flex bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
              style={{
                width: activeRoom ? "min(860px, 90vw)" : "min(420px, 90vw)",
                height: "min(680px, 88vh)",
                transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              {/* Room list */}
              <div
                className={`flex-shrink-0 border-r border-slate-100 flex flex-col overflow-hidden
                  ${activeRoom ? "w-[300px]" : "w-full"}`}
              >
                <RoomListHeader onClose={closeSidebar} />
                <div className="flex-1 overflow-hidden">
                  <RoomList />
                </div>
              </div>

              {/* Chat window */}
              {activeRoom && (
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                  <ChatWindow currentUserId={currentUserId} onBack={closeRoom} />
                </div>
              )}
            </motion.div>
          </div>

          {/* ── MOBILE: Slide in from right, full screen ──────── */}
          <motion.div
            key="mobile-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col overflow-hidden"
          >
            {/* Mobile: room list or chat window */}
            {!activeRoom ? (
              <>
                <RoomListHeader onClose={closeSidebar} />
                <div className="flex-1 overflow-hidden">
                  <RoomList />
                </div>
              </>
            ) : (
              <ChatWindow currentUserId={currentUserId} onBack={closeRoom} />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Shared header for room list
function RoomListHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#951114]" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">IET Alumni Chat</span>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#951114] transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
