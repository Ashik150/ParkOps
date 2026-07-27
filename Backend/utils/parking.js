const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeVehicleNumber = (value = "") =>
  value.trim().toUpperCase().replace(/\s+/g, " ");

const getAvailableSlotNumbers = (capacity, occupiedSlots = []) => {
  const occupied = new Set(occupiedSlots.map(Number));

  return Array.from({ length: capacity }, (_, index) => index + 1).filter(
    (slotNumber) => !occupied.has(slotNumber),
  );
};

const buildSlotSection = (slotType, capacity, activeEntries = []) => {
  const prefix = slotType === "VIP" ? "V" : "N";
  const entriesBySlot = new Map(
    activeEntries
      .filter(
        (entry) =>
          entry.slotType === slotType &&
          entry.slotNumber >= 1 &&
          entry.slotNumber <= capacity,
      )
      .map((entry) => [entry.slotNumber, entry]),
  );

  const slots = Array.from({ length: capacity }, (_, index) => {
    const slotNumber = index + 1;
    const entry = entriesBySlot.get(slotNumber);

    return {
      slotNumber,
      slotCode: `${prefix}-${String(slotNumber).padStart(2, "0")}`,
      status: entry ? "OCCUPIED" : "FREE",
      vehicle: entry
        ? {
            entryId: entry._id,
            vehicleNumber: entry.vehicleNumber,
            vehicleType: entry.vehicleType,
            phoneNumber: entry.phoneNumber,
            entryAt: entry.entryAt,
          }
        : null,
    };
  });
  const occupied = entriesBySlot.size;

  return {
    slotType,
    capacity,
    occupied,
    free: capacity - occupied,
    slots,
  };
};

module.exports = {
  buildSlotSection,
  escapeRegex,
  getAvailableSlotNumbers,
  normalizeVehicleNumber,
};
