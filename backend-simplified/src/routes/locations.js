const express = require("express");
const { getLocations } = require("../controllers/locationController");

const router = express.Router();

// Định nghĩa endpoint: Lấy danh sách điểm đến du lịch phổ biến (GET /api/locations)
router.get("/", getLocations);

module.exports = router;
