const express = require("express");
const { body } = require("express-validator");
const { getMyBookings, createBooking, getBookingById, cancelBooking } = require("../controllers/bookingController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Bắt buộc tất cả các tuyến đặt phòng bên dưới đều phải đi qua authMiddleware để kiểm tra đăng nhập
router.use(authMiddleware);

// Quy tắc kiểm tra dữ liệu đầu vào khi đặt phòng
const bookingRules = [
  body("hotel_id").isInt({ min: 1 }).withMessage("hotel_id không hợp lệ."),
  body("check_in").isDate().withMessage("Ngày nhận phòng không hợp lệ."),
  body("check_out").isDate().withMessage("Ngày trả phòng không hợp lệ."),
  body("guests").optional().isInt({ min: 1, max: 20 }).withMessage("Số khách không hợp lệ."),
  body("rooms").optional().isInt({ min: 1, max: 10 }).withMessage("Số phòng không hợp lệ."),
];

// Định nghĩa các endpoint đặt phòng:
// 1. Lấy danh sách lịch sử đặt phòng của user hiện tại (GET /api/bookings)
router.get("/",               getMyBookings);

// 2. Tạo đơn đặt phòng mới (POST /api/bookings)
router.post("/",              bookingRules, createBooking);

// 3. Lấy thông tin chi tiết một đơn đặt phòng (GET /api/bookings/:id)
router.get("/:id",            getBookingById);

// 4. Hủy đặt phòng (PATCH /api/bookings/:id/cancel)
router.patch("/:id/cancel",   cancelBooking);

module.exports = router;
