const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth");
const adminMiddleware = require("../middlewares/admin");
const {
  getBookings,
  updateBookingStatus,
  getContacts,
  markContactRead,
  createHotel,
  updateHotel,
  deleteHotel
} = require("../controllers/adminController");

// Thiết lập tất cả các endpoint admin đi qua middleware kiểm tra đăng nhập và phân quyền admin
router.use(authMiddleware);
router.use(adminMiddleware);

// ─── ĐƯỜNG DẪN QUẢN LÝ ĐƠN ĐẶT PHÒNG (BOOKINGS) ──────────────────────────────
router.get("/bookings", getBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

// ─── ĐƯỜNG DẪN QUẢN LÝ TIN NHẮN (CONTACTS) ──────────────────────────────────
router.get("/contacts", getContacts);
router.patch("/contacts/:id/read", markContactRead);

// ─── ĐƯỜNG DẪN QUẢN LÝ KHÁCH SẠN (HOTELS CRUD) ───────────────────────────────
router.post("/hotels", createHotel);
router.put("/hotels/:id", updateHotel);
router.delete("/hotels/:id", deleteHotel);

module.exports = router;
