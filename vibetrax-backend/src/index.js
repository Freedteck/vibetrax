import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://vibetrax.vercel.app", "https://www.vibetrax.xyz"]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(limiter);

// Routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 VibeTrax Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
