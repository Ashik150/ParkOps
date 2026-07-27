const assert = require("node:assert/strict");
const test = require("node:test");
const AuditLog = require("../models/AuditLog");
const GateState = require("../models/GateState");

test("emergency gate supports only open and closed states", () => {
  const statusPath = GateState.schema.path("status");

  assert.deepEqual(statusPath.enumValues, ["OPEN", "CLOSED"]);
  assert.equal(statusPath.defaultValue, "CLOSED");
});

test("audit log schema accepts emergency gate state changes", () => {
  const actionValues = AuditLog.schema.path("action").enumValues;
  const entityValues = AuditLog.schema.path("entity").enumValues;

  assert.equal(actionValues.includes("EMERGENCY_GATE_OPENED"), true);
  assert.equal(actionValues.includes("EMERGENCY_GATE_CLOSED"), true);
  assert.equal(entityValues.includes("GATE"), true);
});
