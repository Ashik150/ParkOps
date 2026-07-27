const express = require("express");
const listLogs = require("../controllers/logController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(listLogs));

module.exports = router;
