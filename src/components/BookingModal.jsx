import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { bookingAPI } from "../services/api";

export default function BookingModal({ hotel, onClose }) {
  const [checkin,  setCheckin]  = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [guests,   setGuests]   = useState(1);
  const [rooms,    setRooms]    = useState(1);
  const [note,     setNote]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const imageUrl = hotel.image_url || hotel.image;
  const price    = Number(hotel.price);

  const nights = checkin && checkout
    ? Math.ceil((checkout - checkin) / 86400000)
    : 0;
  const total = nights * price * rooms;

  const handleSubmit = async () => {
    setError("");
    if (!checkin || !checkout) { setError("Vui lòng chọn ngày nhận và trả phòng."); return; }
    if (checkout <= checkin)    { setError("Ngày trả phòng phải sau ngày nhận phòng."); return; }

    setLoading(true);
    try {
      const res = await bookingAPI.create({
        hotel_id:  hotel.id,
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

  // Overlay click để đóng modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>

        {success ? (
          <div className="form-success" style={{ padding: "2rem", textAlign: "center" }}>
            <div className="success-icon">🎉</div>
            <h3>Đặt phòng thành công!</h3>
            <p style={{ margin: "0.5rem 0 1.5rem" }}>
              Đơn đặt phòng tại <strong>{hotel.name}</strong> đã được ghi nhận.
            </p>
            <button className="search-btn" onClick={onClose}>Đóng</button>
          </div>
        ) : (
          <>
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

            <div className="modal-form">
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

              <div className="form-group">
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea className="form-input" rows={2} value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="VD: Phòng tầng cao, view biển..." />
              </div>

              {nights > 0 && (
                <div className="booking-summary">
                  <span>📅 {nights} đêm × {price.toLocaleString("vi-VN")}₫ × {rooms} phòng</span>
                  <strong>= {total.toLocaleString("vi-VN")}₫</strong>
                </div>
              )}

              {error && <p className="login-error">{error}</p>}

              <button className="search-btn form-submit-full" onClick={handleSubmit} disabled={loading}>
                {loading ? "Đang đặt phòng..." : "Xác nhận đặt phòng"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
