import { useState } from "react";

const hotels = [
  { id: 1, name: "The Grand Saigon Palace", location: "Quận 1, TP.HCM", rating: 4.9, reviews: 2341, price: 2850000, originalPrice: 3800000, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", tags: ["Hồ bơi vô cực", "Spa", "Nhà hàng"], badge: "Bán chạy nhất", stars: 5 },
  { id: 2, name: "Mekong River Boutique", location: "Bến Nghé, TP.HCM", rating: 4.7, reviews: 987, price: 1450000, originalPrice: 1900000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80", tags: ["View sông", "Bữa sáng miễn phí", "Gym"], badge: "Giá tốt", stars: 4 },
  { id: 3, name: "Lotus Heritage Resort", location: "Thủ Đức, TP.HCM", rating: 4.8, reviews: 1523, price: 3200000, originalPrice: 4100000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80", tags: ["Biệt thự riêng", "Hồ bơi", "Butler service"], badge: "Sang trọng", stars: 5 },
  { id: 4, name: "Cityscape Business Hotel", location: "Bình Thạnh, TP.HCM", rating: 4.5, reviews: 654, price: 980000, originalPrice: 1200000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", tags: ["Trung tâm thành phố", "Wifi tốc độ cao", "Coworking"], badge: "Giá rẻ", stars: 4 },
  { id: 5, name: "Indochine Sky Suites", location: "Quận 3, TP.HCM", rating: 4.6, reviews: 1102, price: 1750000, originalPrice: 2300000, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80", tags: ["Tầng thượng", "Bar", "Lịch sử"], badge: "Đặc sắc", stars: 4 },
  { id: 6, name: "Pearl Riverside Escape", location: "Quận 4, TP.HCM", rating: 4.4, reviews: 431, price: 820000, originalPrice: 1100000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80", tags: ["Ven sông", "Yên tĩnh", "Bếp riêng"], badge: null, stars: 3 },
  { id: 7, name: "Azure Rooftop Hotel", location: "Quận 7, TP.HCM", rating: 4.3, reviews: 312, price: 1100000, originalPrice: 1400000, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80", tags: ["Rooftop pool", "Bar", "Gym"], badge: null, stars: 4 },
  { id: 8, name: "Saigon Heritage Inn", location: "Quận 1, TP.HCM", rating: 4.2, reviews: 218, price: 650000, originalPrice: 850000, image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=600&q=80", tags: ["Lịch sử", "Trung tâm", "Bữa sáng"], badge: null, stars: 3 },
  { id: 9, name: "The Riviera Suites", location: "Quận 2, TP.HCM", rating: 4.8, reviews: 876, price: 2400000, originalPrice: 3100000, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80", tags: ["Hồ bơi", "Spa", "Nhà hàng fine dining"], badge: "Mới mở", stars: 5 },
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

export default function HotelsPage() {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("default");
  const filters = ["Tất cả", "5 sao", "4 sao", "3 sao", "Giá thấp nhất", "Đánh giá cao", "Có hồ bơi"];

  let filtered = hotels.filter((h) => {
    if (activeFilter === "5 sao") return h.stars === 5;
    if (activeFilter === "4 sao") return h.stars === 4;
    if (activeFilter === "3 sao") return h.stars === 3;
    if (activeFilter === "Giá thấp nhất") return h.price < 1200000;
    if (activeFilter === "Đánh giá cao") return h.rating >= 4.7;
    if (activeFilter === "Có hồ bơi") return h.tags.some(t => t.toLowerCase().includes("hồ bơi"));
    return true;
  });

  if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="app" style={{ paddingTop: "68px" }}>
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

          <div className="section-header" style={{ marginBottom: "24px" }}>
            <span className="result-count">{filtered.length} khách sạn được tìm thấy</span>
          </div>

          <div className="hotels-grid">
            {filtered.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo"><span className="logo-icon">✦</span><span className="logo-text">StayVN</span></div>
            <p>Nền tảng đặt phòng khách sạn hàng đầu Việt Nam</p>
          </div>
          <div className="footer-links">
            <div><h4>Về chúng tôi</h4><a href="/about-us">Giới thiệu</a><a href="#">Tuyển dụng</a></div>
            <div><h4>Hỗ trợ</h4><a href="#">Trung tâm trợ giúp</a><a href="/contact">Liên hệ</a></div>
            <div><h4>Đối tác</h4><a href="#">Đăng ký khách sạn</a><a href="#">API</a></div>
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
