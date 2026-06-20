const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe, updateMe, googleLogin, forgotPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Quy tắc kiểm tra tính hợp lệ dữ liệu (Validation rules) khi đăng ký
const registerRules = [
  body("email").isEmail().withMessage("Email không hợp lệ.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu ít nhất 6 ký tự."),
  body("name").trim().notEmpty().withMessage("Tên không được để trống."),
];

// Quy tắc kiểm tra tính hợp lệ dữ liệu khi đăng nhập
const loginRules = [
  body("email").isEmail().withMessage("Email không hợp lệ.").normalizeEmail(),
  body("password").notEmpty().withMessage("Mật khẩu không được để trống."),
];

// Định nghĩa các endpoints API:
// 1. Đăng ký tài khoản mới (POST /api/auth/register)
router.post("/register", registerRules, register);

// 2. Đăng nhập hệ thống (POST /api/auth/login)
router.post("/login",    loginRules,    login);

// 3. Đăng nhập bằng tài khoản Google (POST /api/auth/google)
router.post("/google", googleLogin);

// 4. Quên mật khẩu - gửi mã xác nhận (POST /api/auth/forgot-password)
router.post("/forgot-password", forgotPassword);

// 5. Đặt lại mật khẩu mới qua mã xác nhận (POST /api/auth/reset-password)
router.post("/reset-password", resetPassword);

// 6. Lấy thông tin cá nhân hiện tại (GET /api/auth/me) - Yêu cầu token hợp lệ thông qua authMiddleware
router.get("/me",        authMiddleware, getMe);

// 7. Cập nhật thông tin cá nhân (PUT /api/auth/me) - Yêu cầu token hợp lệ
router.put("/me",        authMiddleware, updateMe);

module.exports = router;
