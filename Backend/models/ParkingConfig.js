const mongoose = require("mongoose");

const parkingConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "MAIN",
      immutable: true,
    },
    vipCapacity: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
    },
    normalCapacity: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ParkingConfig", parkingConfigSchema);
