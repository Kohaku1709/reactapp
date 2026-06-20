import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { bookingAPI } from "../services/api";
import { useUser } from "../context/userContext";
// Khai báo các loại phòng cố định phục vụ trải nghiệm thực tế
const ROOM_TYPES = [
  {
    id: "standard",
    name: "Phòng Standard (Tiêu chuẩn)",
    factor: 1.0,
    features: ["24m²", "Giường Double", "Hướng thành phố", "Wi-Fi miễn phí"],
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80"
  },
  {
    id: "deluxe",
    name: "Phòng Deluxe Ocean View",
    factor: 1.4,
    features: ["32m²", "Giường King Size", "Hướng biển một phần", "Buffet sáng"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80"
  },
  {
    id: "suite",
    name: "Phòng President Suite",
    factor: 2.2,
    features: ["55m²", "Giường Super King", "Hướng trực diện biển", "Xe đưa đón", "Spa & Lounge"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80"
  }
];
// Khai báo các dịch vụ đi kèm
const ADDONS = [
  { id: "breakfast", name: "Buffet sáng hàng ngày", price: 150000, desc: "Theo số khách và số đêm (+150.000₫/khách/đêm)" },
  { id: "pickup", name: "Xe đưa đón sân bay khứ hồi", price: 350000, desc: "Trọn gói 2 chiều xe riêng (+350.000₫)" },
  { id: "spa", name: "Gói trị liệu Spa chuyên sâu", price: 250000, desc: "Theo số khách đăng ký (+250.000₫/khách)" }
];
export default function BookingModal({ hotel, onClose }) {
  const { setBookedHotelIds } = useUser();
  // ─── Các State quản lý ──────────────────────────────────────────
  const [step, setStep] = useState(1); // 1: Chọn ngày & Loại phòng, 2: Chọn dịch vụ & Số khách, 3: Hóa đơn & Thanh toán
  const [checkin, setCheckin] = useState(null);
  const [checkout, setCheckout] = useState(null);
  
  const [selectedRoom, setSelectedRoom] = useState(ROOM_TYPES[0]);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  // Mã giảm giá
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, rate }
  const [promoMsg, setPromoMsg] = useState({ text: "", type: "" }); // type: 'success' | 'error'
  const [note, setNote] = useState("");
  const [payMethod, setPayMethod] = useState("card"); // card | qr | hotel
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const imageUrl = hotel.image_url || hotel.image;
  const basePrice = Number(hotel.price);
  // Tính số đêm thuê
  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0;
    return Math.ceil((checkout - checkin) / 86400000);
  }, [checkin, checkout]);
  // Tính toán chi tiết hóa đơn
  const billDetails = useMemo(() => {
    if (nights <= 0) return null;
    const roomPricePerNight = basePrice * selectedRoom.factor;
    const totalRoomPrice = roomPricePerNight * nights * rooms;
    // Tính tiền dịch vụ đi kèm
    let breakfastPrice = 0;
    let pickupPrice = 0;
    let spaPrice = 0;
    if (selectedAddons.includes("breakfast")) {
      breakfastPrice = 150000 * guests * nights;
    }
    if (selectedAddons.includes("pickup")) {
      pickupPrice = 350000;
    }
    if (selectedAddons.includes("spa")) {
      spaPrice = 250000 * guests;
    }
    const totalAddonsPrice = breakfastPrice + pickupPrice + spaPrice;
    // Tính mã giảm giá (áp dụng trên tiền phòng)
    const discountAmount = appliedPromo ? Math.floor(totalRoomPrice * appliedPromo.rate) : 0;
    const subtotal = totalRoomPrice + totalAddonsPrice - discountAmount;
    
    // Thuế VAT (10%) & Phí dịch vụ (5%)
    const vatAmount = Math.floor(subtotal * 0.1);
    const serviceAmount = Math.floor(subtotal * 0.05);
    const grandTotal = subtotal + vatAmount + serviceAmount;
    return {
      roomPricePerNight,
      totalRoomPrice,
      breakfastPrice,
      pickupPrice,
      spaPrice,
      totalAddonsPrice,
      discountAmount,
      subtotal,
      vatAmount,
      serviceAmount,
      grandTotal
    };
  }, [nights, basePrice, selectedRoom, rooms, guests, selectedAddons, appliedPromo]);
  // Xử lý áp dụng mã giảm giá
  const handleApplyPromo = () => {
    setPromoMsg({ text: "", type: "" });
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoMsg({ text: "Vui lòng nhập mã giảm giá.", type: "error" });
      return;
    }
    if (code === "STAYHTM40") {
      setAppliedPromo({ code: "STAYHTM40", rate: 0.4 });
      setPromoMsg({ text: "Áp dụng thành công! Giảm 40% tiền phòng.", type: "success" });
    } else if (code === "WELCOME10") {
      setAppliedPromo({ code: "WELCOME10", rate: 0.1 });
      setPromoMsg({ text: "Áp dụng thành công! Giảm 10% tiền phòng.", type: "success" });
    } else if (code === "STAYHTM") {
      setAppliedPromo({ code: "STAYHTM", rate: 0.2 });
      setPromoMsg({ text: "Áp dụng thành công! Giảm 20% tiền phòng.", type: "success" });
    } else {
      setPromoMsg({ text: "Mã giảm giá không tồn tại hoặc đã hết hạn.", type: "error" });
      setAppliedPromo(null);
    }
  };
  // Đóng modal khi click ra ngoài
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  // Gửi yêu cầu đặt phòng lên API
  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      // Giả lập kết nối cổng thanh toán trong 1.5s
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Tách và định dạng các thông tin cấu hình đặt phòng lưu vào note dưới dạng có cấu trúc
      const addonNames = selectedAddons.map(id => {
        const ad = ADDONS.find(a => a.id === id);
        return ad ? ad.name : id;
      }).join(", ");
      const structuredNote = [
        `[StayHTM-Invoice]`,
        `RoomType: ${selectedRoom.name}`,
        `Addons: ${addonNames || "Không"}`,
        `Promo: ${appliedPromo ? appliedPromo.code : "Không"}`,
        `DiscountAmt: ${billDetails ? billDetails.discountAmount : 0}`,
        `TaxAmt: ${billDetails ? (billDetails.vatAmount + billDetails.serviceAmount) : 0}`,
        `PayMethod: ${payMethod === "card" ? "Thẻ tín dụng" : payMethod === "qr" ? "Quét mã QR" : "Thanh toán tại khách sạn"}`,
        `UserNote: ${note.trim() || "Không"}`
      ].join(" | ");
      const res = await bookingAPI.create({
        hotel_id: hotel.id,
        check_in: checkin.toISOString().slice(0, 10),
        check_out: checkout.toISOString().slice(0, 10),
        guests,
        rooms,
        // Backend yêu cầu tổng giá, chúng ta truyền grandTotal tính được ở Client
        total_price: billDetails ? billDetails.grandTotal : basePrice,
        note: structuredNote,
      });
      if (res.success) {
        setSuccess(true);
        setBookedHotelIds(prev => [...new Set([...prev, Number(hotel.id)])]);
      } else {
        setError(res.message || res.errors?.[0]?.msg || "Đặt phòng thất bại.");
      }
    } catch {
      setError("Không kết nối được server.");
    } finally {
      setLoading(false);
    }
  };
  // Toggle chọn dịch vụ đi kèm
  const handleToggleAddon = (id) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box" style={{ maxWidth: "580px" }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {success ? (
          <div className="form-success" style={{ padding: "2rem", textAlign: "center" }}>
            <div className="success-icon" style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h3>Đặt phòng & Xác nhận thành công!</h3>
            <p style={{ margin: "0.5rem 0 1.5rem", fontSize: "0.95rem", color: "var(--muted)" }}>
              Yêu cầu đặt phòng của bạn tại <strong>{hotel.name}</strong> đã được hệ thống xác nhận. Bạn có thể kiểm tra chi tiết trong lịch sử đặt phòng.
            </p>
            <button className="search-btn" onClick={onClose}>Đóng cửa sổ</button>
          </div>
        ) : (
          <>
            {/* Tiêu đề & Thông tin Khách sạn */}
            <div className="modal-hotel-info">
              <img src={imageUrl} alt={hotel.name} className="modal-hotel-img" />
              <div>
                <h3 className="modal-hotel-name">{hotel.name}</h3>
                <p className="modal-hotel-location">📍 {hotel.location}</p>
                <p className="modal-hotel-price">
                  {basePrice.toLocaleString("vi-VN")}₫<span style={{ fontWeight: 400, fontSize: "0.85rem", color: "var(--muted)" }}>/đêm (phòng cơ bản)</span>
                </p>
              </div>
            </div>
            {/* Chỉ báo các bước (Steps Indicator) */}
            <div className="checkout-steps">
              <div className={`step-indicator ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
                1. Chọn ngày & Phòng
              </div>
              <div className={`step-indicator ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
                2. Dịch vụ & Số khách
              </div>
              <div className={`step-indicator ${step === 3 ? "active" : ""}`}>
                3. Hóa đơn & Thanh toán
              </div>
            </div>
            {/* BƯỚC 1: CHỌN NGÀY & HẠNG PHÒNG */}
            {step === 1 && (
              <div className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày nhận phòng</label>
                    <DatePicker
                      selected={checkin}
                      onChange={setCheckin}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Chọn ngày"
                      minDate={new Date()}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày trả phòng</label>
                    <DatePicker
                      selected={checkout}
                      onChange={setCheckout}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Chọn ngày"
                      minDate={checkin || new Date()}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: "8px" }}>Chọn hạng phòng muốn đặt</label>
                  <div className="room-types-list">
                    {ROOM_TYPES.map((room) => {
                      const roomPrice = basePrice * room.factor;
                      const isSelected = selectedRoom.id === room.id;
                      return (
                        <div
                          key={room.id}
                          className={`room-type-card ${isSelected ? "selected" : ""}`}
                          onClick={() => setSelectedRoom(room)}
                        >
                          <img src={room.image} alt={room.name} className="room-type-img" />
                          <div className="room-type-details">
                            <div>
                              <h4 className="room-type-name">
                                {room.name}
                                {isSelected && <span style={{ color: "var(--brand)", fontSize: "14px" }}>✓</span>}
                              </h4>
                              <div className="room-type-features">
                                {room.features.map((feat, i) => (
                                  <span key={i} className="room-feature-tag">{feat}</span>
                                ))}
                              </div>
                            </div>
                            <div className="room-price-right">
                              <span className="room-price-value">{roomPrice.toLocaleString("vi-VN")}₫<span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>/đêm</span></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Nhập mã giảm giá demo ngay bước 1 để tạo cảm giác thực tế */}
                <div className="form-group">
                  <label className="form-label">Ưu đãi / Mã giảm giá</label>
                  <div className="promo-section">
                    <input
                      className="promo-input"
                      type="text"
                      placeholder="Nhập mã (Ví dụ: STAYHTM)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                    />
                    <button type="button" className="promo-apply-btn" onClick={handleApplyPromo}>Áp dụng</button>
                  </div>
                  {promoMsg.text && (
                    <p className={`promo-msg ${promoMsg.type}`}>{promoMsg.text}</p>
                  )}
                </div>
                {error && <p className="login-error">{error}</p>}
                <button
                  type="button"
                  className="search-btn form-submit-full"
                  onClick={() => {
                    setError("");
                    if (!checkin || !checkout) {
                      setError("Vui lòng chọn ngày nhận phòng và trả phòng.");
                      return;
                    }
                    if (checkout <= checkin) {
                      setError("Ngày trả phòng phải sau ngày nhận phòng.");
                      return;
                    }
                    setStep(2);
                  }}
                >
                  Tiếp tục: Dịch vụ & Số khách →
                </button>
              </div>
            )}
            {/* BƯỚC 2: CHỌN DỊCH VỤ & SỐ KHÁCH */}
            {step === 2 && (
              <div className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số khách đi cùng</label>
                    <select className="form-input" value={guests} onChange={e => setGuests(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} khách</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số lượng phòng đặt</label>
                    <select className="form-input" value={rooms} onChange={e => setRooms(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} phòng</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: "6px" }}>Dịch vụ gia tăng tùy chọn (Add-ons)</label>
                  <div className="addons-list">
                    {ADDONS.map((addon) => {
                      const isChecked = selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          className="addon-card"
                          onClick={() => handleToggleAddon(addon.id)}
                        >
                          <div className="addon-card-left">
                            <input
                              type="checkbox"
                              className="addon-checkbox"
                              checked={isChecked}
                              readOnly
                            />
                            <div className="addon-info-text">
                              <span className="addon-title">{addon.name}</span>
                              <span className="addon-desc">{addon.desc}</span>
                            </div>
                          </div>
                          <span className="addon-price">+{addon.price.toLocaleString("vi-VN")}₫</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Yêu cầu đặc biệt (tùy chọn)</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="VD: Phòng tầng cao, không hút thuốc, chuẩn bị trăng mật..."
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="search-btn form-submit-full outlined" onClick={() => setStep(1)} style={{ flex: 1 }}>
                    Quay lại
                  </button>
                  <button type="button" className="search-btn form-submit-full" onClick={() => setStep(3)} style={{ flex: 2 }}>
                    Tiếp tục: Hóa đơn & Thanh toán →
                  </button>
                </div>
              </div>
            )}
            {/* BƯỚC 3: HÓA ĐƠN CHI TIẾT & THANH TOÁN */}
            {step === 3 && billDetails && (
              <div className="modal-form">
                {/* Hóa đơn chi tiết tách bạch */}
                <div className="detailed-invoice">
                  <div className="invoice-title">🧾 Chi tiết hóa đơn thanh toán</div>
                  
                  <div className="invoice-item">
                    <span>Hạng phòng: <strong>{selectedRoom.name}</strong></span>
                    <span>{(basePrice * selectedRoom.factor).toLocaleString("vi-VN")}₫ × {nights} đêm × {rooms} phòng</span>
                  </div>
                  
                  <div className="invoice-item" style={{ paddingLeft: "12px", fontSize: "12px", color: "var(--muted)" }}>
                    <span>Tổng tiền phòng gốc:</span>
                    <span>{billDetails.totalRoomPrice.toLocaleString("vi-VN")}₫</span>
                  </div>
                  {/* Dịch vụ đi kèm */}
                  {selectedAddons.length > 0 && (
                    <>
                      <div className="invoice-item" style={{ fontWeight: 600, color: "var(--dark)", marginTop: "6px" }}>
                        <span>Dịch vụ đi kèm đã chọn:</span>
                        <span>+{billDetails.totalAddonsPrice.toLocaleString("vi-VN")}₫</span>
                      </div>
                      {selectedAddons.includes("breakfast") && (
                        <div className="invoice-item" style={{ paddingLeft: "12px", fontSize: "12px", color: "var(--muted)" }}>
                          <span>- Buffet sáng ({guests} khách × {nights} đêm):</span>
                          <span>{billDetails.breakfastPrice.toLocaleString("vi-VN")}₫</span>
                        </div>
                      )}
                      {selectedAddons.includes("pickup") && (
                        <div className="invoice-item" style={{ paddingLeft: "12px", fontSize: "12px", color: "var(--muted)" }}>
                          <span>- Xe đón tiễn sân bay (Khứ hồi):</span>
                          <span>{billDetails.pickupPrice.toLocaleString("vi-VN")}₫</span>
                        </div>
                      )}
                      {selectedAddons.includes("spa") && (
                        <div className="invoice-item" style={{ paddingLeft: "12px", fontSize: "12px", color: "var(--muted)" }}>
                          <span>- Gói trị liệu Spa ({guests} khách):</span>
                          <span>{billDetails.spaPrice.toLocaleString("vi-VN")}₫</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* Giảm giá ưu đãi */}
                  {appliedPromo && (
                    <div className="invoice-item discount-item">
                      <span>Mã ưu đãi đã dùng ({appliedPromo.code} giảm {appliedPromo.rate * 100}% tiền phòng):</span>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>-{billDetails.discountAmount.toLocaleString("vi-VN")}₫</span>
                    </div>
                  )}
                  <div className="invoice-divider"></div>
                  <div className="invoice-item">
                    <span>Tạm tính (Sau chiết khấu & phụ phí):</span>
                    <span>{billDetails.subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="invoice-item">
                    <span>Thuế VAT (10%):</span>
                    <span>{billDetails.vatAmount.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="invoice-item">
                    <span>Phí dịch vụ khách sạn (5%)</span>
                    <span>{billDetails.serviceAmount.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="invoice-divider"></div>
                  <div className="invoice-total">
                    <span>Tổng tiền thanh toán</span>
                    <span className="total-amount">{billDetails.grandTotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>
                {/* Phương thức thanh toán */}
                <h4 style={{ margin: "4px 0 0", fontWeight: 700, fontSize: "13px" }}>💳 Chọn phương thức thanh toán</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setPayMethod("card")}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: payMethod === "card" ? "2px solid var(--brand)" : "1px solid var(--border)",
                      background: payMethod === "card" ? "var(--brand-light)" : "white",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>💳 Thẻ tín dụng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("qr")}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: payMethod === "qr" ? "2px solid var(--brand)" : "1px solid var(--border)",
                      background: payMethod === "qr" ? "var(--brand-light)" : "white",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>📲 Quét mã QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("hotel")}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: payMethod === "hotel" ? "2px solid var(--brand)" : "1px solid var(--border)",
                      background: payMethod === "hotel" ? "var(--brand-light)" : "white",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>🏨 Tại khách sạn</span>
                  </button>
                </div>
                {/* Form nhập thẻ tín dụng giả lập */}
                {payMethod === "card" && (
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <div className="form-group" style={{ marginBottom: "8px" }}>
                      <label className="form-label" style={{ fontSize: "11px" }}>Số thẻ</label>
                      <input className="form-input" type="text" placeholder="4111 2222 3333 4444" defaultValue="4111222233334444" disabled={loading} style={{ padding: "6px 10px", fontSize: "13px" }} />
                    </div>
                    <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "11px" }}>Ngày hết hạn</label>
                        <input className="form-input" type="text" placeholder="MM/YY" defaultValue="12/29" disabled={loading} style={{ padding: "6px 10px", fontSize: "13px" }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "11px" }}>CVV</label>
                        <input className="form-input" type="password" placeholder="***" defaultValue="999" disabled={loading} style={{ padding: "6px 10px", fontSize: "13px" }} />
                      </div>
                    </div>
                  </div>
                )}
                {/* Quét mã QR */}
                {payMethod === "qr" && (
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", textAlign: "center" }}>
                    {/* Vẽ mã QR giả lập đẹp mắt */}
                    <div style={{ display: "inline-block", padding: "8px", background: "white", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
                      <div style={{ width: "100px", height: "100px", background: "#0a0f1e", display: "flex", flexWrap: "wrap", padding: "4px", gap: "2px" }}>
                        <div style={{ width: "28px", height: "28px", border: "4px solid white", background: "transparent" }}></div>
                        <div style={{ flex: 1, height: "28px", background: "white", opacity: 0.15 }}></div>
                        <div style={{ width: "28px", height: "28px", border: "4px solid white", background: "transparent" }}></div>
                        <div style={{ width: "100%", height: "28px", background: "white", opacity: 0.3 }}></div>
                        <div style={{ width: "28px", height: "28px", border: "4px solid white", background: "transparent" }}></div>
                        <div style={{ flex: 1, height: "28px", background: "white", opacity: 0.2 }}></div>
                        <div style={{ width: "10px", height: "10px", background: "white" }}></div>
                      </div>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--muted)", margin: "0" }}>
                      Vui lòng quét mã QR trên ứng dụng Ngân hàng để thanh toán tự động.
                    </p>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)", margin: "4px 0 0" }}>
                      StayHTM Bank · STK: 17092026
                    </p>
                  </div>
                )}
                {/* Thanh toán tại khách sạn */}
                {payMethod === "hotel" && (
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", textAlign: "left" }}>
                    <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0", lineHeight: "1.4" }}>
                      👉 Bạn sẽ thanh toán toàn bộ chi phí <strong>{billDetails.grandTotal.toLocaleString("vi-VN")}₫</strong> trực tiếp tại quầy lễ tân khi làm thủ tục nhận phòng (Check-in). 
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600, margin: "6px 0 0" }}>
                      * Miễn phí hủy phòng trước ngày đi 24 giờ.
                    </p>
                  </div>
                )}
                {error && <p className="login-error">{error}</p>}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="search-btn form-submit-full outlined" onClick={() => setStep(2)} disabled={loading} style={{ flex: 1 }}>
                    Quay lại
                  </button>
                  <button type="button" className="search-btn form-submit-full" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
                    {loading ? "Đang tạo đơn đặt phòng..." : payMethod === "hotel" ? "Xác nhận đặt phòng" : "Thanh toán & Xác nhận"}
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

