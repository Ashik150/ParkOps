const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  action,
  entity,
  entityId,
  message,
  actor,
  details,
}, databaseSession) => {
  const auditLog = new AuditLog({
    action,
    entity,
    entityId,
    message,
    actor: {
      userId: actor._id,
      name: actor.name,
      email: actor.email,
    },
    details,
  });

  return auditLog.save({ session: databaseSession });
};

module.exports = createAuditLog;
