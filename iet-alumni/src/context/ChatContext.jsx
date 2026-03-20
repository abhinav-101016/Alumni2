"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { getMyRooms, getUnreadCount, markRoomAsRead } from "@/lib/chatApi";

export const ChatContext = createContext(null);

export function ChatProvider({ children, isLoggedIn }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoom,  setActiveRoom]  = useState(null);
  const [rooms,       setRooms]       = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messages,    setMessages]    = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [connected,   setConnected]   = useState(false);

  const activeRoomRef = useRef(activeRoom);
  activeRoomRef.current = activeRoom;

  const loadRooms = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await getMyRooms();
      setRooms(data.rooms || []);
    } catch (_) {}
  }, [isLoggedIn]);

  const loadUnread = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await getUnreadCount();
      setUnreadTotal(data.unreadCount || 0);
    } catch (_) {}
  }, [isLoggedIn]);

  // ── Listen for openChatSidebar event fired by Header ─────────────
  // Header is outside ChatProvider so it can't call openSidebar directly.
  // Instead it fires a custom window event which we catch here.
  useEffect(() => {
    const handler = () => setSidebarOpen(true);
    window.addEventListener("openChatSidebar", handler);
    return () => window.removeEventListener("openChatSidebar", handler);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadRooms();
    loadUnread();

    const socket = connectSocket();

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // REPLACE with this:
socket.on("message:new", (msg) => {
  const roomId = msg.roomId?.toString() || msg.roomId;
  setMessages((prev) => {
    const existing = prev[roomId] || [];

    // Skip if this exact message already exists (real ID match)
    const alreadyExists = existing.some((m) => m._id === msg._id);
    if (alreadyExists) return prev;

    // Replace optimistic temp message if tempId matches
    const hasTempVersion = msg.tempId && existing.some((m) => m._id === msg.tempId);
    if (hasTempVersion) {
      return {
        ...prev,
        [roomId]: existing.map((m) =>
          m._id === msg.tempId ? { ...msg, status: "sent" } : m
        ),
      };
    }

    // New message from someone else — just append
    return {
      ...prev,
      [roomId]: [...existing, msg],
    };
  });
      setRooms((prev) =>
        prev.map((r) =>
          r._id === roomId
            ? { ...r, lastMessage: { content: msg.content, sender: msg.sender, type: msg.type, sentAt: msg.createdAt } }
            : r
        )
      );
      if (activeRoomRef.current?._id !== roomId) {
        setUnreadTotal((n) => n + 1);
      } else {
        markRoomAsRead(roomId).catch(() => {});
        socket.emit("message:read", { roomId });
      }
    });

    socket.on("typing:start", ({ roomId, userId, userName, avatarUrl }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [roomId]: { ...(prev[roomId] || {}), [userId]: { userName, avatarUrl } },
      }));
    });

    socket.on("typing:stop", ({ roomId, userId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (next[roomId]) {
          delete next[roomId][userId];
          if (Object.keys(next[roomId]).length === 0) delete next[roomId];
        }
        return next;
      });
    });

    socket.on("message:read", ({ roomId, readBy }) => {
      setMessages((prev) => {
        if (!prev[roomId]) return prev;
        return {
          ...prev,
          [roomId]: prev[roomId].map((m) => {
            const alreadyRead = m.readBy?.some((r) => r.user === readBy || r.user?._id === readBy);
            if (alreadyRead) return m;
            return { ...m, readBy: [...(m.readBy || []), { user: readBy, readAt: new Date().toISOString() }] };
          }),
        };
      });
    });

    socket.on("message:deleted", ({ messageId, roomId }) => {
      setMessages((prev) => {
        if (!prev[roomId]) return prev;
        return {
          ...prev,
          [roomId]: prev[roomId].map((m) =>
            m._id === messageId ? { ...m, isDeleted: true, content: "This message was deleted" } : m
          ),
        };
      });
    });

    socket.on("message:react", ({ messageId, roomId, emoji, userId, userName }) => {
      setMessages((prev) => {
        if (!prev[roomId]) return prev;
        return {
          ...prev,
          [roomId]: prev[roomId].map((m) =>
            m._id === messageId
              ? { ...m, reactions: [...(m.reactions || []), { emoji, userId, userName }] }
              : m
          ),
        };
      });
    });

    socket.on("user:online",  ({ userId }) => setOnlineUsers((s) => new Set([...s, userId])));
    socket.on("user:offline", ({ userId }) => setOnlineUsers((s) => { const n = new Set(s); n.delete(userId); return n; }));

    return () => {
      socket.off("connect"); socket.off("disconnect");
      socket.off("message:new"); socket.off("typing:start");
      socket.off("typing:stop"); socket.off("message:read");
      socket.off("message:deleted"); socket.off("message:react");
      socket.off("user:online"); socket.off("user:offline");
      disconnectSocket();
    };
  }, [isLoggedIn, loadRooms, loadUnread]);

  const openSidebar  = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => { setSidebarOpen(false); setActiveRoom(null); }, []);

  const openRoom = useCallback((room) => {
    setActiveRoom(room);
    setSidebarOpen(true);
    const roomId = room._id;
    markRoomAsRead(roomId).catch(() => {});
    getSocket()?.emit("message:read", { roomId });
    loadUnread();
  }, [loadUnread]);

  const closeRoom = useCallback(() => setActiveRoom(null), []);

  const addOptimisticMessage = useCallback((roomId, msg) => {
    setMessages((prev) => ({ ...prev, [roomId]: [...(prev[roomId] || []), msg] }));
  }, []);

  const replaceOptimisticMessage = useCallback((roomId, tempId, realMsg) => {
    setMessages((prev) => {
      if (!prev[roomId]) return prev;
      return { ...prev, [roomId]: prev[roomId].map((m) => m._id === tempId ? { ...realMsg, status: "sent" } : m) };
    });
  }, []);

  const markOptimisticFailed = useCallback((roomId, tempId) => {
    setMessages((prev) => {
      if (!prev[roomId]) return prev;
      return { ...prev, [roomId]: prev[roomId].map((m) => m._id === tempId ? { ...m, status: "failed" } : m) };
    });
  }, []);

  return (
    <ChatContext.Provider value={{
      sidebarOpen, activeRoom, rooms, unreadTotal, onlineUsers,
      messages, typingUsers, connected,
      openSidebar, closeSidebar, openRoom, closeRoom,
      loadRooms, loadUnread, setMessages,
      addOptimisticMessage, replaceOptimisticMessage, markOptimisticFailed,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
