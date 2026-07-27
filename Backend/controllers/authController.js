const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const createAuditLog = require("../services/auditService");
const AppError = require("../utils/AppError");

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not configured on the server.", 500);
  }

  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "12h" },
  );
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  lastLoginAt: user.lastLoginAt,
});

const register = async (request, response) => {
  const existingAdmins = await User.countDocuments();

  if (existingAdmins > 0) {
    throw new AppError(
      "Initial setup is already complete. Sign in with an admin account.",
      403,
    );
  }

  const name = request.body.name?.trim();
  const email = request.body.email?.trim().toLowerCase();
  const password = request.body.password || "";

  if (!name || name.length < 2) {
    throw new AppError("Admin name must contain at least 2 characters.", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
    throw new AppError("Enter a valid admin email address.", 400);
  }

  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new AppError(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      400,
    );
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });

  await createAuditLog({
    action: "ADMIN_CREATED",
    entity: "USER",
    entityId: user._id,
    message: `Initial administrator ${user.name} was created`,
    actor: user,
    details: { email: user.email },
  });

  response.status(201).json({
    success: true,
    token: signToken(user),
    user: publicUser(user),
  });
};

const login = async (request, response) => {
  const email = request.body.email?.trim().toLowerCase();
  const password = request.body.password || "";

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email, isActive: true }).select(
    "+passwordHash",
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("The email or password is incorrect.", 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  await createAuditLog({
    action: "AUTH_LOGIN",
    entity: "USER",
    entityId: user._id,
    message: `${user.name} signed in to the admin dashboard`,
    actor: user,
    details: { email: user.email },
  });

  response.json({
    success: true,
    token: signToken(user),
    user: publicUser(user),
  });
};

const me = async (request, response) => {
  response.json({ success: true, user: publicUser(request.user) });
};

module.exports = { login, me, register };
