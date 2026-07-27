const AuditLog = require("../models/AuditLog");
const ParkingSession = require("../models/ParkingSession");
const getParkingConfig = require("../services/parkingConfigService");

const getDashboard = async (_request, response) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    config,
    occupiedByType,
    recentEntries,
    recentLogs,
    entriesToday,
    exitsToday,
  ] = await Promise.all([
    getParkingConfig(),
    ParkingSession.aggregate([
      { $match: { status: "ACTIVE", isDeleted: false } },
      { $group: { _id: "$slotType", count: { $sum: 1 } } },
    ]),
    ParkingSession.find({ status: "ACTIVE", isDeleted: false })
      .sort({ entryAt: -1 })
      .limit(6)
      .select("vehicleNumber slotType slotNumber vehicleType phoneNumber entryAt"),
    AuditLog.find({ action: { $in: ["PARKING_ENTRY", "PARKING_EXIT"] } })
      .sort({ createdAt: -1 })
      .limit(6),
    ParkingSession.countDocuments({ entryAt: { $gte: startOfDay } }),
    ParkingSession.countDocuments({
      status: "EXITED",
      exitAt: { $gte: startOfDay },
    }),
  ]);

  const occupied = Object.fromEntries(
    occupiedByType.map((item) => [item._id, item.count]),
  );
  const vipOccupied = occupied.VIP || 0;
  const normalOccupied = occupied.NORMAL || 0;
  const totalCapacity = config.vipCapacity + config.normalCapacity;
  const totalOccupied = vipOccupied + normalOccupied;

  response.json({
    success: true,
    summary: {
      totalCapacity,
      totalOccupied,
      totalFree: totalCapacity - totalOccupied,
      utilization:
        totalCapacity === 0
          ? 0
          : Math.round((totalOccupied / totalCapacity) * 100),
      entriesToday,
      exitsToday,
    },
    parkingTypes: {
      VIP: {
        capacity: config.vipCapacity,
        occupied: vipOccupied,
        free: config.vipCapacity - vipOccupied,
      },
      NORMAL: {
        capacity: config.normalCapacity,
        occupied: normalOccupied,
        free: config.normalCapacity - normalOccupied,
      },
    },
    recentEntries,
    recentLogs,
  });
};

module.exports = getDashboard;
