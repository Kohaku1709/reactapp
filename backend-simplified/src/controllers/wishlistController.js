const pool = require("../config/db");

// API: Lấy toàn bộ danh sách khách sạn yêu thích (wishlist) của người dùng hiện tại (yêu cầu đăng nhập)
// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    // Truy vấn danh sách khách sạn liên kết với bảng wishlist của user, kết nối thêm bảng tags để lấy các nhãn tiện ích
    const result = await pool.query(
      `SELECT
        h.id, h.name, h.location, h.rating, h.reviews,
        h.price, h.original_price, h.image_url, h.stars, h.badge,
        w.created_at AS wishlisted_at,
        COALESCE(JSON_AGG(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
       FROM wishlists w
       JOIN hotels h ON h.id = w.hotel_id
       LEFT JOIN hotel_tags ht ON ht.hotel_id = h.id
       LEFT JOIN tags t ON t.id = ht.tag_id
       WHERE w.user_id = $1 AND h.is_active = TRUE
       GROUP BY h.id, w.created_at
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
      wishlistIds: result.rows.map(r => r.id), // Mảng chứa riêng ID các khách sạn yêu thích (tiện so khớp ở Frontend)
    });
  } catch (err) {
    console.error("getWishlist error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// API: Bật/Tắt trạng thái yêu thích của khách sạn (yêu cầu đăng nhập)
// POST /api/wishlist/:hotelId/toggle
const toggleWishlist = async (req, res) => {
  const hotelId = parseInt(req.params.hotelId);
  if (isNaN(hotelId)) {
    return res.status(400).json({ success: false, message: "Hotel ID không hợp lệ." });
  }

  try {
    // 1. Kiểm tra xem khách sạn này đã tồn tại trong wishlist của user chưa
    const existing = await pool.query(
      "SELECT 1 FROM wishlists WHERE user_id=$1 AND hotel_id=$2",
      [req.user.id, hotelId]
    );

    if (existing.rows.length > 0) {
      // Đã tồn tại -> Tiến hành Xóa khỏi danh sách yêu thích
      await pool.query(
        "DELETE FROM wishlists WHERE user_id=$1 AND hotel_id=$2",
        [req.user.id, hotelId]
      );
      return res.json({ success: true, wishlisted: false, message: "Đã xóa khỏi yêu thích." });
    } else {
      // Chưa tồn tại -> Kiểm tra khách sạn có thực sự tồn tại trong DB trước khi thêm
      const hotel = await pool.query(
        "SELECT id FROM hotels WHERE id=$1 AND is_active=TRUE",
        [hotelId]
      );
      if (hotel.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy khách sạn." });
      }
      
      // Thêm mới liên kết yêu thích vào bảng wishlist
      await pool.query(
        "INSERT INTO wishlists(user_id, hotel_id) VALUES($1,$2)",
        [req.user.id, hotelId]
      );
      return res.status(201).json({ success: true, wishlisted: true, message: "Đã thêm vào yêu thích." });
    }
  } catch (err) {
    console.error("toggleWishlist error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// API: Xóa mục yêu thích trực tiếp theo ID (yêu cầu đăng nhập)
// DELETE /api/wishlist/:hotelId
const removeFromWishlist = async (req, res) => {
  const hotelId = parseInt(req.params.hotelId);
  if (isNaN(hotelId)) {
    return res.status(400).json({ success: false, message: "Hotel ID không hợp lệ." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM wishlists WHERE user_id=$1 AND hotel_id=$2",
      [req.user.id, hotelId]
    );

    // Báo lỗi nếu mục yêu thích không tồn tại để xóa
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy mục trong wishlist." });
    }

    res.json({ success: true, message: "Đã xóa khỏi danh sách yêu thích." });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

module.exports = { getWishlist, toggleWishlist, removeFromWishlist };
