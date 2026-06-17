const { validationResult } = require("express-validator");
const pool = require("../config/db");

// API: Lấy danh sách lịch sử đặt phòng của người dùng hiện tại (yêu cầu đăng nhập)
// GET /api/bookings
const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        b.id, b.check_in, b.check_out, b.guests, b.rooms,
        b.total_price, b.status, b.note, b.created_at,
        h.id AS hotel_id, h.name AS hotel_name,
        h.location, h.image_url, h.stars, h.rating
       FROM bookings b
       JOIN hotels h ON h.id = b.hotel_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getMyBookings error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// API: Tạo đơn đặt phòng mới (yêu cầu đăng nhập)
// POST /api/bookings
const createBooking = async (req, res) => {
  // Trả về lỗi nếu tham số truyền vào thiếu/không hợp lệ
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { hotel_id, check_in, check_out, guests = 1, rooms = 1, note } = req.body;

  try {
    // 1. Kiểm tra sự tồn tại và tính hoạt động của khách sạn cần đặt
    const hotelRes = await pool.query(
      "SELECT id, price, is_active FROM hotels WHERE id=$1",
      [hotel_id]
    );
    if (hotelRes.rows.length === 0 || !hotelRes.rows[0].is_active) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khách sạn." });
    }

    const hotel = hotelRes.rows[0];
    const checkIn  = new Date(check_in);
    const checkOut = new Date(check_out);

    // Kiểm tra tính hợp lệ của thời gian nhận/trả phòng
    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: "Ngày trả phòng phải sau ngày nhận phòng." });
    }

    // 2. Tính số đêm thuê thực tế
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    // 3. Tính tổng số tiền đặt phòng = giá một phòng/đêm * số đêm * số phòng đặt
    const totalPrice = hotel.price * nights * rooms;

    // 4. Chèn thông tin đơn đặt phòng mới vào database. Vì người dùng đã thực hiện thanh toán thành công
    // ở giao diện Frontend, trạng thái ban đầu của hóa đơn sẽ tự động được gán là 'confirmed' (đã xác nhận)
    const result = await pool.query(
      `INSERT INTO bookings(user_id, hotel_id, check_in, check_out, guests, rooms, total_price, status, note)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, hotel_id, check_in, check_out, guests, rooms, totalPrice, 'confirmed', note || null]
    );

    res.status(201).json({
      success: true,
      message: "Đặt phòng thành công!",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// API: Lấy chi tiết của một đơn đặt phòng cụ thể theo ID (yêu cầu đăng nhập)
// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ." });
  }

  try {
    const result = await pool.query(
      `SELECT
        b.*,
        h.name AS hotel_name, h.location, h.image_url, h.stars, h.rating
       FROM bookings b
       JOIN hotels h ON h.id = b.hotel_id
       WHERE b.id = $1 AND b.user_id = $2`,
      [id, req.user.id]
    );

    // Trả về lỗi 404 nếu không tìm thấy đơn đặt phòng hoặc đơn không thuộc quyền sở hữu của user hiện tại
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getBookingById error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// API: Hủy đơn đặt phòng (yêu cầu đăng nhập)
// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ." });
  }

  try {
    // 1. Kiểm tra sự tồn tại của đơn đặt phòng
    const existing = await pool.query(
      "SELECT id, status FROM bookings WHERE id=$1 AND user_id=$2",
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
    }

    const booking = existing.rows[0];
    // Ngăn chặn các trạng thái không hợp lệ: đã hủy từ trước hoặc đơn đã hoàn thành lưu trú
    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Đơn này đã bị hủy trước đó." });
    }
    if (booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Không thể hủy đơn đã hoàn thành." });
    }

    // 2. Tiến hành cập nhật trạng thái đơn thành 'cancelled' (đã hủy)
    const result = await pool.query(
      "UPDATE bookings SET status='cancelled' WHERE id=$1 RETURNING *",
      [id]
    );

    res.json({ success: true, message: "Hủy đặt phòng thành công.", data: result.rows[0] });
  } catch (err) {
    console.error("cancelBooking error:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

module.exports = { getMyBookings, createBooking, getBookingById, cancelBooking };
