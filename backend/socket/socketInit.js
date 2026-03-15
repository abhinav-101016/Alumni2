import { Server } from "socket.io";
import socketAuthMiddleware from "../middleware/socketAuthMiddleware.js";
import registerSocketHandlers from "./socketHandlers.js";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // WebSocket first, polling as fallback
    transports: ["websocket", "polling"],
    // Tune ping for fast dead-connection detection
    pingInterval: 25000,
    pingTimeout: 20000,
    // Limit payload size — prevents memory bombs
    maxHttpBufferSize: 1e6, // 1 MB
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket);
  });

  console.log("[Socket.IO] Initialized");
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized. Call initSocket() first.");
  return io;
}
