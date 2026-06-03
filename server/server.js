// Main entry point for KIDVAX backend
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require("./routes/authRoutes");
const childRoutes = require("./routes/childRoutes");
const vaccineRoutes = require("./routes/vaccineRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Start cron job for automatic reminders
require("./services/cronService");

require("./config/db");

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/children", childRoutes);
app.use("/api/vaccines", vaccineRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "✅ KIDVAX server is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 KIDVAX server running on http://localhost:${PORT}`);
});
