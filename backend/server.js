const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const documentRoutes = require("./routes/document.routes");
const noteRoutes = require("./routes/note.routes");
const quizRoutes = require("./routes/quiz.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

// ─── Security Middleware ─────────────────────────────────────────
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// ─── CORS ───────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body Parsers ───────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─── Logging ────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Database Connection ────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ─── Root Route ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Study Assistant Backend is running 🚀",
  });
});

// ─── Health Route ───────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "AI Study Assistant API is running",
    timestamp: new Date().toISOString(),
    aiProvider: process.env.AI_PROVIDER || "groq",
  });
});

// ─── API Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/chats", chatRoutes);

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
  );
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || "groq"}`);
});

module.exports = app;