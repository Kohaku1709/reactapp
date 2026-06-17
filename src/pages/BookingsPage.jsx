import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { bookingAPI } from "../services/api";

// Cấu hình các nhãn hiển thị trạng thái đơn đặt phòng tương ứng với mã màu CSS
const STATUS_LABEL = {
  pending:   { text: "Chờ xác nhận", color: "#f59e0b" },
  confirmed: { text: "Đã xác nhận",  color: "#10b981" },
  cancelled: { text: "Đã hủy",       color: "#ef4444" },
  completed: { text: "Hoàn thành",   color: "#6366f1" },
};

// Hàm định dạng hiển thị ngày tháng sang kiểu Việt Nam (DD/MM/YYYY)
const fmt = (d) => new Date(d).toLocaleDateString("vi-VN");
// Hàm định dạng hiển thị tiền tệ Việt Nam đồng
const fmtPrice = (p) => Number(p).toLocaleString("vi-VN") + "₫";

// Component Lịch sử Đặt phòng (Bookings Page)
export default function BookingsPage() {
  const { currentUser } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null); // Lưu trữ ID đơn đang gửi yêu cầu hủy lên server

  // Lấy lịch sử đặt phòng của user từ API sau khi mount component
  useEffect(() => {
    if (!currentUser) return;
    bookingAPI.getAll()
      .then((res) => { if (res.success) setBookings(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Điều hướng bảo vệ: Nếu chưa đăng nhập, tự động chuyển sang trang Login
  if (!currentUser) return <Navigate to="/login" replace />;

  // Xử lý gửi yêu cầu hủy đặt phòng lên backend
  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy đặt phòng này?")) return;
    setCancelling(id);
    const res = await bookingAPI.cancel(id);
    if (res.success) {
      // Cập nhật trạng thái trực tiếp trên State để tránh phải reload lại trang
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b)
      );
    } else {
      alert(res.message || "Hủy thất bại.");
    }
    setCancelling(null);
  };

  return (
    <div className="app page-with-header-offset">
      {/* Banner trang trí */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Đặt phòng của tôi</h1>
          <p className="page-hero-sub">Quản lý toàn bộ lịch sử đặt phòng của bạn</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner">
          {loading ? (
            <div className="loading-wrap"><div className="loading-spinner" /><p>Đang tải...</p></div>
          ) : bookings.length === 0 ? (
            // Khối hiển thị khi chưa có đơn đặt phòng nào
            <div className="wishlist-empty">
              <h2 className="section-title">Chưa có đặt phòng nào</h2>
              <p>Bạn chưa đặt phòng khách sạn nào.</p>
              <Link to="/hotels" className="search-btn" style={{ display: "inline-block", marginTop: "1rem" }}>
                Tìm khách sạn
              </Link>
            </div>
          ) : (
            // Danh sách các thẻ đặt phòng (booking cards)
            <div className="bookings-list">
              {bookings.map((b) => {
                const status = STATUS_LABEL[b.status] || { text: b.status, color: "#888" };
                // Tính số đêm lưu trú từ ngày nhận và ngày trả phòng
                const nights = Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / 86400000);
                return (
                  <div key={b.id} className="booking-card">
                    <img src={b.image_url} alt={b.hotel_name} className="booking-img" />
                    <div className="booking-info">
                      <div className="booking-header">
                        <h3 className="booking-hotel-name">{b.hotel_name}</h3>
                        {/* Nhãn hiển thị trạng thái với màu tương ứng */}
                        <span className="booking-status" style={{ color: status.color, borderColor: status.color }}>
                          {status.text}
                        </span>
                      </div>
                      <p className="booking-location">📍 {b.location}</p>
                      <p className="booking-dates">
                        📅 {fmt(b.check_in)} → {fmt(b.check_out)}
                        <span className="booking-nights"> ({nights} đêm)</span>
                      </p>
                      <p className="booking-meta">
                        👥 {b.guests} khách · 🛏 {b.rooms} phòng
                      </p>
                      <div className="booking-footer">
                        <span className="booking-total">{fmtPrice(b.total_price)}</span>
                        {/* Chỉ hiển thị nút Hủy đơn nếu trạng thái là pending (chờ xác nhận) hoặc confirmed (đã xác nhận) */}
                        {(b.status === "pending" || b.status === "confirmed") && (
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancel(b.id)}
                            disabled={cancelling === b.id}
                          >
                            {cancelling === b.id ? "Đang hủy..." : "Hủy đặt phòng"}
                          </button>
                        )}
                      </div>
                      {/* Hiển thị ghi chú của người dùng nếu có */}
                      {b.note && <p className="booking-note">📝 {b.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
