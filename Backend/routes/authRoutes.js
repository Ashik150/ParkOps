const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { login, me, register } = require("../controllers/authController");
const protect = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

router.post("/register", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));
router.get("/me", protect, asyncHandler(me));

module.exports = router;
