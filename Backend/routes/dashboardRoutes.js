const express = require("express");
const getDashboard = require("../controllers/dashboardController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getDashboard));

module.exports = router;
