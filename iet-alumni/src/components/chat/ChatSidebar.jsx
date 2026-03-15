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

  // Lock body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 flex shadow-2xl bg-white border-l border-slate-200 overflow-hidden"
            style={{
              width: "100%",
            }}
          >
            {/* ── Inner wrapper — controls actual width ───────── */}
            <div
              className="flex h-full ml-auto"
              style={{
                width: activeRoom
                  ? "min(780px, 100vw)"
                  : "min(420px, 100vw)",
                transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}
            >

              {/* Room list column — always visible on desktop, hidden on mobile when room open */}
              <div
                className={`
                  flex-shrink-0 border-r border-slate-100 flex flex-col overflow-hidden
                  ${activeRoom ? "hidden lg:flex" : "flex w-full"}
                  lg:w-[320px]
                `}
              >
                {/* Close button */}
                <div className="flex items-center justify-end px-4 pt-3 pb-0">
                  <button
                    onClick={closeSidebar}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#951114] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <RoomList />
                </div>
              </div>

              {/* Chat window — right column (desktop) or full screen (mobile) */}
              {activeRoom && (
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                  {/* Mobile close */}
                  <div className="lg:hidden absolute top-3 right-3 z-10">
                    <button onClick={closeSidebar} className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-500">
                      <X size={16} />
                    </button>
                  </div>

                  <ChatWindow
                    currentUserId={currentUserId}
                    onBack={closeRoom}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
