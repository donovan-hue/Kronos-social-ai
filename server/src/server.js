require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/users.routes");
const postRoutes = require("./modules/posts/posts.routes");
const messageRoutes = require("./modules/messages/messages.routes");
const imageRoutes = require("./modules/image-ai/image.routes");
const videoRoutes = require("./modules/video-ai/video.routes");
const scriptRoutes = require("./modules/script-ai/script.routes");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);

app.use(compression());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS_ORIGIN_NOT_ALLOWED")
      );
    },
    credentials: true
  })
);

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "Demasiadas solicitudes. Intenta nuevamente más tarde."
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "Demasiados intentos. Intenta nuevamente más tarde."
  }
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "kronos-social-ai"
  });
});

app.use("/api", apiLimiter);

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai/images", imageRoutes);
app.use("/api/ai/videos", videoRoutes);
app.use("/api/ai/scripts", scriptRoutes);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});
app.set("io", io);
io.on("connection", (socket) => {
  console.log(
    `Socket conectado: ${socket.id}`
  );

  socket.on("authenticate", (token) => {
    if (
      typeof token !== "string" ||
      !token.trim()
    ) {
      socket.disconnect(true);
      return;
    }

    try {
      const decoded = jwt.verify(
        token.replace(/^Bearer\s+/i, "").trim(),
        process.env.JWT_SECRET
      );

      if (!decoded.id) {
        socket.disconnect(true);
        return;
      }

      socket.join(`user:${decoded.id}`);
    } catch {
      socket.disconnect(true);
    }
  });

  socket.on("disconnect", () => {
    console.log(
      `Socket desconectado: ${socket.id}`
    );
  });
});

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(
        `KRONOS SOCIAL AI API: http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "STARTUP_ERROR:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
