const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const pool = require("../config/db");

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    // Kiểm tra email đã tồn tại chưa
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email này đã được đăng ký." });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users(email, password, name) VALUES($1,$2,$3) RETURNING id, email, name, created_at",
      [email.toLowerCase(), hash, name.trim()]
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: { token, user: { id: user.id, email: user.email, name: user.name } },
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ. Vui lòng thử lại." });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, email, name, password, is_active FROM users WHERE email=$1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      data: { token, user: { id: user.id, email: user.email, name: user.name } },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ. Vui lòng thử lại." });
  }
};

// GET /api/auth/me  (cần đăng nhập)
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, avatar_url, created_at FROM users WHERE id=$1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user." });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// PUT /api/auth/me  (cần đăng nhập)
const updateMe = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Tên không được để trống." });
  }
  try {
    const result = await pool.query(
      "UPDATE users SET name=$1 WHERE id=$2 RETURNING id, email, name",
      [name.trim(), req.user.id]
    );
    res.json({ success: true, message: "Cập nhật thành công.", data: result.rows[0] });
  } catch (err) {
    console.error("updateMe error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

module.exports = { register, login, getMe, updateMe };
