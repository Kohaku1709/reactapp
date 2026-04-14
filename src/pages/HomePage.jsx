import { useState } from "react";
import { useNavigate } from "react-router-dom";

const hotels = [
  { id: 1, name: "The Grand Saigon Palace", location: "Quận 1, TP.HCM", rating: 4.9, reviews: 2341, price: 2850000, originalPrice: 3800000, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", tags: ["Hồ bơi vô cực", "Spa", "Nhà hàng"], badge: "Bán chạy nhất", stars: 5 },
  { id: 2, name: "Mekong River Boutique", location: "Bến Nghé, TP.HCM", rating: 4.7, reviews: 987, price: 1450000, originalPrice: 1900000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80", tags: ["View sông", "Bữa sáng miễn phí", "Gym"], badge: "Giá tốt", stars: 4 },
  { id: 3, name: "Lotus Heritage Resort", location: "Thủ Đức, TP.HCM", rating: 4.8, reviews: 1523, price: 3200000, originalPrice: 4100000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80", tags: ["Biệt thự riêng", "Hồ bơi", "Butler service"], badge: "Sang trọng", stars: 5 },
  { id: 4, name: "Cityscape Business Hotel", location: "Bình Thạnh, TP.HCM", rating: 4.5, reviews: 654, price: 980000, originalPrice: 1200000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", tags: ["Trung tâm thành phố", "Wifi tốc độ cao", "Coworking"], badge: "Giá rẻ", stars: 4 },
  { id: 5, name: "Indochine Sky Suites", location: "Quận 3, TP.HCM", rating: 4.6, reviews: 1102, price: 1750000, originalPrice: 2300000, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80", tags: ["Tầng thượng", "Bar", "Lịch sử"], badge: "Đặc sắc", stars: 4 },
  { id: 6, name: "Pearl Riverside Escape", location: "Quận 4, TP.HCM", rating: 4.4, reviews: 431, price: 820000, originalPrice: 1100000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80", tags: ["Ven sông", "Yên tĩnh", "Bếp riêng"], badge: null, stars: 3 },
];

const destinations = [
  { name: "Hà Nội", img: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=300&q=80", hotels: "1,234" },
  { name: "Đà Nẵng", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300&q=80", hotels: "876" },
  { name: "Hội An", img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=300&q=80", hotels: "543" },
  { name: "Phú Quốc", img: "https://images.unsplash.com/photo-1602940659805-770d1b3b9911?w=300&q=80", hotels: "412" },
  { name: "Nha Trang", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80", hotels: "721" },
];

function StarRating({ count }) {
  return (
    <span className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? "star filled" : "star"}>★</span>
      ))}
    </span>
  );
}

function HotelCard({ hotel }) {
  const discount = Math.round((1 - hotel.price / hotel.originalPrice) * 100);
  return (
    <div className="hotel-card">
      <div className="hotel-img-wrap">
        <img src={hotel.image} alt={hotel.name} className="hotel-img" />
        {hotel.badge && <span className="hotel-badge">{hotel.badge}</span>}
        <span className="hotel-discount">-{discount}%</span>
        <button className="wishlist-btn" onClick={e => e.stopPropagation()}>♡</button>
      </div>
      <div className="hotel-info">
        <div className="hotel-header">
          <StarRating count={hotel.stars} />
          <span className="hotel-location">📍 {hotel.location}</span>
        </div>
        <h3 className="hotel-name">{hotel.name}</h3>
        <div className="hotel-tags">
          {hotel.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
        <div className="hotel-rating-row">
          <span className="rating-score">{hotel.rating}</span>
          <span className="rating-label">Xuất sắc</span>
          <span className="rating-count">{hotel.reviews.toLocaleString()} đánh giá</span>
        </div>
        <div className="hotel-price-row">
          <div>
            <span className="original-price">{hotel.originalPrice.toLocaleString("vi-VN")}₫</span>
            <div className="current-price">{hotel.price.toLocaleString("vi-VN")}₫<span className="per-night">/đêm</span></div>
          </div>
          <button className="book-btn">Xem phòng</button>
        </div>
      </div>
    </div>
  );
}

function CalendarPicker({ label, icon, value, onChange }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const monthNames = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
  const dayNames = ["CN","T2","T3","T4","T5","T6","T7"];
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const selectDate = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    onChange(d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }));
    setOpen(false);
  };
  const isSelected = (day) => {
    if (!value) return false;
    return new Date(viewYear, viewMonth, day).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) === value;
  };
  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day); d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };
  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  return (
    <div className="calendar-picker">
      <div className="search-field" onClick={() => setOpen(o => !o)} style={{ cursor: "pointer" }}>
        <span className="field-icon">{icon}</span>
        <div>
          <label>{label}</label>
          <div className="date-display">{value || "Chọn ngày"}</div>
        </div>
      </div>
      {open && (
        <>
          <div className="cal-backdrop" onClick={() => setOpen(false)} />
          <div className="calendar-dropdown">
            <div className="cal-header">
              <button className="cal-nav" onClick={prevMonth}>‹</button>
              <span className="cal-month-label">{monthNames[viewMonth]} {viewYear}</span>
              <button className="cal-nav" onClick={nextMonth}>›</button>
            </div>
            <div className="cal-days-row">{dayNames.map(d => <span key={d} className="cal-day-name">{d}</span>)}</div>
            <div className="cal-grid">
              {Array.from({ length: firstDay }).map((_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                return (
                  <button key={day} className={`cal-day ${isSelected(day) ? "selected" : ""} ${isPast(day) ? "past" : ""}`}
                    onClick={() => !isPast(day) && selectDate(day)} disabled={isPast(day)}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const [destination, setDestination] = useState("TP. Hồ Chí Minh");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2 khách, 1 phòng");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchDone, setSearchDone] = useState(false);
  const navigate = useNavigate();

  const filters = ["Tất cả", "5 sao", "4 sao", "Giá thấp nhất", "Đánh giá cao", "Có hồ bơi"];
  const filteredHotels = hotels.filter((h) => {
    if (activeFilter === "5 sao") return h.stars === 5;
    if (activeFilter === "4 sao") return h.stars === 4;
    if (activeFilter === "Giá thấp nhất") return h.price < 1200000;
    if (activeFilter === "Đánh giá cao") return h.rating >= 4.7;
    if (activeFilter === "Có hồ bơi") return h.tags.some(t => t.toLowerCase().includes("hồ bơi"));
    return true;
  });

  return (
    <div className="app">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"><div className="hero-overlay" /></div>
        <div className="hero-content">
          <p className="hero-eyebrow">Ưu đãi lên đến 40% · Hơn 500,000 khách sạn toàn cầu</p>
          <h1 className="hero-title">Tìm chỗ nghỉ <span className="hero-highlight">hoàn hảo</span> của bạn</h1>
          <p className="hero-sub">Đặt phòng nhanh chóng, giá tốt nhất, không phí ẩn</p>
          <div className="search-box">
            <div className="search-field">
              <span className="field-icon">📍</span>
              <div>
                <label>Điểm đến</label>
                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Thành phố, khách sạn..." />
              </div>
            </div>
            <div className="search-divider" />
            <CalendarPicker label="Nhận phòng" icon="📅" value={checkin} onChange={setCheckin} />
            <div className="search-divider" />
            <CalendarPicker label="Trả phòng" icon="📅" value={checkout} onChange={setCheckout} />
            <div className="search-divider" />
            <div className="search-field">
              <span className="field-icon">👤</span>
              <div>
                <label>Khách & Phòng</label>
                <select value={guests} onChange={e => setGuests(e.target.value)}>
                  <option>1 khách, 1 phòng</option>
                  <option>2 khách, 1 phòng</option>
                  <option>2 khách, 2 phòng</option>
                  <option>4 khách, 2 phòng</option>
                </select>
              </div>
            </div>
            <button className="search-btn" onClick={() => { setSearchDone(true); navigate("/hotels"); }}>
              🔍 Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="section destinations-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Điểm đến phổ biến</h2>
            <a href="#" className="see-all">Xem tất cả →</a>
          </div>
          <div className="destinations-grid">
            {destinations.map((d) => (
              <div key={d.name} className="destination-card" onClick={() => setDestination(d.name)}>
                <img src={d.img} alt={d.name} className="destination-img" />
                <div className="destination-overlay">
                  <h3 className="destination-name">{d.name}</h3>
                  <p className="destination-hotels">{d.hotels} khách sạn</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOTEL LISTINGS */}
      <section className="section hotels-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">{searchDone ? `Kết quả tại "${destination}"` : "Khách sạn nổi bật"}</h2>
            <span className="result-count">{filteredHotels.length} khách sạn</span>
          </div>
          <div className="filter-bar">
            {filters.map((f) => (
              <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="hotels-grid">
            {filteredHotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
          <div className="load-more-wrap">
            <button className="load-more-btn" onClick={() => navigate("/hotels")}>Xem thêm khách sạn</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo"><span className="logo-icon">✦</span><span className="logo-text">StayVN</span></div>
            <p>Nền tảng đặt phòng khách sạn hàng đầu Việt Nam</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Về chúng tôi</h4>
              <a href="/about-us">Giới thiệu</a>
              <a href="#">Tuyển dụng</a>
              <a href="#">Báo chí</a>
            </div>
            <div>
              <h4>Hỗ trợ</h4>
              <a href="#">Trung tâm trợ giúp</a>
              <a href="/contact">Liên hệ</a>
              <a href="#">Chính sách hoàn tiền</a>
            </div>
            <div>
              <h4>Dành cho đối tác</h4>
              <a href="#">Đăng ký khách sạn</a>
              <a href="#">Affiliate</a>
              <a href="#">API</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 StayVN. Bảo lưu mọi quyền.</span>
          <span>🇻🇳 Tiếng Việt · VND</span>
        </div>
      </footer>
    </div>
  );
}
