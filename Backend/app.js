const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const gateRoutes = require("./routes/gateRoutes");
const logRoutes = require("./routes/logRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const protect = require("./middleware/auth");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  const database =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  response.status(database === "connected" ? 200 : 503).json({
    status: database === "connected" ? "ok" : "unavailable",
    database,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);
app.use("/api/parking", protect, parkingRoutes);
app.use("/api/gates", protect, gateRoutes);
app.use("/api/logs", protect, logRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
