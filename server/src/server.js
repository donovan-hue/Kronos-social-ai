require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "kronos-social-ai",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .catch(error => {
    console.error("MongoDB error:", error.message);
  });

app.listen(PORT, () => {
  console.log(`KRONOS SOCIAL AI API: http://localhost:${PORT}`);
});
