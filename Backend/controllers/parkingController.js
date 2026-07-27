const mongoose = require("mongoose");
const ParkingSession = require("../models/ParkingSession");
const createAuditLog = require("../services/auditService");
const getParkingConfig = require("../services/parkingConfigService");
const AppError = require("../utils/AppError");
const {
  escapeRegex,
  getAvailableSlotNumbers,
  normalizeVehicleNumber,
} = require("../utils/parking");

const VALID_SLOT_TYPES = ["VIP", "NORMAL"];
const VALID_VEHICLE_TYPES = [
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "MICROBUS",
  "TRUCK",
  "MOTORCYCLE",
  "OTHER",
];

const getAvailability = async (request, response) => {
  const slotType = (request.query.slotType || "NORMAL").toUpperCase();

  if (!VALID_SLOT_TYPES.includes(slotType)) {
    throw new AppError("Slot type must be VIP or NORMAL.", 400);
  }

  const config = await getParkingConfig();
  const capacity =
    slotType === "VIP" ? config.vipCapacity : config.normalCapacity;
  const occupiedSlots = await ParkingSession.distinct("slotNumber", {
    slotType,
    status: "ACTIVE",
    isDeleted: false,
  });

  response.json({
    success: true,
    slotType,
    capacity,
    occupied: occupiedSlots.length,
    availableSlots: getAvailableSlotNumbers(capacity, occupiedSlots),
  });
};

const listEntries = async (request, response) => {
  const filter = { status: "ACTIVE", isDeleted: false };
  const slotType = request.query.slotType?.toUpperCase();
  const search = request.query.search?.trim();

  if (slotType && VALID_SLOT_TYPES.includes(slotType)) {
    filter.slotType = slotType;
  }

  if (search) {
    const safeSearch = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { vehicleNumber: safeSearch },
      { phoneNumber: safeSearch },
    ];
  }

  const entries = await ParkingSession.find(filter)
    .sort({ entryAt: -1 })
    .populate("enteredBy", "name email");

  response.json({ success: true, entries });
};

const createEntry = async (request, response) => {
  const slotType = request.body.slotType?.toUpperCase();
  const vehicleType = request.body.vehicleType?.toUpperCase();
  const vehicleNumber = normalizeVehicleNumber(request.body.vehicleNumber);
  const phoneNumber = request.body.phoneNumber?.trim();
  const slotNumber = Number(request.body.slotNumber);

  if (!VALID_SLOT_TYPES.includes(slotType)) {
    throw new AppError("Select either VIP or Normal parking.", 400);
  }

  if (!vehicleNumber || vehicleNumber.length > 30) {
    throw new AppError("Enter a valid vehicle number.", 400);
  }

  if (!VALID_VEHICLE_TYPES.includes(vehicleType)) {
    throw new AppError("Select a valid vehicle type.", 400);
  }

  if (!/^[+]?[\d\s().-]{7,20}$/.test(phoneNumber || "")) {
    throw new AppError("Enter a valid phone number.", 400);
  }

  const config = await getParkingConfig();
  const capacity =
    slotType === "VIP" ? config.vipCapacity : config.normalCapacity;

  if (
    !Number.isInteger(slotNumber) ||
    slotNumber < 1 ||
    slotNumber > capacity
  ) {
    throw new AppError(
      `Select a ${slotType.toLowerCase()} slot between 1 and ${capacity}.`,
      400,
    );
  }

  const databaseSession = await mongoose.startSession();
  let entryId;

  try {
    await databaseSession.withTransaction(async () => {
      const [entry] = await ParkingSession.create(
        [
          {
            vehicleNumber,
            slotType,
            slotNumber,
            vehicleType,
            phoneNumber,
            enteredBy: request.user._id,
          },
        ],
        { session: databaseSession },
      );
      entryId = entry._id;

      await createAuditLog(
        {
          action: "PARKING_ENTRY",
          entity: "PARKING_SESSION",
          entityId: entry._id,
          message: `${vehicleNumber} entered ${slotType} slot ${slotNumber}`,
          actor: request.user,
          details: {
            vehicleNumber,
            slotType,
            slotNumber,
            vehicleType,
            phoneNumber,
            entryAt: entry.entryAt,
          },
        },
        databaseSession,
      );
    });
  } finally {
    await databaseSession.endSession();
  }

  const entry = await ParkingSession.findById(entryId).populate(
    "enteredBy",
    "name email",
  );

  response.status(201).json({
    success: true,
    message: `${vehicleNumber} checked in successfully.`,
    entry,
  });
};

const exitEntry = async (request, response) => {
  const databaseSession = await mongoose.startSession();
  let exitedEntryId;

  try {
    await databaseSession.withTransaction(async () => {
      const entry = await ParkingSession.findOne({
        _id: request.params.id,
        status: "ACTIVE",
        isDeleted: false,
      }).session(databaseSession);

      if (!entry) {
        throw new AppError("Active parking entry not found.", 404);
      }

      const exitAt = new Date();
      entry.status = "EXITED";
      entry.isDeleted = true;
      entry.exitAt = exitAt;
      entry.durationMinutes = Math.max(
        1,
        Math.ceil((exitAt.getTime() - entry.entryAt.getTime()) / 60000),
      );
      entry.exitedBy = request.user._id;
      await entry.save({ session: databaseSession });
      exitedEntryId = entry._id;

      await createAuditLog(
        {
          action: "PARKING_EXIT",
          entity: "PARKING_SESSION",
          entityId: entry._id,
          message: `${entry.vehicleNumber} exited ${entry.slotType} slot ${entry.slotNumber}`,
          actor: request.user,
          details: {
            vehicleNumber: entry.vehicleNumber,
            slotType: entry.slotType,
            slotNumber: entry.slotNumber,
            entryAt: entry.entryAt,
            exitAt: entry.exitAt,
            durationMinutes: entry.durationMinutes,
          },
        },
        databaseSession,
      );
    });
  } finally {
    await databaseSession.endSession();
  }

  const entry = await ParkingSession.findById(exitedEntryId);

  response.json({
    success: true,
    message: `${entry.vehicleNumber} checked out successfully.`,
    entry,
  });
};

module.exports = {
  createEntry,
  exitEntry,
  getAvailability,
  listEntries,
};
