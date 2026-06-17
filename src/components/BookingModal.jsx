import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { bookingAPI } from "../services/api";

// Component hiển thị Modal nhập thông tin đặt phòng khách sạn
export default function BookingModal({ hotel, onClose }) {
  // State quản lý ngày nhận và trả phòng
  const [checkin,  setCheckin]  = useState(null);
  const [checkout, setCheckout] = useState(null);
  // State quản lý số khách và số phòng
  const [guests,   setGuests]   = useState(1);
  const [rooms,    setRooms]    = useState(1);
  // State quản lý ghi chú và các trạng thái loading/success/error của API
  const [note,     setNote]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  // Các state mới quản lý luồng thanh toán demo
  const [step,      setStep]      = useState(1); // 1: Nhập ngày/thông tin đặt, 2: Chọn thanh toán demo
  const [payMethod, setPayMethod] = useState("card"); // card: Thẻ tín dụng, qr: Quét mã QR Bank

  const imageUrl = hotel.image_url || hotel.image;
  const price    = Number(hotel.price);

  // Tính số đêm thuê dựa trên khoảng cách giữa hai ngày nhận và trả phòng
  const nights = checkin && checkout
    ? Math.ceil((checkout - checkin) / 86400000)
    : 0;
  // Tính tổng tiền = số đêm * giá một đêm * số lượng phòng đặt
  const total = nights * price * rooms;

  // Xử lý gửi yêu cầu đặt phòng lên Backend sau khi hoàn tất thanh toán demo
  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      // Giả lập kết nối cổng thanh toán ngân hàng trong 1.5 giây để tăng tính chân thật
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Gọi API tạo đơn đặt phòng mới (Backend đã được nâng cấp tự động lưu trạng thái confirmed)
      const res = await bookingAPI.create({
        hotel_id:  hotel.id,
        // Chuyển đối tượng ngày thành chuỗi dạng YYYY-MM-DD gửi lên database
        check_in:  checkin.toISOString().slice(0, 10),
        check_out: checkout.toISOString().slice(0, 10),
        guests,
        rooms,
        note: note.trim() || undefined,
      });
      if (res.success) setSuccess(true);
      else setError(res.message || res.errors?.[0]?.msg || "Đặt phòng thất bại.");
    } catch {
      setError("Không kết nối được server.");
    } finally {
      setLoading(false);
    }
  };

  // Đóng modal khi người dùng click vào vùng ngoài form đặt phòng (overlay)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        {/* Nút đóng modal ở góc trên bên phải */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {success ? (
          // Khối hiển thị khi đặt phòng thành công
          <div className="form-success" style={{ padding: "2rem", textAlign: "center" }}>
            <div className="success-icon">🎉</div>
            <h3>Đặt phòng & Thanh toán thành công!</h3>
            <p style={{ margin: "0.5rem 0 1.5rem" }}>
              Đơn đặt phòng tại <strong>{hotel.name}</strong> đã được thanh toán và xác nhận ngay lập tức.
            </p>
            <button className="search-btn" onClick={onClose}>Đóng</button>
          </div>
        ) : (
          // Form nhập thông tin đặt phòng & thanh toán
          <>
            {/* Tóm tắt thông tin khách sạn đang đặt */}
            <div className="modal-hotel-info">
              <img src={imageUrl} alt={hotel.name} className="modal-hotel-img" />
              <div>
                <h3 className="modal-hotel-name">{hotel.name}</h3>
                <p className="modal-hotel-location">📍 {hotel.location}</p>
                <p className="modal-hotel-price">
                  {price.toLocaleString("vi-VN")}₫<span style={{ fontWeight: 400, fontSize: "0.85rem" }}>/đêm</span>
                </p>
              </div>
            </div>

            {step === 1 ? (
              // BƯỚC 1: Nhập ngày nhận/trả phòng và thông tin số khách
              <div className="modal-form">
                {/* Chọn ngày nhận phòng và trả phòng */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày nhận phòng</label>
                    <DatePicker selected={checkin} onChange={setCheckin}
                      dateFormat="dd/MM/yyyy" placeholderText="Chọn ngày"
                      minDate={new Date()} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày trả phòng</label>
                    <DatePicker selected={checkout} onChange={setCheckout}
                      dateFormat="dd/MM/yyyy" placeholderText="Chọn ngày"
                      minDate={checkin || new Date()} className="form-input" />
                  </div>
                </div>

                {/* Chọn số khách và số phòng */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số khách</label>
                    <select className="form-input" value={guests} onChange={e => setGuests(Number(e.target.value))}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} khách</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số phòng</label>
                    <select className="form-input" value={rooms} onChange={e => setRooms(Number(e.target.value))}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} phòng</option>)}
                    </select>
                  </div>
                </div>

                {/* Nhập ghi chú thêm */}
                <div className="form-group">
                  <label className="form-label">Ghi chú (tùy chọn)</label>
                  <textarea className="form-input" rows={2} value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="VD: Phòng tầng cao, view biển..." />
                </div>

                {/* Tóm tắt chi tiết hóa đơn tạm tính */}
                {nights > 0 && (
                  <div className="booking-summary">
                    <span>📅 {nights} đêm × {price.toLocaleString("vi-VN")}₫ × {rooms} phòng</span>
                    <strong>= {total.toLocaleString("vi-VN")}₫</strong>
                  </div>
                )}

                {/* Hiển thị lỗi nếu có */}
                {error && <p className="login-error">{error}</p>}

                {/* Nút đi tiếp bước thanh toán */}
                <button className="search-btn form-submit-full" onClick={() => {
                  setError("");
                  if (!checkin || !checkout) { setError("Vui lòng chọn ngày nhận và trả phòng."); return; }
                  if (checkout <= checkin)    { setError("Ngày trả phòng phải sau ngày nhận phòng."); return; }
                  setStep(2);
                }}>
                  Tiếp tục thanh toán
                </button>
              </div>
            ) : (
              // BƯỚC 2: Cổng thanh toán demo (Luôn thành công)
              <div className="modal-form">
                <h4 style={{ margin: "0.2rem 0 1rem", fontWeight: 600, fontSize: "1.05rem" }}>💳 Chọn phương thức thanh toán</h4>
                
                {/* Lựa chọn phương thức thanh toán */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.2rem" }}>
                  <button type="button" 
                    onClick={() => setPayMethod("card")}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: payMethod === "card" ? "2px solid var(--primary)" : "1px solid #cbd5e1",
                      background: payMethod === "card" ? "#f8fafc" : "white",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>💳 Thẻ tín dụng</span>
                  </button>
                  <button type="button"
                    onClick={() => setPayMethod("qr")}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: payMethod === "qr" ? "2px solid var(--primary)" : "1px solid #cbd5e1",
                      background: payMethod === "qr" ? "#f8fafc" : "white",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>📲 Quét mã QR</span>
                  </button>
                </div>

                {/* Form thẻ tín dụng demo */}
                {payMethod === "card" && (
                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.2rem" }}>
                    <div className="form-group" style={{ marginBottom: "0.8rem" }}>
                      <label className="form-label" style={{ fontSize: "0.8rem" }}>Số thẻ</label>
                      <input className="form-input" type="text" placeholder="4111 2222 3333 4444" defaultValue="4111222233334444" disabled={loading} />
                    </div>
                    <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Ngày hết hạn</label>
                        <input className="form-input" type="text" placeholder="MM/YY" defaultValue="12/29" disabled={loading} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>CVV</label>
                        <input className="form-input" type="password" placeholder="***" defaultValue="999" disabled={loading} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mã QR thanh toán demo */}
                {payMethod === "qr" && (
                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>📲</div>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "4px 0" }}>
                      Hệ thống demo tự động kết nối và xác nhận giao dịch.
                    </p>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--primary)" }}>
                      Ngân hàng: StayHTM Bank · STK: 17092026
                    </p>
                  </div>
                )}

                {/* Tổng tiền thanh toán */}
                <div className="booking-summary" style={{ background: "#fff5f5", borderLeft: "4px solid var(--primary)", marginBottom: "1.2rem" }}>
                  <span>Số tiền cần thanh toán:</span>
                  <strong style={{ color: "var(--primary)", fontSize: "1.2rem" }}>{total.toLocaleString("vi-VN")}₫</strong>
                </div>

                {/* Hiển thị lỗi nếu có */}
                {error && <p className="login-error">{error}</p>}

                {/* Các nút điều khiển */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="search-btn form-submit-full outlined" onClick={() => setStep(1)} disabled={loading} style={{ flex: 1 }}>
                    Quay lại
                  </button>
                  <button type="button" className="search-btn form-submit-full" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
                    {loading ? "Đang xử lý giao dịch..." : "Thanh toán & Xác nhận"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
