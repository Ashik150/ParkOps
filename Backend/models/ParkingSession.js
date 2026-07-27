const mongoose = require("mongoose");

const parkingSessionSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    slotType: {
      type: String,
      enum: ["VIP", "NORMAL"],
      required: true,
    },
    slotNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    vehicleType: {
      type: String,
      enum: [
        "SEDAN",
        "SUV",
        "HATCHBACK",
        "MICROBUS",
        "TRUCK",
        "MOTORCYCLE",
        "OTHER",
      ],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^[+]?[\d\s().-]{7,20}$/,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXITED"],
      default: "ACTIVE",
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    entryAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    exitAt: Date,
    durationMinutes: Number,
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

parkingSessionSchema.index(
  { vehicleNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "ACTIVE" },
    name: "unique_active_vehicle",
  },
);

parkingSessionSchema.index(
  { slotType: 1, slotNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "ACTIVE" },
    name: "unique_active_slot",
  },
);

parkingSessionSchema.methods.toJSON = function toJSON() {
  const parkingSession = this.toObject();
  delete parkingSession.__v;
  return parkingSession;
};

module.exports = mongoose.model("ParkingSession", parkingSessionSchema);
