import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hotels } from "../data";

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
  // Tim theo từng card: state local giúp minh họa tương tác nhanh cho demo.
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discount = Math.round((1 - hotel.price / hotel.originalPrice) * 100);
  return (
    <div className="hotel-card">
      <div className="hotel-img-wrap">
        <img src={hotel.image} alt={hotel.name} className="hotel-img" />
        {hotel.badge && <span className="hotel-badge">{hotel.badge}</span>}
        <span className="hotel-discount">-{discount}%</span>
        {/* stopPropagation: click vào tim chỉ đổi trạng thái tim, không lan sự kiện ra card cha. */}
        <button className="wishlist-btn" onClick={e => {
          e.stopPropagation();
          // Đảo trạng thái tim sau mỗi lần bấm.
          setIsWishlisted(!isWishlisted);
        }}>
          {isWishlisted ? "❤️" : "♡"}
        </button>
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

export default function HotelsPage() {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("default");
  const filters = ["Tất cả", "5 sao", "4 sao", "3 sao", "Giá thấp nhất", "Đánh giá cao", "Có hồ bơi"];

  // Filter theo tab đang chọn để người dùng khoanh nhanh danh sách.
  let filtered = hotels.filter((h) => {
    if (activeFilter === "5 sao") return h.stars === 5;
    if (activeFilter === "4 sao") return h.stars === 4;
    if (activeFilter === "3 sao") return h.stars === 3;
    if (activeFilter === "Giá thấp nhất") return h.price < 1200000;
    if (activeFilter === "Đánh giá cao") return h.rating >= 4.7;
    if (activeFilter === "Có hồ bơi") return h.tags.some(t => t.toLowerCase().includes("hồ bơi"));
    return true;
  });

  // Sort được chạy sau filter để tránh sắp xếp dư thừa dữ liệu không hiển thị.
  if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="app page-with-header-offset">
      {/* PAGE HERO */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Tất cả khách sạn</h1>
          <p className="page-hero-sub">Tìm kiếm và đặt phòng từ hàng trăm khách sạn chất lượng</p>
        </div>
      </div>

      <section className="section hotels-section">
        <div className="section-inner">
          <div className="hotels-toolbar">
            <div className="filter-bar">
              {filters.map((f) => (
                <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="sort-wrap">
              <label className="sort-label">Sắp xếp:</label>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          <div className="section-header hotels-result-header">
            <span className="result-count">{filtered.length} khách sạn được tìm thấy</span>
          </div>

          <div className="hotels-grid">
            {filtered.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
