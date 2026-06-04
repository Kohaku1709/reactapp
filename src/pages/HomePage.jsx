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

export default function HomePage() {
  const { currentUser, wishlistHotelIds, onToggleWishlist } = useUser();
  const navigate = useNavigate();

  const [hotels, setHotels]           = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const [destination, setDestination] = useState("");
  const [checkin, setCheckin]         = useState(null);
  const [checkout, setCheckout]       = useState(null);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [sortBy, setSortBy]           = useState(HOTEL_SORT_DEFAULT);
  const [visibleRows, setVisibleRows] = useState(4);
  const gridColumns = useResponsiveGridColumns();

  const isWishlistEnabled = Boolean(currentUser);
  const wishlistSet = useMemo(() => new Set(wishlistHotelIds), [wishlistHotelIds]);

  // Lấy khách sạn nổi bật từ API
  useEffect(() => {
    hotelAPI.getFeatured()
      .then((res) => { if (res.success) setHotels(res.data); })
      .catch(() => {})
      .finally(() => setLoadingHotels(false));
  }, []);

  // Lấy danh sách điểm đến từ API
  useEffect(() => {
    locationAPI.getAll()
      .then((res) => { if (res.success) setDestinations(res.data); })
      .catch(() => {});
  }, []);

  const addressSuggestions = useMemo(() => {
    const destNames = destinations.map((d) => d.name);
    const locs = hotels.map((h) => h.location);
    return [...new Set([...destNames, ...locs])];
  }, [destinations, hotels]);

  const handleSearch = (event) => {
    event?.preventDefault();
    navigate("/hotels", { state: { searchAddress: destination.trim() } });
  };

  const handleDestinationClick = (name) => {
    navigate("/hotels", { state: { searchAddress: name } });
  };

  // Pipeline filter cho section "Khách sạn nổi bật" dùng data từ API
  const { filteredHotels, visibleHotels, hasMoreHotels } = useHotelListing({
    hotelList: hotels,
    activeFilter,
    sortBy,
    visibleRows,
    gridColumns,
    filterOptions: HOTEL_FILTER_DEFAULTS,
    extraFilter: undefined,
  });

  useEffect(() => { setVisibleRows(4); }, [activeFilter, sortBy]);

  return (
    <div className="app">
      {/* Hero search */}
      <section className="hero">
        <div className="hero-bg"><div className="hero-overlay" /></div>
        <div className="hero-content">
          <p className="hero-eyebrow">Ưu đãi lên đến 40% · Hơn 500,000 khách sạn toàn cầu</p>
          <h1 className="hero-title">Tìm chỗ nghỉ <span className="hero-highlight">hoàn hảo</span> của bạn</h1>
          <p className="hero-sub">Đặt phòng nhanh chóng, giá tốt nhất, không phí ẩn</p>
          <form className="search-box" onSubmit={handleSearch}>
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
            <div className="search-field">
              <span className="field-icon">📅</span>
              <div>
                <label>Nhận phòng</label>
                <DatePicker selected={checkin} onChange={setCheckin}
                  dateFormat="dd/MM/yyyy" placeholderText="Chọn ngày" minDate={new Date()} />
              </div>
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <span className="field-icon">📅</span>
              <div className="search-field-text">
                <label>Trả phòng</label>
                <DatePicker selected={checkout} onChange={setCheckout}
                  dateFormat="dd/MM/yyyy" placeholderText="Chọn ngày" minDate={checkin || new Date()} />
              </div>
            </div>
            <button type="submit" className="search-btn">🔍 Tìm kiếm</button>
          </form>
        </div>
      </section>

      {/* Điểm đến phổ biến */}
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

      {/* Khách sạn nổi bật */}
      <section className="section hotels-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Khách sạn nổi bật</h2>
            <span className="result-count">{filteredHotels.length} khách sạn</span>
          </div>
          <div className="hotels-toolbar">
            <div className="filter-bar">
              {HOTEL_FILTERS.map((f) => (
                <button key={f}
                  className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="sort-wrap">
              <label className="sort-label">Sắp xếp:</label>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
              <div className="hotels-grid">
                {visibleHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel}
                    interactiveWishlist={isWishlistEnabled}
                    isWishlisted={wishlistSet.has(hotel.id)}
                    onWishlistToggle={onToggleWishlist}
                  />
                ))}
              </div>
              {hasMoreHotels && (
                <div className="load-more-wrap">
                  <button className="load-more-btn" onClick={() => setVisibleRows((p) => p + 4)}>
                    Xem thêm
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
