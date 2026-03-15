import { useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";

export function useTyping(roomId) {
  const timer    = useRef(null);
  const isTyping = useRef(false);
  const lastEmit = useRef(0);

  const onType = useCallback(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;
    const now = Date.now();
    if (!isTyping.current || now - lastEmit.current > 400) {
      socket.emit("typing:start", { roomId });
      isTyping.current = true;
      lastEmit.current = now;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      socket.emit("typing:stop", { roomId });
      isTyping.current = false;
    }, 3000);
  }, [roomId]);

  const onBlur = useCallback(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;
    clearTimeout(timer.current);
    if (isTyping.current) {
      socket.emit("typing:stop", { roomId });
      isTyping.current = false;
    }
  }, [roomId]);

  return { onType, onBlur };
}
