import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/adminRoutes.js"
import profileRoutes from "./routes/profile.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

import { initSocket } from "./socket/socketInit.js";
import redis from "./utils/redis.js";

dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST","PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── MongoDB ─────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("[MongoDB] Connected"))
  .catch((err) => console.error("[MongoDB] Error:", err));

// ── REST Routes ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard",dashboardRouter)

// Health check — also verifies Redis is alive
app.get("/health", async (req, res) => {
  let redisOk = false;
  try {
    await redis.ping();
    redisOk = true;
  } catch (_) {}
  res.json({
    status: "OK",
    redis: redisOk ? "connected" : "unavailable",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "unavailable",
  });
});

// ── HTTP + Socket.IO ────────────────────────────────────────────────
const httpServer = createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 3000;
const server = httpServer.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

// ── Graceful shutdown ───────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`[Server] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    await mongoose.connection.close();
    await redis.quit();
    console.log("[Server] Shutdown complete");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

export default app;
