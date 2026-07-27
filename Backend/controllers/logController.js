const AuditLog = require("../models/AuditLog");
const { escapeRegex } = require("../utils/parking");

const listLogs = async (request, response) => {
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(request.query.limit, 10) || 25),
  );
  const filter = {};
  const action = request.query.action?.toUpperCase();
  const search = request.query.search?.trim();

  if (
    ["ADMIN_CREATED", "AUTH_LOGIN", "PARKING_ENTRY", "PARKING_EXIT"].includes(
      action,
    )
  ) {
    filter.action = action;
  }

  if (search) {
    const safeSearch = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { message: safeSearch },
      { "actor.name": safeSearch },
      { "actor.email": safeSearch },
      { "details.vehicleNumber": safeSearch },
    ];
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  response.json({
    success: true,
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
};

module.exports = listLogs;
