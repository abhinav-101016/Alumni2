// 📁 src/lib/connectionApi.js

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const apiFetch = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}/api${url}`, {
    credentials: "include", // sends your HTTP-only cookie automatically
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const sendRequest       = (receiverId, message = "") => apiFetch(`/connections/send/${receiverId}`, { method: "POST", body: JSON.stringify({ message }) });
export const cancelRequest     = (receiverId)               => apiFetch(`/connections/cancel/${receiverId}`, { method: "DELETE" });
export const acceptRequest     = (connectionId)             => apiFetch(`/connections/accept/${connectionId}`, { method: "PUT" });
export const rejectRequest     = (connectionId)             => apiFetch(`/connections/reject/${connectionId}`, { method: "PUT" });
export const removeConnection  = (userId)                   => apiFetch(`/connections/remove/${userId}`, { method: "DELETE" });
export const getMyConnections  = ()                         => apiFetch("/connections");
export const getReceivedRequests = ()                       => apiFetch("/connections/requests/received");
export const getSentRequests   = ()                         => apiFetch("/connections/requests/sent");
export const getConnectionStatus = (userId)                 => apiFetch(`/connections/status/${userId}`);
