const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const pool = require("../config/db");

// Hàm phụ: Tạo mã JWT Token dựa trên thông tin người dùng
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // Token hết hạn sau 7 ngày mặc định
  );

// API: Đăng ký tài khoản người dùng mới
// POST /api/auth/register
const register = async (req, res) => {
  // Trả về danh sách lỗi nếu dữ liệu gửi lên không vượt qua Validator (email hợp lệ, mật khẩu đủ ký tự...)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    // 1. Kiểm tra xem email đã được đăng ký trước đó chưa
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email này đã được đăng ký." });
    }

    // 2. Băm mật khẩu (Hash) bằng bcrypt với độ muối 10 vòng bảo mật
    const hash = await bcrypt.hash(password, 10);
    
    // 3. Chèn bản ghi người dùng mới vào database với vai trò mặc định là 'user'
    const result = await pool.query(
      "INSERT INTO users(email, password, name, role) VALUES($1,$2,$3,$4) RETURNING id, email, name, role, created_at",
      [email.toLowerCase(), hash, name.trim(), "user"]
    );

    const user = result.rows[0];
    // 4. Tạo token và gửi kèm về Client để tự động đăng nhập luôn
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ. Vui lòng thử lại." });
  }
};

// API: Đăng nhập tài khoản người dùng
// POST /api/auth/login
const login = async (req, res) => {
  // Trả về lỗi nếu định dạng nhập liệu không đúng
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 1. Truy vấn tài khoản dựa trên email nhập vào (lấy cả trường role)
    const result = await pool.query(
      "SELECT id, email, name, role, password, is_active FROM users WHERE email=$1",
      [email.toLowerCase()]
    );

    // Báo lỗi nếu không tìm thấy người dùng
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }

    const user = result.rows[0];

    // Kiểm tra tài khoản có đang bị khóa bởi admin không
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa." });
    }

    // 2. So khớp mật khẩu băm trong database với mật khẩu người dùng nhập bằng bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }

    // 3. Tạo mã JWT token trả về để duy trì phiên làm việc
    const token = signToken(user);

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ. Vui lòng thử lại." });
  }
};

// API: Lấy thông tin cá nhân của người dùng hiện tại (yêu cầu đăng nhập)
// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    // Lấy thông tin chi tiết bằng req.user.id đã được middleware giải mã sẵn (lấy cả trường role)
    const result = await pool.query(
      "SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id=$1",
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

// API: Cập nhật tên hiển thị hoặc mật khẩu của người dùng (yêu cầu đăng nhập)
// PUT /api/auth/me
const updateMe = async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  try {
    // 1. Lấy thông tin user hiện tại từ DB (bao gồm mật khẩu cũ để so khớp)
    const userRes = await pool.query(
      "SELECT id, password, name, email, role FROM users WHERE id=$1",
      [req.user.id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }
    const user = userRes.rows[0];

    let queryParts = [];
    let queryParams = [];
    let paramIndex = 1;

    // 2. Xử lý cập nhật tên hiển thị nếu được gửi lên
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: "Tên không được để trống." });
      }
      queryParts.push(`name = $${paramIndex}`);
      queryParams.push(name.trim());
      paramIndex++;
    }

    // 3. Xử lý cập nhật mật khẩu nếu gửi kèm mật khẩu cũ và mới
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Mật khẩu mới phải từ 6 ký tự trở lên." });
      }
      // So khớp mật khẩu hiện tại bằng bcrypt
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không chính xác." });
      }
      // Mã hóa mật khẩu mới trước khi lưu
      const newHash = await bcrypt.hash(newPassword, 10);
      queryParts.push(`password = $${paramIndex}`);
      queryParams.push(newHash);
      paramIndex++;
    } else if (currentPassword || newPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới." });
    }

    if (queryParts.length === 0) {
      return res.status(400).json({ success: false, message: "Không có thông tin thay đổi." });
    }

    queryParams.push(req.user.id);
    const updateQuery = `
      UPDATE users 
      SET ${queryParts.join(", ")}, updated_at = NOW() 
      WHERE id = $${paramIndex} 
      RETURNING id, email, name, role
    `;

    const result = await pool.query(updateQuery, queryParams);
    
    // Tạo token mới chứa thông tin cập nhật (đặc biệt khi đổi tên hiển thị)
    const updatedUser = result.rows[0];
    const token = signToken(updatedUser);

    res.json({ 
      success: true, 
      message: "Cập nhật thông tin thành công.", 
      data: { token, user: updatedUser } 
    });
  } catch (err) {
    console.error("updateMe error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

module.exports = { register, login, getMe, updateMe };
