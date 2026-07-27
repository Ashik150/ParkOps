const mongoose = require("mongoose");

const gateStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ["EMERGENCY"],
      unique: true,
      default: "EMERGENCY",
      immutable: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "CLOSED",
      required: true,
    },
    commandVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastChangedAt: {
      type: Date,
      default: Date.now,
    },
    lastChangedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GateState", gateStateSchema);
