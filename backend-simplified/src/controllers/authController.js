const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const pool = require("../config/db");
const nodemailer = require("nodemailer");

// Tạo transporter gửi email
const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT == "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

// Hàm gửi email chứa mã xác nhận khôi phục mật khẩu
const sendResetEmail = async (email, otp) => {
  const transporter = createTransporter();
  const subject = "StayHTM - Mã xác nhận đặt lại mật khẩu";
  const textContent = `Chào bạn,\n\nMã xác nhận đặt lại mật khẩu của bạn là: ${otp}\n\nMã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nStayHTM Team.`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1B365D; text-align: center;">Khôi phục mật khẩu StayHTM</h2>
      <p>Chào bạn,</p>
      <p>Bạn đã gửi yêu cầu đặt lại mật khẩu tại StayHTM. Dưới đây là mã xác nhận của bạn:</p>
      <div style="background-color: #f4f6f8; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2E5B88;">${otp}</span>
      </div>
      <p style="color: #666; font-size: 13px;">Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai để đảm bảo an toàn.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không trả lời email này.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"StayHTM Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent
      });
      console.log(`[EMAIL SENT] Mã xác nhận đã gửi thực tế tới email ${email} qua SMTP.`);
    } catch (err) {
      console.error("[SMTP ERROR] Gửi email thất bại, tự động in ra console:", err.message);
      printConsoleFallback(email, otp);
    }
  } else {
    printConsoleFallback(email, otp);
  }
};

const printConsoleFallback = (email, otp) => {
  console.log(`\n========================================================================`);
  console.log(`[RESET PASSWORD OTP] Mã xác nhận khôi phục mật khẩu giả lập:`);
  console.log(`- Email nhận: ${email}`);
  console.log(`- Mã xác nhận (OTP): ${otp}`);
  console.log(`Vui lòng cấu hình SMTP_USER và SMTP_PASS trong file .env để gửi email thực tế.`);
  console.log(`========================================================================\n`);
};

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

// API: Đăng nhập & đăng ký bằng Google OAuth
// POST /api/auth/google
const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, message: "Thiếu credential token từ Google." });
  }

  try {
    // 1. Xác thực ID Token qua endpoint công khai của Google
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!googleRes.ok) {
      return res.status(401).json({ success: false, message: "Token Google không hợp lệ hoặc đã hết hạn." });
    }

    const payload = await googleRes.json();
    const { email, name, sub: google_id, picture: avatar_url } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: "Không lấy được Email từ tài khoản Google." });
    }

    // 2. Kiểm tra user trong DB
    let userRes = await pool.query("SELECT id, email, name, role, is_active, google_id FROM users WHERE email=$1", [email.toLowerCase()]);
    let user;

    if (userRes.rows.length > 0) {
      user = userRes.rows[0];
      if (!user.is_active) {
        return res.status(403).json({ success: false, message: "Tài khoản này đã bị khóa." });
      }
      // Nếu đã có tài khoản bằng email nhưng chưa liên kết google_id
      if (!user.google_id) {
        await pool.query("UPDATE users SET google_id=$1, avatar_url=COALESCE(avatar_url, $2) WHERE id=$3", [google_id, avatar_url, user.id]);
        user.google_id = google_id;
      }
    } else {
      // 3. Tạo tài khoản mới cho user Google
      const insertRes = await pool.query(
        "INSERT INTO users(email, password, name, google_id, avatar_url, role) VALUES($1, NULL, $2, $3, $4, $5) RETURNING id, email, name, role",
        [email.toLowerCase(), name, google_id, avatar_url, "user"]
      );
      user = insertRes.rows[0];
    }

    // 4. Ký mã JWT Token
    const token = signToken(user);
    res.json({
      success: true,
      message: "Đăng nhập bằng Google thành công!",
      data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
    });
  } catch (err) {
    console.error("googleLogin error:", err);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng nhập Google." });
  }
};

// API: Yêu cầu mã xác nhận khôi phục mật khẩu qua Email
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập Email." });
  }

  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email=$1", [email.toLowerCase()]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản với email này." });
    }

    // Sinh mã xác nhận 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hạn 5 phút

    // Cập nhật OTP vào database
    await pool.query(
      "UPDATE users SET reset_otp=$1, reset_otp_expires_at=$2 WHERE email=$3",
      [otp, expiresAt, email.toLowerCase()]
    );

    // Gửi email chứa mã xác nhận
    await sendResetEmail(email.toLowerCase(), otp);

    res.json({
      success: true,
      message: "Mã xác nhận đã được gửi về email của bạn."
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi gửi mã xác nhận." });
  }
};

// API: Đặt lại mật khẩu mới bằng mã xác nhận
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin yêu cầu." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Mật khẩu mới phải từ 6 ký tự trở lên." });
  }

  try {
    const userRes = await pool.query(
      "SELECT id, reset_otp, reset_otp_expires_at FROM users WHERE email=$1",
      [email.toLowerCase()]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Email không tồn tại." });
    }

    const user = userRes.rows[0];
    if (!user.reset_otp || user.reset_otp !== otp) {
      return res.status(400).json({ success: false, message: "Mã xác nhận không chính xác." });
    }

    const now = new Date();
    if (new Date(user.reset_otp_expires_at) < now) {
      return res.status(400).json({ success: false, message: "Mã xác nhận đã hết hạn (quá 5 phút)." });
    }

    // Mã hóa mật khẩu mới
    const hash = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và xóa OTP
    await pool.query(
      "UPDATE users SET password=$1, reset_otp=NULL, reset_otp_expires_at=NULL WHERE id=$2",
      [hash, user.id]
    );

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới."
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đặt lại mật khẩu." });
  }
};

module.exports = { register, login, getMe, updateMe, googleLogin, forgotPassword, resetPassword };
