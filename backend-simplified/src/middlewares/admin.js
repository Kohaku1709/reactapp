/**
 * adminMiddleware — Middleware kiểm tra quyền quản trị viên
 * 1. Yêu cầu request đã đi qua authMiddleware trước đó (để có req.user)
 * 2. So sánh req.user.role có bằng 'admin' hay không
 * 3. Nếu là admin thì cho phép đi tiếp (next), ngược lại trả về lỗi 403 Forbidden
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Chưa xác thực người dùng." });
  }

  // Kiểm tra vai trò của người dùng trong token đã giải mã
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Quyền truy cập bị từ chối. Chỉ dành cho quản trị viên." });
  }

  next();
};

module.exports = adminMiddleware;
