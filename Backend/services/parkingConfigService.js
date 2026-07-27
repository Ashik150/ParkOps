const ParkingConfig = require("../models/ParkingConfig");

const parseCapacity = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getParkingConfig = () =>
  ParkingConfig.findOneAndUpdate(
    { key: "MAIN" },
    {
      $setOnInsert: {
        key: "MAIN",
        vipCapacity: parseCapacity(process.env.VIP_CAPACITY, 20),
        normalCapacity: parseCapacity(process.env.NORMAL_CAPACITY, 80),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  );

module.exports = getParkingConfig;
