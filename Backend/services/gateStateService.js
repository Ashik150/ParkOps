const GateState = require("../models/GateState");

const getEmergencyGateState = () =>
  GateState.findOneAndUpdate(
    { key: "EMERGENCY" },
    {
      $setOnInsert: {
        key: "EMERGENCY",
        status: "CLOSED",
        commandVersion: 0,
        lastChangedAt: new Date(),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  );

module.exports = getEmergencyGateState;
