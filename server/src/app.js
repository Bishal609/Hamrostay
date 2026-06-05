// server/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { errorHandler, notFound } = require("./middleware/error.middleware");

// Route imports
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const roomRoutes = require("./modules/rooms/room.routes");
const bookingRoutes = require("./modules/bookings/booking.routes");
const paymentRoutes = require("./modules/payments/payment.routes");
const chatRoutes = require("./modules/chat/chat.routes");
const vendorRoutes = require("./modules/vendors/vendor.routes");
const fnmisRoutes = require("./modules/fnmis/fnmis.routes");

const app = express();

// ─── Security Middleware ───────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});

app.use("/api", limiter);
app.use("/api/auth", authLimiter);

// ─── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Compression & Logging ─────────────────────────────────
app.use(compression());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health Check ──────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "HamroStay API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/fnmis", fnmisRoutes);

// ─── Error Handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
