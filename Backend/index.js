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
    const port = process.env.PORT || 5001;

    const server = await new Promise((resolve, reject) => {
      const httpServer = app.listen(port, () => {
        httpServer.removeListener("error", reject);
        resolve(httpServer);
      });
      httpServer.once("error", reject);
    });
    console.log(`ParkOps API running at http://localhost:${port}`);

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
    const message =
      error.code === "EADDRINUSE"
        ? `Port ${process.env.PORT || 5001} is already in use. Choose another PORT in Backend/.env.`
        : error.message;
    console.error(`Unable to start ParkOps API: ${message}`);
    process.exitCode = 1;
    return null;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
