const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and add your MongoDB Atlas connection string.",
    );
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || "parkops",
      retryWrites: true,
      serverSelectionTimeoutMS: 10000,
      w: "majority",
    });

    console.log(
      `MongoDB Atlas connected: ${connection.connection.host}/${connection.connection.name}`,
    );
  } catch (error) {
    if (
      error.code === 8000 ||
      /bad auth|authentication failed/i.test(error.message)
    ) {
      throw new Error(
        "MongoDB Atlas authentication failed. Reset the Atlas database user's password and update MONGODB_URI in Backend/.env.",
      );
    }

    if (/querySrv|ENOTFOUND|ECONNREFUSED/i.test(error.message)) {
      throw new Error(
        "MongoDB Atlas host could not be resolved. Copy a fresh Node.js driver connection string from Atlas.",
      );
    }

    if (/server selection timed out/i.test(error.message)) {
      throw new Error(
        "MongoDB Atlas could not be reached. Add your current IP address to the Atlas Network Access list.",
      );
    }

    throw error;
  }
};

module.exports = connectDatabase;
