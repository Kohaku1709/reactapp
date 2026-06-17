const { validationResult } = require("express-validator");
const pool = require("../config/db");

// API: Gửi thông tin liên hệ / tin nhắn góp ý của khách hàng
// POST /api/contact
const sendContact = async (req, res) => {
  // Trả về lỗi nếu định dạng nhập liệu không khớp validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, subject, message } = req.body;

  try {
    // Chèn tin nhắn liên hệ mới vào bảng contact_messages trong DB
    await pool.query(
      "INSERT INTO contact_messages(name, email, subject, message) VALUES($1,$2,$3,$4)",
      [name.trim(), email.toLowerCase().trim(), subject?.trim() || null, message.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.",
    });
  } catch (err) {
    console.error("sendContact error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

module.exports = { sendContact };
