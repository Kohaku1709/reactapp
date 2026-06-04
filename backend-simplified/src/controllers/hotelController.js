const pool = require("../config/db");

// GET /api/hotels?search=...&sort=...&stars=...
const getHotels = async (req, res) => {
  try {
    const { search = "", sort = "rating", stars } = req.query;

    // Xây dựng điều kiện WHERE
    const conditions = ["h.is_active = TRUE"];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`(h.name ILIKE $${values.length} OR h.location ILIKE $${values.length})`);
    }

    if (stars && !isNaN(stars)) {
      values.push(Number(stars));
      conditions.push(`h.stars = $${values.length}`);
    }

    const whereClause = conditions.join(" AND ");

    // Sắp xếp
    const orderBy =
      sort === "price-asc"  ? "h.price ASC" :
      sort === "price-desc" ? "h.price DESC" :
      "h.rating DESC";

    const result = await pool.query(
      `SELECT
        h.id, h.name, h.location, h.rating, h.reviews,
        h.price, h.original_price, h.image_url, h.stars, h.badge,
        COALESCE(JSON_AGG(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
       FROM hotels h
       LEFT JOIN hotel_tags ht ON ht.hotel_id = h.id
       LEFT JOIN tags t ON t.id = ht.tag_id
       WHERE ${whereClause}
       GROUP BY h.id
       ORDER BY ${orderBy}
       LIMIT 100`,
      values
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getHotels error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// GET /api/hotels/featured — top 8 khách sạn nổi bật
const getFeaturedHotels = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        h.id, h.name, h.location, h.rating, h.reviews,
        h.price, h.original_price, h.image_url, h.stars, h.badge,
        COALESCE(JSON_AGG(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
       FROM hotels h
       LEFT JOIN hotel_tags ht ON ht.hotel_id = h.id
       LEFT JOIN tags t ON t.id = ht.tag_id
       WHERE h.is_active = TRUE AND h.rating >= 4.5
       GROUP BY h.id
       ORDER BY h.rating DESC, h.reviews DESC
       LIMIT 8`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getFeaturedHotels error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// GET /api/hotels/:id — chi tiết một khách sạn
const getHotelById = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ." });
  }

  try {
    const result = await pool.query(
      `SELECT
        h.*,
        COALESCE(JSON_AGG(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
       FROM hotels h
       LEFT JOIN hotel_tags ht ON ht.hotel_id = h.id
       LEFT JOIN tags t ON t.id = ht.tag_id
       WHERE h.id = $1 AND h.is_active = TRUE
       GROUP BY h.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khách sạn." });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getHotelById error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

module.exports = { getHotels, getHotelById, getFeaturedHotels };
