import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { hotels, destinations } from "../data";

// Component con hiển thị 5 sao, sao nào <= count thì tô màu.
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
  // Tính phần trăm giảm giá để hiển thị nhãn -xx% trên ảnh.
  const discount = Math.round((1 - hotel.price / hotel.originalPrice) * 100);
  return (
    <div className="hotel-card">
      <div className="hotel-img-wrap">
        <img src={hotel.image} alt={hotel.name} className="hotel-img" />
        {hotel.badge && <span className="hotel-badge">{hotel.badge}</span>}
        <span className="hotel-discount">-{discount}%</span>
        {/* stopPropagation: click vào tim chỉ xử lý ở tim, không "lan" sự kiện lên card cha. */}
        <button className="wishlist-btn" onClick={e => e.stopPropagation()}>♡</button>
      </div>
      <div className="hotel-info">
        <div className="hotel-header">
          <StarRating count={hotel.stars} />
          <span className="hotel-location">📍 {hotel.location}</span>
        </div>
        <h3 className="hotel-name">{hotel.name}</h3>
        <div className="hotel-tags">
          {/* map: lặp từng tag trong mảng để render danh sách nhãn tiện ích. */}
          {hotel.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
        <div className="hotel-rating-row">
          <span className="rating-score">{hotel.rating}</span>
          {/* Hiển thị label theo điểm rating để người dùng hiểu nhanh chất lượng. */}
          <span className="rating-label">{hotel.rating > 4.7 ? "Xuất sắc" : "Tốt"}</span>
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


export default function HomePage() {
  const [destination, setDestination] = useState("TP. Hồ Chí Minh");
  // DatePicker làm việc với kiểu Date/null nên state dùng kiểu này để tránh lỗi.
  const [checkin, setCheckin] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [guests, setGuests] = useState("2 khách, 1 phòng");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchDone, setSearchDone] = useState(false);
  const navigate = useNavigate();

  const filters = ["Tất cả", "5 sao", "4 sao", "Giá thấp nhất", "Đánh giá cao", "Có hồ bơi"];
  // filter: tạo danh sách mới theo điều kiện đang chọn, giúp UI phản hồi tức thời.
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
              <span className="field-icon">📅</span>
              <div>
                <label>Nhận phòng</label>
                <DatePicker
                  selected={checkin}
                  onChange={(date) => setCheckin(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày"
                  minDate={new Date()}
                />
              </div>
            </div>

            <div className="search-divider" />

            <div className="search-field">
              <span className="field-icon">📅</span>
              <div>
                <label>Trả phòng</label>
                <DatePicker
                  selected={checkout}
                  onChange={(date) => setCheckout(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày"
                  minDate={checkin || new Date()} // Ngày trả phải sau ngày nhận
                />
              </div>
            </div>
            <button className="search-btn" onClick={() => { setSearchDone(true); navigate("/hotels"); }}>
              {/* navigate: chuyển route không reload trang, đúng kiểu SPA của React Router. */}
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
              // Click destination để cập nhật state, từ đó đổi tiêu đề kết quả ở phần dưới.
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
            {/* key={hotel.id}: giúp React nhận diện đúng item khi render list. */}
            {filteredHotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
          <div className="load-more-wrap">
            <button className="load-more-btn" onClick={() => navigate("/hotels")}>Xem thêm khách sạn</button>
          </div>
        </div>
      </section>
    </div>
  );
}
