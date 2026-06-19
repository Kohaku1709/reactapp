import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useResponsiveGridColumns from "../hooks/useResponsiveGridColumns";
import HotelCard from "../components/HotelCard";
import { useUser } from "../context/userContext";
import { hotelAPI, locationAPI } from "../services/api";
import { HOTEL_FILTERS, HOTEL_FILTER_DEFAULTS, HOTEL_SORT_DEFAULT, HOTEL_SORT_OPTIONS } from "../utils/hotelQuery";
import useHotelListing from "../hooks/useHotelListing";

// Component Trang chủ (Home Page)
export default function HomePage() {
  const { currentUser, wishlistHotelIds, onToggleWishlist } = useUser();
  const navigate = useNavigate();

  // State lưu trữ dữ liệu từ API
  const [hotels, setHotels] = useState([]);       // Mảng chứa các khách sạn nổi bật
  const [destinations, setDestinations] = useState([]);   // Mảng chứa danh sách các điểm đến phổ biến
  const [loadingHotels, setLoadingHotels] = useState(true); // Trạng thái chờ tải dữ liệu khách sạn

  // State lưu trữ lựa chọn tìm kiếm của người dùng
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState(null);
  const [checkout, setCheckout] = useState(null);

    // Các state mới quản lý việc chọn số lượng khách và số phòng
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestsPopover, setShowGuestsPopover] = useState(false);

  // State quản lý bộ lọc hoạt động và kiểu sắp xếp của danh sách khách sạn hiển thị ở trang chủ
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState(HOTEL_SORT_DEFAULT);
  const [visibleRows, setVisibleRows] = useState(4); // Số hàng khách sạn hiển thị ban đầu
  const gridColumns = useResponsiveGridColumns(); // Hook tính số cột grid responsive

  // Kiểm tra tính năng wishlist có khả dụng hay không (yêu cầu phải đăng nhập)
  const isWishlistEnabled = Boolean(currentUser);
  const wishlistSet = useMemo(() => new Set(wishlistHotelIds), [wishlistHotelIds]);

  // Lấy danh sách khách sạn nổi bật khi trang chủ được mount
  useEffect(() => {
    hotelAPI.getFeatured()
      .then((res) => { if (res.success) setHotels(res.data); })
      .catch(() => { })
      .finally(() => setLoadingHotels(false));
  }, []);

  // Lấy danh sách điểm đến phổ biến từ API
  useEffect(() => {
    locationAPI.getAll()
      .then((res) => { if (res.success) setDestinations(res.data); })
      .catch(() => { });
  }, []);

  // Tự động gom các địa chỉ khách sạn và tên điểm đến để tạo gợi ý nhập liệu (Datalist suggestions)
  const addressSuggestions = useMemo(() => {
    const destNames = destinations.map((d) => d.name);
    const locs = hotels.map((h) => h.location);
    return [...new Set([...destNames, ...locs])];
  }, [destinations, hotels]);

  // Xử lý gửi Form tìm kiếm, chuyển hướng sang trang /hotels kèm state địa chỉ tìm kiếm
  const handleSearch = (event) => {
    event?.preventDefault();
    navigate("/hotels", { 
      state: { 
        searchAddress: destination.trim(),
        checkin: checkin ? checkin.toISOString() : null,
        checkout: checkout ? checkout.toISOString() : null,
        adults,
        children,
        rooms
      } 
    });
  };



  // Xử lý khi click vào Card điểm đến, chuyển hướng nhanh sang trang tìm kiếm theo điểm đến đó
  const handleDestinationClick = (name) => {
    navigate("/hotels", { state: { searchAddress: name } });
  };

  // Pipeline xử lý bộ lọc cho danh sách khách sạn nổi bật ở trang chủ (chạy local trên client)
  const { filteredHotels, visibleHotels } = useHotelListing({
    hotelList: hotels,
    activeFilter,
    sortBy,
    visibleRows,
    gridColumns,
    filterOptions: HOTEL_FILTER_DEFAULTS,
    extraFilter: undefined,
  });



  return (
    <div className="app">
      {/* 1. Phần Hero banner lớn kèm ô tìm kiếm */}
      <section className="hero">
        <div className="hero-bg"><div className="hero-overlay" /></div>
        <div className="hero-content">
          <p className="hero-eyebrow">Ưu đãi lên đến 40% · Hơn 500,000 khách sạn toàn cầu</p>
          <h1 className="hero-title">Tìm chỗ nghỉ <span className="hero-highlight">hoàn hảo</span> của bạn</h1>
          <p className="hero-sub">Đặt phòng nhanh chóng, giá tốt nhất, không phí ẩn</p>

          {/* Hộp tìm kiếm khách sạn */}
          <form className="search-box" onSubmit={handleSearch}>
            {/* Trường nhập địa điểm */}
            <div className="search-field destination-field">
              <span className="field-icon">📍</span>
              <div className="search-field-body">
                <label>Địa chỉ / Khu vực</label>
                <input
                  className="search-address-input"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="VD: Quận 1, TP.HCM hoặc Đà Nẵng"
                  list="address-suggestions"
                />
                <datalist id="address-suggestions">
                  {addressSuggestions.map((item) => <option key={item} value={item} />)}
                </datalist>
              </div>
            </div>
            <div className="search-divider" />

            {/* Trường chọn ngày nhận phòng */}
            <div className="search-field">
              <span className="field-icon">📅</span>
              <div>
                <label>Nhận phòng</label>
                <DatePicker selected={checkin} onChange={setCheckin}
                  dateFormat="dd/MM/yyyy" placeholderText="Chọn ngày" minDate={new Date()} />
              </div>
            </div>
            <div className="search-divider" />

            {/* Trường chọn ngày trả phòng */}
            <div className="search-field">
              <span className="field-icon">📅</span>
              <div className="search-field-text">
                <label>Trả phòng</label>
                <DatePicker selected={checkout} onChange={setCheckout}
                  dateFormat="dd/MM/yyyy" placeholderText="Chọn ngày" minDate={checkin || new Date()} />
              </div>
            </div>

                        {/* Trường chọn số lượng khách và số phòng (Dropdown Popover nâng cấp) */}
            <div className="search-field guests-field-wrap">
              <span className="field-icon">👥</span>
              <div className="guests-trigger" onClick={() => setShowGuestsPopover(!showGuestsPopover)}>
                <label>Khách & Phòng</label>
                <span>{rooms} phòng, {adults + children} khách</span>
              </div>

              {showGuestsPopover && (
                <div className="guests-popover" onClick={(e) => e.stopPropagation()}>
                  {/* Dòng chọn số phòng */}
                  <div className="popover-row">
                    <span className="popover-label-title">Số phòng</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <button type="button" className="counter-btn" disabled={rooms <= 1} onClick={() => setRooms(rooms - 1)}>-</button>
                      <span className="counter-value">{rooms}</span>
                      <button type="button" className="counter-btn" disabled={rooms >= 8} onClick={() => setRooms(rooms + 1)}>+</button>
                    </div>
                  </div>
                  {/* Tương tự cho Người lớn và Trẻ em... */}
                  <button type="button" className="popover-close-btn" onClick={() => setShowGuestsPopover(false)}>Áp dụng</button>
                </div>
              )}
            </div>

            {/* Nút gửi tìm kiếm */}
            <button type="submit" className="search-btn">🔍 Tìm kiếm</button>
          </form>
        </div>
      </section>

      {/* 2. Danh mục Điểm đến phổ biến */}
      {destinations.length > 0 && (
        <section className="section destinations-section">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title">Điểm đến phổ biến</h2>
            </div>
            <div className="destinations-grid">
              {destinations.map((d) => (
                <div key={d.name} className="destination-card" onClick={() => handleDestinationClick(d.name)}>
                  <img src={d.img_url} alt={d.name} className="destination-img" />
                  <div className="destination-overlay">
                    <h3 className="destination-name">{d.name}</h3>
                    <p className="destination-hotels">{d.hotel_count?.toLocaleString()} khách sạn</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Danh sách Khách sạn nổi bật */}
      <section className="section hotels-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Khách sạn nổi bật</h2>
            <span className="result-count">{filteredHotels.length} khách sạn</span>
          </div>

          {/* Thanh Toolbar lọc & sắp xếp */}
          <div className="hotels-toolbar">
            {/* Nút lọc nhanh theo danh mục */}
            <div className="filter-bar">
              {HOTEL_FILTERS.map((f) => (
                <button key={f}
                  className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                  onClick={() => { setActiveFilter(f); setVisibleRows(4); }}>{f}</button>
              ))}
            </div>

            {/* Dropdown sắp xếp */}
            <div className="sort-wrap">
              <label className="sort-label">Sắp xếp:</label>
              <select className="sort-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setVisibleRows(4); }}>
                {HOTEL_SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingHotels ? (
            <div className="loading-wrap"><div className="loading-spinner" /><p>Đang tải...</p></div>
          ) : (
            <>
              {/* Lưới hiển thị các thẻ khách sạn */}
              <div className="hotels-grid">
                {visibleHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel}
                    // isBooked={bookedSet.has(Number(hotel.id))} // Đã hoàn tác
                    interactiveWishlist={isWishlistEnabled}
                    isWishlisted={wishlistSet.has(hotel.id)}
                    onWishlistToggle={onToggleWishlist}
                  />
                ))}
              </div>

              {/* Nút xem thêm khách sạn: Thay vì tải thêm tại chỗ (vì trang chủ chỉ giới hạn 8 khách sạn nổi bật),
                  nút này sẽ chuyển hướng (redirect) người dùng sang trang danh sách toàn bộ khách sạn (/hotels) */}
              <div className="load-more-wrap">
                <button className="load-more-btn" onClick={() => navigate("/hotels")}>
                  Xem thêm
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
