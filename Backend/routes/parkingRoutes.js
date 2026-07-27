const express = require("express");
const {
  createEntry,
  exitEntry,
  getAvailability,
  getSlotMap,
  listEntries,
} = require("../controllers/parkingController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/availability", asyncHandler(getAvailability));
router.get("/slots", asyncHandler(getSlotMap));
router.route("/entries").get(asyncHandler(listEntries)).post(asyncHandler(createEntry));
router.post("/entries/:id/exit", asyncHandler(exitEntry));

module.exports = router;
