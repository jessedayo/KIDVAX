// Main entry point for KIDVAX backend
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Import routes
const authRoutes = require("./routes/authRoutes");
const childRoutes = require("./routes/childRoutes");
const vaccineRoutes = require("./routes/vaccineRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");

// Start cron job
require("./services/cronService");

require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use("/api/user", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "✅ KIDVAX server is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 KIDVAX server running on http://localhost:${PORT}`);
});
