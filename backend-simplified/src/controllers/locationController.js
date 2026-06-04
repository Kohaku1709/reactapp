const pool = require("../config/db");

// GET /api/locations  — Lấy danh sách điểm đến (dùng cho HomePage)
const getLocations = async (req, res) => {
  try {
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
