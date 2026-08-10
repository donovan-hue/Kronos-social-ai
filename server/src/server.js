require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const postsRoutes = require("./modules/posts/posts.routes");
const messagesRoutes = require("./modules/messages/messages.routes");
const scriptRoutes = require("./modules/script-ai/script.routes");
const imageRoutes = require("./modules/image-ai/image.routes");
const videoRoutes = require("./modules/video-ai/video.routes");

const app = express();
const server = http.createServer(app);

const clientUrl =
  process.env.CLIENT_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    credentials: true
  }
});

app.set("io", io);

app.use(helmet());
app.use(
  cors({
    origin: clientUrl,
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/ai/scripts", scriptRoutes);
app.use("/api/ai/images", imageRoutes);
app.use("/api/ai/videos", videoRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "kronos-social-ai",
    realtime: true,
    timestamp: new Date().toISOString()
  });
});

const onlineUsers = new Map();

io.on("connection", socket => {
  socket.on("user:join", userId => {
    if (!userId) return;

    socket.userId = String(userId);
    socket.join(`user:${userId}`);

    onlineUsers.set(String(userId), socket.id);

    io.emit("user:online", {
      userId: String(userId)
    });
  });

  socket.on("typing:start", ({ receiverId }) => {
    if (!socket.userId || !receiverId) return;

    io.to(`user:${receiverId}`).emit(
      "typing:start",
      {
        userId: socket.userId
      }
    );
  });

  socket.on("typing:stop", ({ receiverId }) => {
    if (!socket.userId || !receiverId) return;

    io.to(`user:${receiverId}`).emit(
      "typing:stop",
      {
        userId: socket.userId
      }
    );
  });

  socket.on("disconnect", () => {
    if (!socket.userId) return;

    onlineUsers.delete(socket.userId);

    io.emit("user:offline", {
      userId: socket.userId
    });
  });
});

const PORT = process.env.PORT || 5000;

connectDB().catch(error => {
  console.error("MongoDB error:", error.message);
});

server.listen(PORT, () => {
  console.log(
    `KRONOS SOCIAL AI API: http://localhost:${PORT}`
  );
});
