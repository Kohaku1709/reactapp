const pool = require("../config/db");

/**
 * ─── LẤY DANH SÁCH ĐƠN ĐẶT PHÒNG (BOOKINGS) ──────────────────────────────────
 * Lấy toàn bộ danh sách đơn đặt phòng trong hệ thống kèm thông tin khách hàng & khách sạn
 */
const getBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.check_in, b.check_out, b.guests, b.rooms, b.total_price, b.status, b.note, b.created_at,
              u.name AS user_name, u.email AS user_email,
              h.name AS hotel_name, h.location AS hotel_location, h.image_url AS hotel_image
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN hotels h ON h.id = b.hotel_id
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("admin getBookings error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách đơn đặt." });
  }
};

/**
 * ─── CẬP NHẬT TRẠNG THÁI ĐƠN ĐẶT PHÒNG ─────────────────────────────────────
 * Cho phép Admin xác nhận, hủy hoặc hoàn thành đơn đặt phòng
 */
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Kiểm tra tính hợp lệ của trạng thái mới gửi lên
  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
  }

  try {
    const result = await pool.query(
      "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
    }
    res.json({ success: true, message: "Cập nhật trạng thái thành công.", data: result.rows[0] });
  } catch (err) {
    console.error("admin updateBookingStatus error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật đơn hàng." });
  }
};

/**
 * ─── LẤY DANH SÁCH TIN NHẮN LIÊN HỆ (CONTACTS) ────────────────────────────────
 */
const getContacts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, subject, message, is_read, created_at FROM contact_messages ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("admin getContacts error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy tin nhắn." });
  }
};

/**
 * ─── ĐÁNH DẤU TIN NHẮN ĐÃ ĐỌC ────────────────────────────────────────────────
 */
const markContactRead = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE contact_messages SET is_read = TRUE WHERE id = $1 RETURNING id, is_read",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin nhắn." });
    }
    res.json({ success: true, message: "Đã đánh dấu tin nhắn là đã đọc.", data: result.rows[0] });
  } catch (err) {
    console.error("admin markContactRead error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật trạng thái đọc." });
  }
};

/**
 * ─── THÊM KHÁCH SẠN MỚI ────────────────────────────────────────────────────
 */
const createHotel = async (req, res) => {
  const { name, location, rating, reviews, price, original_price, image_url, stars, badge, tags } = req.body;
  
  if (!name || !location || !price) {
    return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ tên khách sạn, địa chỉ và giá phòng." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Bắt đầu PostgreSQL Transaction
    
    // 1. Phân tích địa chỉ để tự động lấy location_id từ các điểm đến có sẵn trong DB
    const locRows = (await client.query("SELECT id, name FROM locations")).rows;
    let location_id = null;
    for (const r of locRows) {
      if (location.includes(r.name)) {
        location_id = r.id;
        break;
      }
    }

    // 2. Chèn thông tin khách sạn mới vào bảng hotels
    const hotelRes = await client.query(
      `INSERT INTO hotels (name, location, location_id, rating, reviews, price, original_price, image_url, stars, badge, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
       RETURNING id, name, location, rating, reviews, price, original_price, image_url, stars, badge`,
      [
        name.trim(),
        location.trim(),
        location_id,
        rating || 5.0,
        reviews || 0,
        price,
        original_price || price,
        image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
        stars || 5,
        badge || null
      ]
    );
    const hotelId = hotelRes.rows[0].id;

    // 3. Xử lý thêm các tag tiện ích và thiết lập liên kết Many-to-Many
    const insertedTags = [];
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        if (!tagName.trim()) continue;
        // Thực hiện câu lệnh INSERT tag, nếu trùng thì trả về tag đã có sẵn
        const tagRes = await client.query(
          "INSERT INTO tags(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id, name",
          [tagName.trim()]
        );
        const t = tagRes.rows[0];
        insertedTags.push(t.name);

        // Liên kết khách sạn với tag này
        await client.query(
          "INSERT INTO hotel_tags (hotel_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [hotelId, t.id]
        );
      }
    }

    await client.query("COMMIT"); // Xác nhận hoàn tất Transaction
    res.status(201).json({
      success: true,
      message: "Tạo khách sạn mới thành công.",
      data: { ...hotelRes.rows[0], tags: insertedTags }
    });
  } catch (err) {
    await client.query("ROLLBACK"); // Quay lui dữ liệu nếu có lỗi xảy ra
    console.error("admin createHotel error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm khách sạn." });
  } finally {
    client.release();
  }
};

/**
 * ─── CẬP NHẬT THÔNG TIN KHÁCH SẠN ──────────────────────────────────────────
 */
const updateHotel = async (req, res) => {
  const { id } = req.params;
  const { name, location, rating, reviews, price, original_price, image_url, stars, badge, tags, is_active } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "ID khách sạn không hợp lệ." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Phân tích địa chỉ cập nhật location_id
    const locRows = (await client.query("SELECT id, name FROM locations")).rows;
    let location_id = null;
    if (location) {
      for (const r of locRows) {
        if (location.includes(r.name)) {
          location_id = r.id;
          break;
        }
      }
    }

    // 2. Cập nhật thông tin chi tiết động vào DB
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name.trim()); }
    if (location !== undefined) { 
      fields.push(`location = $${idx++}`); values.push(location.trim()); 
      fields.push(`location_id = $${idx++}`); values.push(location_id);
    }
    if (rating !== undefined) { fields.push(`rating = $${idx++}`); values.push(rating); }
    if (reviews !== undefined) { fields.push(`reviews = $${idx++}`); values.push(reviews); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    if (original_price !== undefined) { fields.push(`original_price = $${idx++}`); values.push(original_price); }
    if (image_url !== undefined) { fields.push(`image_url = $${idx++}`); values.push(image_url); }
    if (stars !== undefined) { fields.push(`stars = $${idx++}`); values.push(stars); }
    if (badge !== undefined) { fields.push(`badge = $${idx++}`); values.push(badge); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE hotels SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx}`,
        values
      );
    }

    // 3. Xử lý đồng bộ các tag tiện ích (xóa mối liên kết cũ và chèn liên kết mới)
    const insertedTags = [];
    if (tags !== undefined && Array.isArray(tags)) {
      await client.query("DELETE FROM hotel_tags WHERE hotel_id = $1", [id]);
      for (const tagName of tags) {
        if (!tagName.trim()) continue;
        const tagRes = await client.query(
          "INSERT INTO tags(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id, name",
          [tagName.trim()]
        );
        const t = tagRes.rows[0];
        insertedTags.push(t.name);
        await client.query(
          "INSERT INTO hotel_tags (hotel_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [id, t.id]
        );
      }
    } else {
      // Nếu không gửi mảng tags lên, giữ nguyên danh sách tag cũ
      const oldTags = await client.query(
        "SELECT t.name FROM tags t JOIN hotel_tags ht ON ht.tag_id = t.id WHERE ht.hotel_id = $1",
        [id]
      );
      insertedTags.push(...oldTags.rows.map(r => r.name));
    }

    // 4. Truy vấn lại thông tin đầy đủ sau cập nhật
    const hotelRes = await client.query("SELECT * FROM hotels WHERE id = $1", [id]);

    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Cập nhật khách sạn thành công.",
      data: { ...hotelRes.rows[0], tags: insertedTags }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("admin updateHotel error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật khách sạn." });
  } finally {
    client.release();
  }
};

/**
 * ─── XÓA KHÁCH SẠN ────────────────────────────────────────────────────────
 */
const deleteHotel = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ." });
  }
  try {
    // Cascade DELETE đã cấu hình ở database sẽ tự động xóa các bảng hotel_tags, wishlists, bookings liên quan
    const result = await pool.query("DELETE FROM hotels WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khách sạn để xóa." });
    }
    res.json({ success: true, message: "Xóa khách sạn thành công." });
  } catch (err) {
    console.error("admin deleteHotel error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa khách sạn." });
  }
};

module.exports = {
  getBookings,
  updateBookingStatus,
  getContacts,
  markContactRead,
  createHotel,
  updateHotel,
  deleteHotel
};
