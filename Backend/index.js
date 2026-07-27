require("dotenv").config({ quiet: true });

const express = require("express");
const mongoose = require("mongoose");
const connectDatabase = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get("/api/health", (_request, response) => {
  const database =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  response.status(database === "connected" ? 200 : 503).json({
    status: database === "connected" ? "ok" : "unavailable",
    database,
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log(`ParkOps API running on port ${port}`);
    });
  } catch (error) {
    console.error(`Unable to start ParkOps API: ${error.message}`);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
