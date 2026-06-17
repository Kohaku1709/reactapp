import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { adminAPI, hotelAPI } from "../services/api";

export default function AdminDashboardPage() {
  const { currentUser } = useUser();

  // State quản lý Tab hoạt động ("hotels", "bookings", "contacts")
  const [activeTab, setActiveTab] = useState("hotels");

  // State quản lý danh sách dữ liệu
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);

  // State tải dữ liệu
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // Dùng báo thành công/thất bại

  // State cho Form CRUD Khách sạn (Thêm / Sửa)
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null); // null = Thêm mới, object = Đang sửa
  const [hotelForm, setHotelForm] = useState({
    name: "",
    location: "",
    price: "",
    original_price: "",
    rating: "4.5",
    reviews: "10",
    stars: "5",
    badge: "",
    image_url: "",
    tagsInput: "" // Dạng chuỗi phân tách bởi dấu phẩy, VD: "Hồ bơi, Spa, View biển"
  });

  // State tìm kiếm trong bảng khách sạn và lọc booking
  const [hotelSearch, setHotelSearch] = useState("");
  const [bookingFilterStatus, setBookingFilterStatus] = useState("all");

  // Định nghĩa hàm tải dữ liệu bằng useCallback để tránh render vòng lặp
  const loadTabData = useCallback(async () => {
    // Trì hoãn việc cập nhật state để tránh lỗi đặt state đồng bộ trong effect
    await Promise.resolve();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      if (activeTab === "hotels") {
        const res = await hotelAPI.getAll({ limit: 200 }); // Lấy toàn bộ danh sách khách sạn
        if (res.success) setHotels(res.data);
      } else if (activeTab === "bookings") {
        const res = await adminAPI.getBookings(); // Lấy đơn đặt phòng từ API admin
        if (res.success) setBookings(res.data);
      } else if (activeTab === "contacts") {
        const res = await adminAPI.getContacts(); // Lấy tin nhắn liên hệ từ API admin
        if (res.success) setContacts(res.data);
      }
    } catch {
      setMessage({ text: "Lỗi khi tải dữ liệu từ máy chủ.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Tải dữ liệu tùy thuộc vào Tab đang hoạt động
  useEffect(() => {
    Promise.resolve().then(() => {
      loadTabData();
    });
  }, [loadTabData]);

  // Bảo vệ phân quyền: Chỉ cho phép tài khoản đăng nhập có quyền admin truy cập
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== "admin") {
    return (
      <div className="app page-with-header-offset" style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <h2 style={{ color: "#d32f2f" }}>⚠️ Truy cập bị từ chối</h2>
        <p style={{ marginTop: "1rem" }}>Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  // ─── XỬ LÝ CRUD KHÁCH SẠN ──────────────────────────────────────────────────
  
  // Mở Form thêm mới khách sạn
  const handleOpenAddForm = () => {
    setEditingHotel(null);
    setHotelForm({
      name: "",
      location: "",
      price: "",
      original_price: "",
      rating: "4.5",
      reviews: "10",
      stars: "5",
      badge: "",
      image_url: "",
      tagsInput: "Hồ bơi, Spa, Bữa sáng miễn phí, Wifi tốc độ cao"
    });
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Mở Form sửa thông tin khách sạn
  const handleOpenEditForm = (hotel) => {
    setEditingHotel(hotel);
    setHotelForm({
      name: hotel.name || "",
      location: hotel.location || "",
      price: hotel.price || "",
      original_price: hotel.original_price || "",
      rating: hotel.rating || "4.5",
      reviews: hotel.reviews || "10",
      stars: hotel.stars || "5",
      badge: hotel.badge || "",
      image_url: hotel.image_url || "",
      tagsInput: Array.isArray(hotel.tags) ? hotel.tags.join(", ") : ""
    });
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Xử lý gửi Form (Thêm hoặc Cập nhật)
  const handleSaveHotel = async (e) => {
    e.preventDefault();
    if (!hotelForm.name.trim() || !hotelForm.location.trim() || !hotelForm.price) {
      setMessage({ text: "Vui lòng điền đầy đủ Tên, Địa chỉ và Giá phòng.", type: "error" });
      return;
    }

    const payload = {
      ...hotelForm,
      price: Number(hotelForm.price),
      original_price: hotelForm.original_price ? Number(hotelForm.original_price) : Number(hotelForm.price),
      rating: Number(hotelForm.rating),
      reviews: Number(hotelForm.reviews),
      stars: Number(hotelForm.stars),
      tags: hotelForm.tagsInput.split(",").map(t => t.trim()).filter(Boolean)
    };

    try {
      let res;
      if (editingHotel) {
        // Cập nhật khách sạn hiện có
        res = await adminAPI.updateHotel(editingHotel.id, payload);
      } else {
        // Tạo khách sạn mới
        res = await adminAPI.createHotel(payload);
      }

      if (res.success) {
        setMessage({
          text: editingHotel ? "Cập nhật khách sạn thành công!" : "Thêm khách sạn mới thành công!",
          type: "success"
        });
        setShowForm(false);
        setEditingHotel(null);
        loadTabData(); // Tải lại danh sách
      } else {
        setMessage({ text: res.message || "Không thể lưu khách sạn.", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối máy chủ.", type: "error" });
    }
  };

  // Xóa khách sạn
  const handleDeleteHotel = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách sạn này không? Điều này sẽ xóa tất cả các đặt phòng liên quan.")) return;
    try {
      const res = await adminAPI.deleteHotel(id);
      if (res.success) {
        setMessage({ text: "Đã xóa khách sạn thành công!", type: "success" });
        loadTabData();
      } else {
        setMessage({ text: res.message || "Xóa thất bại.", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối máy chủ.", type: "error" });
    }
  };

  // ─── XỬ LÝ ĐƠN ĐẶT PHÒNG ────────────────────────────────────────────────────
  
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const res = await adminAPI.updateBookingStatus(bookingId, status);
      if (res.success) {
        setMessage({ text: "Cập nhật trạng thái đơn đặt thành công!", type: "success" });
        // Cập nhật nhanh trên UI thay vì tải lại toàn bộ
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      } else {
        setMessage({ text: res.message || "Cập nhật trạng thái thất bại.", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối máy chủ.", type: "error" });
    }
  };

  // ─── XỬ LÝ TIN NHẮN LIÊN HỆ ─────────────────────────────────────────────────
  
  const handleMarkContactRead = async (id) => {
    try {
      const res = await adminAPI.markContactRead(id);
      if (res.success) {
        setMessage({ text: "Đã đánh dấu đã đọc tin nhắn liên hệ.", type: "success" });
        setContacts(prev => prev.map(c => c.id === id ? { ...c, is_read: true } : c));
      }
    } catch {
      setMessage({ text: "Lỗi kết nối máy chủ.", type: "error" });
    }
  };

  // Lọc danh sách khách sạn theo từ khóa tìm kiếm
  const filteredHotels = hotels.filter(h =>
    h.name.toLowerCase().includes(hotelSearch.toLowerCase()) ||
    h.location.toLowerCase().includes(hotelSearch.toLowerCase())
  );

  // Lọc danh sách đơn đặt theo trạng thái chọn lọc
  const filteredBookings = bookings.filter(b =>
    bookingFilterStatus === "all" ? true : b.status === bookingFilterStatus
  );

  return (
    <div className="app page-with-header-offset">
      {/* Banner đầu trang */}
      <div className="page-hero" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Quản trị Admin</h1>
          <p className="page-hero-sub">Hệ thống quản lý khách sạn, đơn đặt phòng và hỗ trợ khách hàng StayHTM</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          
          {/* Thông báo Alert */}
          {message.text && (
            <div style={{
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              fontWeight: 500,
              background: message.type === "success" ? "#e8f5e9" : "#ffebee",
              color: message.type === "success" ? "#2e7d32" : "#d32f2f",
              border: `1px solid ${message.type === "success" ? "#a5d6a7" : "#ef9a9a"}`
            }}>
              {message.type === "success" ? "✅ " : "❌ "} {message.text}
            </div>
          )}

          {/* Thanh chuyển đổi Tab quản trị */}
          <div className="tabs-navigation" style={{ display: "flex", gap: "10px", borderBottom: "2px solid #e2e8f0", paddingBottom: "1px", marginBottom: "2rem" }}>
            <button
              onClick={() => { setActiveTab("hotels"); setShowForm(false); }}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "none",
                fontWeight: 600,
                fontSize: "1rem",
                color: activeTab === "hotels" ? "var(--primary)" : "#64748b",
                borderBottom: activeTab === "hotels" ? "3px solid var(--primary)" : "3px solid transparent",
                cursor: "pointer"
              }}
            >
              🏨 Quản lý khách sạn ({hotels.length})
            </button>
            <button
              onClick={() => { setActiveTab("bookings"); setShowForm(false); }}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "none",
                fontWeight: 600,
                fontSize: "1rem",
                color: activeTab === "bookings" ? "var(--primary)" : "#64748b",
                borderBottom: activeTab === "bookings" ? "3px solid var(--primary)" : "3px solid transparent",
                cursor: "pointer"
              }}
            >
              📅 Đơn đặt phòng ({bookings.length})
            </button>
            <button
              onClick={() => { setActiveTab("contacts"); setShowForm(false); }}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "none",
                fontWeight: 600,
                fontSize: "1rem",
                color: activeTab === "contacts" ? "var(--primary)" : "#64748b",
                borderBottom: activeTab === "contacts" ? "3px solid var(--primary)" : "3px solid transparent",
                cursor: "pointer"
              }}
            >
              ✉️ Tin nhắn liên hệ ({contacts.filter(c => !c.is_read).length} chưa đọc)
            </button>
          </div>

          {/* HIỂN THỊ TRẠNG THÁI LOADING */}
          {loading && <div style={{ textAlign: "center", padding: "3rem" }}><div className="loading-spinner" style={{ margin: "0 auto" }} /><p style={{ marginTop: "1rem" }}>Đang tải dữ liệu...</p></div>}

          {!loading && (
            <>
              {/* TAB 1: QUẢN LÝ KHÁCH SẠN */}
              {activeTab === "hotels" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                    {/* Thanh tìm kiếm khách sạn */}
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tìm kiếm theo tên hoặc khu vực khách sạn..."
                      value={hotelSearch}
                      onChange={(e) => setHotelSearch(e.target.value)}
                      style={{ maxWidth: "400px" }}
                    />
                    
                    {/* Nút thêm khách sạn */}
                    <button onClick={handleOpenAddForm} className="search-btn" style={{ padding: "10px 20px" }}>
                      ➕ Thêm khách sạn mới
                    </button>
                  </div>

                  {/* Form Thêm/Sửa Khách Sạn */}
                  {showForm && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2rem", borderRadius: "12px", marginBottom: "2rem" }}>
                      <h3 style={{ marginBottom: "1.5rem", fontWeight: 600 }}>
                        {editingHotel ? `✏️ Cập nhật khách sạn: ${editingHotel.name}` : "➕ Thêm khách sạn mới"}
                      </h3>
                      <form onSubmit={handleSaveHotel} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label className="form-label">Tên khách sạn <span style={{ color: "red" }}>*</span></label>
                          <input type="text" className="form-input" required value={hotelForm.name} onChange={e => setHotelForm({...hotelForm, name: e.target.value})} placeholder="VD: Khách sạn Mường Thanh Hà Nội" />
                        </div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label className="form-label">Địa chỉ chi tiết (nhớ ghi rõ Thành phố giống list địa điểm để hệ thống map) <span style={{ color: "red" }}>*</span></label>
                          <input type="text" className="form-input" required value={hotelForm.location} onChange={e => setHotelForm({...hotelForm, location: e.target.value})} placeholder="VD: Tây Hồ, Hà Nội" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Giá phòng mỗi đêm (VND) <span style={{ color: "red" }}>*</span></label>
                          <input type="number" className="form-input" required value={hotelForm.price} onChange={e => setHotelForm({...hotelForm, price: e.target.value})} placeholder="VD: 1500000" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Giá phòng gốc (chưa giảm) (VND)</label>
                          <input type="number" className="form-input" value={hotelForm.original_price} onChange={e => setHotelForm({...hotelForm, original_price: e.target.value})} placeholder="VD: 2000000" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Số sao (1 - 5)</label>
                          <select className="form-input" value={hotelForm.stars} onChange={e => setHotelForm({...hotelForm, stars: e.target.value})}>
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="2">2 sao</option>
                            <option value="1">1 sao</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Điểm đánh giá (0.0 - 5.0)</label>
                          <input type="number" step="0.1" min="0" max="5" className="form-input" value={hotelForm.rating} onChange={e => setHotelForm({...hotelForm, rating: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Số lượt reviews đánh giá</label>
                          <input type="number" className="form-input" value={hotelForm.reviews} onChange={e => setHotelForm({...hotelForm, reviews: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nhãn nổi bật (Badge)</label>
                          <input type="text" className="form-input" value={hotelForm.badge} onChange={e => setHotelForm({...hotelForm, badge: e.target.value})} placeholder="VD: Bán chạy, Giá tốt..." />
                        </div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label className="form-label">Đường dẫn ảnh trực tuyến (Image URL)</label>
                          <input type="text" className="form-input" value={hotelForm.image_url} onChange={e => setHotelForm({...hotelForm, image_url: e.target.value})} placeholder="https://..." />
                        </div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label className="form-label">Tiện ích (Các tag, cách nhau bởi dấu phẩy)</label>
                          <input type="text" className="form-input" value={hotelForm.tagsInput} onChange={e => setHotelForm({...hotelForm, tagsInput: e.target.value})} placeholder="Hồ bơi, Spa, View biển, Lễ tân 24/7" />
                        </div>

                        <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", marginTop: "1rem" }}>
                          <button type="submit" className="search-btn" style={{ padding: "10px 30px" }}>Lưu dữ liệu</button>
                          <button type="button" onClick={() => setShowForm(false)} className="search-btn outlined" style={{ padding: "10px 30px" }}>Hủy bỏ</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Bảng Danh sách Khách Sạn */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                      <thead>
                        <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                          <th style={{ padding: "12px" }}>Ảnh</th>
                          <th style={{ padding: "12px" }}>Tên khách sạn</th>
                          <th style={{ padding: "12px" }}>Địa chỉ</th>
                          <th style={{ padding: "12px" }}>Sao</th>
                          <th style={{ padding: "12px" }}>Giá</th>
                          <th style={{ padding: "12px" }}>Tiện ích</th>
                          <th style={{ padding: "12px", textAlign: "center" }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHotels.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                              Không tìm thấy khách sạn nào phù hợp.
                            </td>
                          </tr>
                        ) : (
                          filteredHotels.map(h => (
                            <tr key={h.id} style={{ borderBottom: "1px solid #e2e8f0" }} className="admin-table-row">
                              <td style={{ padding: "12px" }}>
                                <img src={h.image_url} alt={h.name} style={{ width: "60px", height: "45px", objectFit: "cover", borderRadius: "4px" }} />
                              </td>
                              <td style={{ padding: "12px", fontWeight: 600 }}>{h.name}</td>
                              <td style={{ padding: "12px" }}>{h.location}</td>
                              <td style={{ padding: "12px", color: "#eab308" }}>{"★".repeat(h.stars)}</td>
                              <td style={{ padding: "12px", fontWeight: 600 }}>{h.price?.toLocaleString()}₫</td>
                              <td style={{ padding: "12px", maxWidth: "250px" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                  {Array.isArray(h.tags) && h.tags.map(tag => (
                                    <span key={tag} style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem" }}>{tag}</span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                  <button onClick={() => handleOpenEditForm(h)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>
                                    Sửa
                                  </button>
                                  <button onClick={() => handleDeleteHotel(h.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>
                                    Xóa
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ĐƠN ĐẶT PHÒNG */}
              {activeTab === "bookings" && (
                <div>
                  {/* Bộ lọc trạng thái đơn đặt */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ fontWeight: 600, marginRight: "10px" }}>Bộ lọc trạng thái:</label>
                    <select
                      className="form-input"
                      value={bookingFilterStatus}
                      onChange={(e) => setBookingFilterStatus(e.target.value)}
                      style={{ maxWidth: "200px", display: "inline-block" }}
                    >
                      <option value="all">Tất cả đơn đặt</option>
                      <option value="pending">Chờ xác nhận (Pending)</option>
                      <option value="confirmed">Đã xác nhận (Confirmed)</option>
                      <option value="completed">Đã hoàn thành (Completed)</option>
                      <option value="cancelled">Đã hủy bỏ (Cancelled)</option>
                    </select>
                  </div>

                  {/* Bảng Danh sách Booking */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                      <thead>
                        <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                          <th style={{ padding: "12px" }}>Mã đơn</th>
                          <th style={{ padding: "12px" }}>Khách hàng</th>
                          <th style={{ padding: "12px" }}>Khách sạn</th>
                          <th style={{ padding: "12px" }}>Thời gian</th>
                          <th style={{ padding: "12px" }}>Tổng tiền</th>
                          <th style={{ padding: "12px" }}>Trạng thái</th>
                          <th style={{ padding: "12px", textAlign: "center" }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                              Không có đơn đặt phòng nào.
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map(b => (
                            <tr key={b.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "12px", fontWeight: 600 }}>#DH{b.id}</td>
                              <td style={{ padding: "12px" }}>
                                <div><strong>{b.user_name}</strong></div>
                                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{b.user_email}</div>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div><strong>{b.hotel_name}</strong></div>
                                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{b.hotel_location}</div>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div style={{ fontSize: "0.85rem" }}>
                                  Nhận: {new Date(b.check_in).toLocaleDateString("vi-VN")}<br />
                                  Trả: {new Date(b.check_out).toLocaleDateString("vi-VN")}
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
                                  ({b.rooms} phòng · {b.guests} khách)
                                </div>
                              </td>
                              <td style={{ padding: "12px", fontWeight: 600, color: "var(--primary)" }}>
                                {b.total_price?.toLocaleString()}₫
                              </td>
                              <td style={{ padding: "12px" }}>
                                <span style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "20px",
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  background:
                                    b.status === "confirmed" ? "#e8f5e9" :
                                    b.status === "completed" ? "#e3f2fd" :
                                    b.status === "cancelled" ? "#ffebee" : "#fff8e1",
                                  color:
                                    b.status === "confirmed" ? "#2e7d32" :
                                    b.status === "completed" ? "#1565c0" :
                                    b.status === "cancelled" ? "#c62828" : "#f57f17"
                                }}>
                                  {b.status === "pending" ? "Chờ duyệt" :
                                   b.status === "confirmed" ? "Đã xác nhận" :
                                   b.status === "completed" ? "Đã xong" : "Đã hủy"}
                                </span>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                  {b.status === "pending" && (
                                    <>
                                      <button onClick={() => handleUpdateBookingStatus(b.id, "confirmed")} style={{ background: "#22c55e", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                                        Duyệt
                                      </button>
                                      <button onClick={() => handleUpdateBookingStatus(b.id, "cancelled")} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                                        Hủy
                                      </button>
                                    </>
                                  )}
                                  {b.status === "confirmed" && (
                                    <>
                                      <button onClick={() => handleUpdateBookingStatus(b.id, "completed")} style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                                        Hoàn thành
                                      </button>
                                      <button onClick={() => handleUpdateBookingStatus(b.id, "cancelled")} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                                        Hủy
                                      </button>
                                    </>
                                  )}
                                  {["completed", "cancelled"].includes(b.status) && (
                                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Không tác vụ</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: TIN NHẮN LIÊN HỆ GÓP Ý */}
              {activeTab === "contacts" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                  {contacts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      Không có tin nhắn góp ý nào gửi đến hệ thống.
                    </div>
                  ) : (
                    contacts.map(c => (
                      <div key={c.id} style={{
                        background: "#ffffff",
                        padding: "1.5rem",
                        borderRadius: "10px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                        border: "1px solid #f0f0f0",
                        borderLeft: c.is_read ? "4px solid #cbd5e1" : "4px solid var(--primary, #3b82f6)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{c.subject || "Không chủ đề"}</span>
                            {!c.is_read && <span style={{ background: "var(--primary, #3b82f6)", color: "white", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", marginLeft: "10px", verticalAlign: "middle" }}>Mới</span>}
                            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 4 }}>
                              Người gửi: <strong>{c.name}</strong> ({c.email}) · Gửi lúc: {new Date(c.created_at).toLocaleString("vi-VN")}
                            </div>
                          </div>

                          {!c.is_read && (
                            <button
                              onClick={() => handleMarkContactRead(c.id)}
                              style={{
                                background: "#f1f5f9",
                                color: "#334155",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => { e.target.style.background = "#e2e8f0"; }}
                              onMouseLeave={(e) => { e.target.style.background = "#f1f5f9"; }}
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>

                        <div style={{
                          marginTop: "1rem",
                          background: "#f8fafc",
                          padding: "1rem",
                          borderRadius: "6px",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap"
                        }}>
                          {c.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </section>
    </div>
  );
}
