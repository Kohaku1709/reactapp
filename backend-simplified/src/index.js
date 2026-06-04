require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes     = require("./routes/auth");
const hotelRoutes    = require("./routes/hotels");
const wishlistRoutes = require("./routes/wishlist");
const bookingRoutes  = require("./routes/bookings");
const contactRoutes  = require("./routes/contact");
const locationRoutes = require("./routes/locations");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:4173",
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ──────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "StayHTM API đang hoạt động 🚀" });
});

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/hotels",    hotelRoutes);
app.use("/api/wishlist",  wishlistRoutes);
app.use("/api/bookings",  bookingRoutes);
app.use("/api/contact",   contactRoutes);
app.use("/api/locations", locationRoutes);

// ─── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint không tồn tại." });
});

// ─── Xử lý lỗi chung ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Lỗi server:", err.message);
  res.status(500).json({ success: false, message: "Lỗi máy chủ." });
});

// ─── Khởi động ────────────────────────────────────────────────
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
