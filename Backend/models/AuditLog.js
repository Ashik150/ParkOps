const mongoose = require("mongoose");

const actorSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
  },
  { _id: false },
);

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "ADMIN_CREATED",
        "AUTH_LOGIN",
        "PARKING_ENTRY",
        "PARKING_EXIT",
        "EMERGENCY_GATE_OPENED",
        "EMERGENCY_GATE_CLOSED",
      ],
      required: true,
      index: true,
    },
    entity: {
      type: String,
      enum: ["USER", "PARKING_SESSION", "GATE"],
      required: true,
    },
    entityId: mongoose.Schema.Types.ObjectId,
    message: {
      type: String,
      required: true,
      maxlength: 300,
    },
    actor: {
      type: actorSchema,
      required: true,
    },
    details: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
