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

module.exports = {
  escapeRegex,
  getAvailableSlotNumbers,
  normalizeVehicleNumber,
};
