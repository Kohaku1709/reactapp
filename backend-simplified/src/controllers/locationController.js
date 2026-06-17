const pool = require("../config/db");

// API: Lấy danh sách toàn bộ các địa điểm du lịch phổ biến (dùng hiển thị trên trang chủ)
// GET /api/locations
const getLocations = async (req, res) => {
  try {
    // Truy vấn danh sách điểm đến và sắp xếp theo số lượng khách sạn giảm dần
    const result = await pool.query(
      "SELECT id, name, slug, hotel_count, img_url FROM locations ORDER BY hotel_count DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getLocations error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

module.exports = { getLocations };
