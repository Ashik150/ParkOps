const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and add your MongoDB Atlas connection string.",
    );
  }

  const connection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB Atlas connected: ${connection.connection.host}`);
};

module.exports = connectDatabase;
