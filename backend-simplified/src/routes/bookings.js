const express = require("express");
const { body } = require("express-validator");
const { getMyBookings, createBooking, getBookingById, cancelBooking } = require("../controllers/bookingController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.use(authMiddleware);

const bookingRules = [
  body("hotel_id").isInt({ min: 1 }).withMessage("hotel_id không hợp lệ."),
  body("check_in").isDate().withMessage("Ngày nhận phòng không hợp lệ."),
  body("check_out").isDate().withMessage("Ngày trả phòng không hợp lệ."),
  body("guests").optional().isInt({ min: 1, max: 20 }).withMessage("Số khách không hợp lệ."),
  body("rooms").optional().isInt({ min: 1, max: 10 }).withMessage("Số phòng không hợp lệ."),
];

router.get("/",               getMyBookings);
router.post("/",              bookingRules, createBooking);
router.get("/:id",            getBookingById);
router.patch("/:id/cancel",   cancelBooking);

module.exports = router;
