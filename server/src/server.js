require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("STARTUP_ERROR: JWT_SECRET no configurado");
  process.exit(1);
}

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
const notificationRoutes = require("./modules/notifications/notifications.routes");
const imageRoutes = require("./modules/image-ai/image.routes");
const videoRoutes = require("./modules/video-ai/video.routes");
const scriptRoutes = require("./modules/script-ai/script.routes");
const chatRoutes = require("./modules/ai-core/routes/chat.routes");
const inputSanitizer = require("./middleware/inputSanitizer");
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

app.use(inputSanitizer);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Demasiadas solicitudes. Intenta nuevamente más tarde."
  }
});

app.use("/api", apiLimiter);
const abuseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "Demasiadas acciones en poco tiempo. Intenta nuevamente más tarde."
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


app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use("/api/users", userRoutes);
app.use("/api/posts", abuseLimiter, postRoutes);
app.use("/api/messages", abuseLimiter, messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai/images", imageRoutes);
app.use("/api/ai/videos", videoRoutes);
app.use("/api/ai/scripts", scriptRoutes);
app.use("/api/ai", chatRoutes);
// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("API_ERROR:", err);

  if (res.headersSent) {
    return next(err);
  }

  const status =
    Number.isInteger(err.statusCode)
      ? err.statusCode
      : Number.isInteger(err.status)
        ? err.status
        : 500;

  res.status(status).json({
    error:
      status >= 500
        ? "Error interno del servidor"
        : err.message || "Error de solicitud"
  });
});
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
  process.env.JWT_SECRET,
  {
    algorithms: ["HS256"]
  }
);

if (
  typeof decoded.id !== "string" ||
  !decoded.id.trim()
) {
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
