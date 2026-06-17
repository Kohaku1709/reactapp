const express = require("express");
const { getHotels, getHotelById, getFeaturedHotels } = require("../controllers/hotelController");

const router = express.Router();

// Định nghĩa các endpoint khách sạn:
// 1. Lấy danh sách khách sạn nổi bật (GET /api/hotels/featured)
// Lưu ý: Đặt route tĩnh này TRƯỚC route động /:id để tránh Express nhận nhầm chữ "featured" làm ID khách sạn
router.get("/featured", getFeaturedHotels);

// 2. Lấy toàn bộ danh sách khách sạn kèm bộ lọc và tìm kiếm (GET /api/hotels)
router.get("/", getHotels);

// 3. Lấy thông tin chi tiết một khách sạn theo ID (GET /api/hotels/:id)
router.get("/:id", getHotelById);

module.exports = router;
