require("dotenv").config(); // Nạp các biến môi trường từ tệp .env vào process.env
const express = require("express");
const cors    = require("cors");

// Nhập các router định nghĩa API
const authRoutes     = require("./routes/auth");
const hotelRoutes    = require("./routes/hotels");
const wishlistRoutes = require("./routes/wishlist");
const bookingRoutes  = require("./routes/bookings");
const contactRoutes  = require("./routes/contact");
const locationRoutes = require("./routes/locations");
const adminRoutes    = require("./routes/admin");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Cấu hình CORS (Cross-Origin Resource Sharing) ──────────────────────────────────
// Cho phép Frontend (chạy ở cổng 5173 hoặc 4173) gửi yêu cầu và cookie/token tới Backend
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:4173",
  ],
  credentials: true,
}));

// Middlewares xử lý phân tích dữ liệu JSON và URL-encoded gửi lên trong Body request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Route kiểm tra sức khỏe của server (Health check) ──────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "StayHTM API đang hoạt động 🚀" });
});

// ─── Khai báo định tuyến định dạng endpoint chính (Routes mounting) ──────────────────────
app.use("/api/auth",      authRoutes);     // Đường dẫn liên quan tới Đăng nhập/Đăng ký/Profile
app.use("/api/hotels",    hotelRoutes);    // Đường dẫn liên quan tới Khách sạn
app.use("/api/wishlist",  wishlistRoutes);  // Đường dẫn liên quan tới Yêu thích
app.use("/api/bookings",  bookingRoutes);  // Đường dẫn liên quan tới Đặt phòng
app.use("/api/contact",   contactRoutes);  // Đường dẫn gửi Liên hệ hỗ trợ
app.use("/api/locations", locationRoutes); // Đường dẫn lấy danh sách điểm đến phổ biến
app.use("/api/admin",     adminRoutes);    // Đường dẫn quản lý admin (cần quyền admin)

// ─── Middleware xử lý 404 Not Found (Endpoint không tồn tại) ──────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint không tồn tại." });
});

// ─── Middleware xử lý lỗi tập trung (Global error handler) ──────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Lỗi server:", err.message);
  res.status(500).json({ success: false, message: "Lỗi máy chủ." });
});

// ─── Khởi chạy Express server lắng nghe các kết nối trên cổng PORT ──────────────────────
app.listen(PORT, () => {
  console.log(`\n🏨  StayHTM Backend  →  http://localhost:${PORT}`);
  console.log(`\n📋  Các endpoint:`);
  console.log(`    POST  /api/auth/register`);
  console.log(`    POST  /api/auth/login`);
  console.log(`    GET   /api/hotels`);
  console.log(`    GET   /api/hotels/featured`);
  console.log(`    GET   /api/wishlist      (cần token)`);
  console.log(`    POST  /api/bookings      (cần token)`);
  console.log(`    POST  /api/contact\n`);
});
