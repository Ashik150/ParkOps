const AppError = require("../utils/AppError");

const notFound = (request, _response, next) => {
  next(new AppError(`Route not found: ${request.method} ${request.path}`, 404));
};

const errorHandler = (error, _request, response, _next) => {
  let normalizedError = error;

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];
    const message =
      duplicateField === "vehicleNumber"
        ? "This vehicle already has an active parking entry."
        : duplicateField === "slotType"
          ? "That parking slot was just occupied. Please select another slot."
          : "A record with these details already exists.";
    normalizedError = new AppError(message, 409);
  }

  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map(
      (validationError) => validationError.message,
    );
    normalizedError = new AppError("Please correct the submitted details.", 400, details);
  }

  if (error.name === "CastError") {
    normalizedError = new AppError("The requested record ID is invalid.", 400);
  }

  const statusCode = normalizedError.statusCode || 500;
  const message =
    normalizedError.isOperational || process.env.NODE_ENV !== "production"
      ? normalizedError.message
      : "An unexpected server error occurred.";

  response.status(statusCode).json({
    success: false,
    message,
    ...(normalizedError.details && { details: normalizedError.details }),
  });
};

module.exports = { errorHandler, notFound };
