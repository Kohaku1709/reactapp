const express = require("express");
const { body } = require("express-validator");
const { sendContact } = require("../controllers/contactController");

const router = express.Router();

const contactRules = [
  body("name").trim().notEmpty().withMessage("Tên không được để trống."),
  body("email").isEmail().withMessage("Email không hợp lệ.").normalizeEmail(),
  body("message").trim().isLength({ min: 10 }).withMessage("Nội dung ít nhất 10 ký tự."),
];

router.post("/", contactRules, sendContact);

module.exports = router;
