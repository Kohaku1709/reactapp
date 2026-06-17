const jwt = require("jsonwebtoken");

/**
 * authMiddleware — Middleware kiểm tra đăng nhập bắt buộc
 * 1. Đọc JWT Token gửi lên từ header: "Authorization: Bearer <token>"
 * 2. Xác thực tính hợp lệ bằng jwt.verify và khóa bí mật JWT_SECRET
 * 3. Nếu thành công, gán thông tin user vào object req.user để các controller tiếp theo sử dụng
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Trả về lỗi 401 nếu thiếu Header Authorization hoặc sai cấu trúc Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Chưa đăng nhập. Vui lòng cung cấp token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Dữ liệu giải mã: { id, email, name, iat, exp }
    next();             // Chuyển sang middleware/controller tiếp theo
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token đã hết hạn. Vui lòng đăng nhập lại." });
    }
    return res.status(401).json({ success: false, message: "Token không hợp lệ." });
  }
};

/**
 * optionalAuth — Middleware kiểm tra đăng nhập không bắt buộc
 * - Thử giải mã token tương tự authMiddleware
 * - Nếu token không đúng/không có: vẫn cho phép truy cập tiếp dưới quyền Khách (Guest)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch {
      // Token không hợp lệ -> Bỏ qua, tiếp tục như khách vãng lai
    }
  }
  next();
};

module.exports = { authMiddleware, optionalAuth };
