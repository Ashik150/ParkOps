const assert = require("node:assert/strict");
const test = require("node:test");
const ParkingSession = require("../models/ParkingSession");
const {
  getAvailableSlotNumbers,
  normalizeVehicleNumber,
} = require("../utils/parking");

test("vehicle numbers are normalized before uniqueness checks", () => {
  assert.equal(
    normalizeVehicleNumber("  dhaka metro ga-12-3456  "),
    "DHAKA METRO GA-12-3456",
  );
});

test("available slots exclude every occupied slot", () => {
  assert.deepEqual(getAvailableSlotNumbers(6, [1, 3, 6]), [2, 4, 5]);
});

test("active vehicles and active slots have partial unique indexes", () => {
  const indexes = ParkingSession.schema.indexes();
  const vehicleIndex = indexes.find(
    ([fields]) => fields.vehicleNumber === 1,
  );
  const slotIndex = indexes.find(
    ([fields]) => fields.slotType === 1 && fields.slotNumber === 1,
  );

  assert.equal(vehicleIndex[1].unique, true);
  assert.deepEqual(vehicleIndex[1].partialFilterExpression, {
    status: "ACTIVE",
  });
  assert.equal(slotIndex[1].unique, true);
  assert.deepEqual(slotIndex[1].partialFilterExpression, {
    status: "ACTIVE",
  });
});
