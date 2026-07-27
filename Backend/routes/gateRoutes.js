const express = require("express");
const {
  closeEmergencyGate,
  getEmergencyGate,
  openEmergencyGate,
} = require("../controllers/gateController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/emergency", asyncHandler(getEmergencyGate));
router.post("/emergency/open", asyncHandler(openEmergencyGate));
router.post("/emergency/close", asyncHandler(closeEmergencyGate));

module.exports = router;
