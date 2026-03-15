const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const req = (path, opts = {}) =>
  fetch(`${BASE}${path}`, { credentials: "include", ...opts });

// ── Rooms ─────────────────────────────────────────────────────────
export async function getMyRooms() {
  const r = await req("/api/chat/rooms");
  if (!r.ok) throw new Error("Failed to fetch rooms");
  return r.json();
}

export async function getOrCreateDmRoom(receiverId) {
  const r = await req("/api/chat/rooms/dm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiverId }),
  });
  if (!r.ok) {
    const e = await r.json();
    throw new Error(e.message || "Failed to open DM");
  }
  return r.json();
}

export async function getCommunityRooms() {
  const r = await req("/api/chat/rooms/community");
  if (!r.ok) throw new Error("Failed to fetch community rooms");
  return r.json();
}

export async function createCommunityRoom(data) {
  const r = await req("/api/chat/rooms/community", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to create room");
  return r.json();
}

export async function joinCommunityRoom(roomId) {
  const r = await req(`/api/chat/rooms/${roomId}/join`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to join room");
  return r.json();
}

export async function leaveCommunityRoom(roomId) {
  const r = await req(`/api/chat/rooms/${roomId}/leave`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to leave room");
  return r.json();
}

// ── Messages ──────────────────────────────────────────────────────
export async function getMessages(roomId, page = 1, limit = 30) {
  const r = await req(`/api/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
  if (!r.ok) throw new Error("Failed to fetch messages");
  return r.json();
}

export async function markRoomAsRead(roomId) {
  return req(`/api/chat/rooms/${roomId}/messages/read`, { method: "PUT" });
}

export async function getUnreadCount() {
  const r = await req("/api/chat/unread-count");
  if (!r.ok) return { unreadCount: 0 };
  return r.json();
}
