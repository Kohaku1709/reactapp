const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe, updateMe } = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Validation rules
const registerRules = [
  body("email").isEmail().withMessage("Email không hợp lệ.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu ít nhất 6 ký tự."),
  body("name").trim().notEmpty().withMessage("Tên không được để trống."),
];

const loginRules = [
  body("email").isEmail().withMessage("Email không hợp lệ.").normalizeEmail(),
  body("password").notEmpty().withMessage("Mật khẩu không được để trống."),
];

router.post("/register", registerRules, register);
router.post("/login",    loginRules,    login);
router.get("/me",        authMiddleware, getMe);
router.put("/me",        authMiddleware, updateMe);

module.exports = router;
