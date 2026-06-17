const pool = require("../config/db");

// API: Lấy danh sách khách sạn có bộ lọc, tìm kiếm và sắp xếp
// GET /api/hotels?search=...&sort=...&stars=...&filter=...
const getHotels = async (req, res) => {
  try {
    const { search = "", sort = "rating", stars, filter } = req.query;

    // Khởi tạo mảng điều kiện WHERE, mặc định chỉ lấy khách sạn đang hoạt động (is_active = TRUE)
    const conditions = ["h.is_active = TRUE"];
    const values = [];

    // Tìm kiếm gần đúng (ILIKE) theo tên khách sạn hoặc địa chỉ khu vực
    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`(h.name ILIKE $${values.length} OR h.location ILIKE $${values.length})`);
    }

    // Lọc theo số sao khách sạn (ví dụ: 3, 4, 5)
    if (stars && !isNaN(stars)) {
      values.push(Number(stars));
      conditions.push(`h.stars = $${values.length}`);
    }

    // Lọc theo danh mục bộ lọc đặc biệt đồng bộ từ Frontend
    if (filter) {
      if (filter === "5 sao") {
        conditions.push("h.stars = 5");
      } else if (filter === "4 sao") {
        conditions.push("h.stars = 4");
      } else if (filter === "3 sao") {
        conditions.push("h.stars = 3");
      } else if (filter === "Giá thấp nhất") {
        // Giá nhỏ hơn 1.604.000₫ (đồng bộ với Frontend HOTEL_FILTER_DEFAULTS.cheapPriceMax)
        conditions.push("h.price < 1604000");
      } else if (filter === "Đánh giá cao") {
        // Điểm đánh giá trung bình từ 4.6 trở lên (đồng bộ HOTEL_FILTER_DEFAULTS.highRatingMin)
        conditions.push("h.rating >= 4.6");
      } else if (filter === "Có hồ bơi") {
        // Tìm các khách sạn liên kết với tag 'Hồ bơi' trong bảng trung gian hotel_tags
        conditions.push("h.id IN (SELECT hotel_id FROM hotel_tags ht JOIN tags t ON t.id = ht.tag_id WHERE t.name ILIKE '%hồ bơi%')");
      }
    }

    const whereClause = conditions.join(" AND ");

    // Thiết lập câu lệnh ORDER BY động dựa trên tham số sắp xếp
    const orderBy =
      sort === "price-asc"  ? "h.price ASC" :                                                                    // Giá phòng tăng dần
      sort === "price-desc" ? "h.price DESC" :                                                                   // Giá phòng giảm dần
      sort === "rating"     ? "h.rating DESC" :                                                                  // Điểm đánh giá giảm dần
      sort === "promotion"  ? "(CAST(h.original_price - h.price AS NUMERIC) / NULLIF(h.original_price, 0)) DESC" : // % Giảm giá giảm dần
      "h.rating DESC";                                                                                           // Fallback mặc định theo đánh giá

    // Thực hiện truy vấn PostgreSQL: gom nhóm theo id khách sạn và kết hợp lấy danh sách tags dạng JSON
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

// API: Lấy danh sách 8 khách sạn nổi bật (đánh giá >= 4.5, sắp xếp theo đánh giá & số lượt reviews cao nhất)
// GET /api/hotels/featured
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

// API: Lấy chi tiết thông tin của 1 khách sạn theo ID
// GET /api/hotels/:id
const getHotelById = async (req, res) => {
  const { id } = req.params;
  // Kiểm tra ID có phải định dạng số hợp lệ hay không
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

    // Trả về lỗi 404 nếu không tìm thấy khách sạn
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
