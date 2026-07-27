require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const app = require("./app");
const connectDatabase = require("./config/db");
const getParkingConfig = require("./services/parkingConfigService");

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must be configured with at least 32 characters.");
    }

    await connectDatabase();
    await getParkingConfig();
    const port = process.env.PORT || 5000;

    const server = app.listen(port, () => {
      console.log(`ParkOps API running on port ${port}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Closing ParkOps API.`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));

    return server;
  } catch (error) {
    console.error(`Unable to start ParkOps API: ${error.message}`);
    process.exitCode = 1;
    return null;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
