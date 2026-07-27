const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const User = require("../models/User");

const protect = async (request, _response, next) => {
  try {
    const authorization = request.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      throw new AppError("Authentication is required.", 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError("JWT_SECRET is not configured on the server.", 500);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: payload.sub, isActive: true });

    if (!user) {
      throw new AppError("Your account is unavailable.", 401);
    }

    request.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      next(new AppError("Your session is invalid or has expired.", 401));
      return;
    }

    next(error);
  }
};

module.exports = protect;
