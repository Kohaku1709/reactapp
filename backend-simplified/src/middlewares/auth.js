const jwt = require("jsonwebtoken");

/**
 * authMiddleware — Xác thực JWT từ header Authorization: Bearer <token>
 * Gán req.user = { id, email, name } nếu hợp lệ.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Chưa đăng nhập. Vui lòng cung cấp token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, name, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token đã hết hạn. Vui lòng đăng nhập lại." });
    }
    return res.status(401).json({ success: false, message: "Token không hợp lệ." });
  }
};

/**
 * optionalAuth — Không bắt buộc đăng nhập; gán req.user nếu token hợp lệ.
 * Dùng cho các route public nhưng có hành vi khác nhau khi đã login.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch {
      // Token không hợp lệ -> bỏ qua, tiếp tục như guest
    }
  }
  next();
};

module.exports = { authMiddleware, optionalAuth };
