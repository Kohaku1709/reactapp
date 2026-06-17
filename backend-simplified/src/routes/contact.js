const express = require("express");
const { body } = require("express-validator");
const { sendContact } = require("../controllers/contactController");

const router = express.Router();

// Quy tắc xác thực tin nhắn liên hệ gửi lên
const contactRules = [
  body("name").trim().notEmpty().withMessage("Tên không được để trống."),
  body("email").isEmail().withMessage("Email không hợp lệ.").normalizeEmail(),
  body("message").trim().isLength({ min: 10 }).withMessage("Nội dung ít nhất 10 ký tự."),
];

// Định nghĩa endpoint: Gửi tin nhắn liên hệ (POST /api/contact)
router.post("/", contactRules, sendContact);

module.exports = router;
