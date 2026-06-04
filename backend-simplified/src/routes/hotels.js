const express = require("express");
const { getHotels, getHotelById, getFeaturedHotels } = require("../controllers/hotelController");

const router = express.Router();

// GET /api/hotels/featured  — phải đặt TRƯỚC /:id để không bị match nhầm
router.get("/featured", getFeaturedHotels);

// GET /api/hotels?filter=...&sort=...&search=...&page=...&limit=...
router.get("/", getHotels);

// GET /api/hotels/:id
router.get("/:id", getHotelById);

module.exports = router;
