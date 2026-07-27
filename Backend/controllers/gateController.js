const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");
const GateState = require("../models/GateState");
const createAuditLog = require("../services/auditService");
const getEmergencyGateState = require("../services/gateStateService");
const AppError = require("../utils/AppError");

const GATE_ACTIONS = [
  "EMERGENCY_GATE_OPENED",
  "EMERGENCY_GATE_CLOSED",
];

const getEmergencyGate = async (_request, response) => {
  const [gate, recentActivity] = await Promise.all([
    getEmergencyGateState(),
    AuditLog.find({ action: { $in: GATE_ACTIONS } })
      .sort({ createdAt: -1 })
      .limit(8),
  ]);

  await gate.populate("lastChangedBy", "name email");

  response.json({
    success: true,
    gate,
    recentActivity,
  });
};

const changeEmergencyGate = (nextStatus) => async (request, response) => {
  await getEmergencyGateState();

  const databaseSession = await mongoose.startSession();
  let gateId;

  try {
    await databaseSession.withTransaction(async () => {
      const gate = await GateState.findOne({ key: "EMERGENCY" }).session(
        databaseSession,
      );

      if (!gate) {
        throw new AppError("Emergency gate state could not be initialized.", 500);
      }

      if (gate.status === nextStatus) {
        throw new AppError(
          `Emergency gate is already ${nextStatus.toLowerCase()}.`,
          409,
        );
      }

      const previousStatus = gate.status;
      const changedAt = new Date();
      gate.status = nextStatus;
      gate.lastChangedAt = changedAt;
      gate.lastChangedBy = request.user._id;
      gate.commandVersion += 1;
      await gate.save({ session: databaseSession });
      gateId = gate._id;

      const isOpening = nextStatus === "OPEN";
      await createAuditLog(
        {
          action: isOpening
            ? "EMERGENCY_GATE_OPENED"
            : "EMERGENCY_GATE_CLOSED",
          entity: "GATE",
          entityId: gate._id,
          message: `Emergency gate ${isOpening ? "opened" : "closed"} by ${request.user.name}`,
          actor: request.user,
          details: {
            gateName: "Emergency gate",
            previousStatus,
            newStatus: nextStatus,
            changedAt,
            commandVersion: gate.commandVersion,
          },
        },
        databaseSession,
      );
    });
  } finally {
    await databaseSession.endSession();
  }

  const gate = await GateState.findById(gateId).populate(
    "lastChangedBy",
    "name email",
  );

  response.json({
    success: true,
    message: `Emergency gate is now ${nextStatus.toLowerCase()}.`,
    gate,
  });
};

module.exports = {
  closeEmergencyGate: changeEmergencyGate("CLOSED"),
  getEmergencyGate,
  openEmergencyGate: changeEmergencyGate("OPEN"),
};
