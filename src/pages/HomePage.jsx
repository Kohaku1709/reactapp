import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { hotels, destinations } from "../data";
import useResponsiveGridColumns from "../hooks/useResponsiveGridColumns";
import useHotelListing from "../hooks/useHotelListing";
import HotelCard from "../components/HotelCard";
import { useUser } from "../context/userContext";
import {
  HOTEL_FILTERS,
  HOTEL_FILTER_DEFAULTS,
  HOTEL_SORT_DEFAULT,
  HOTEL_SORT_OPTIONS,
  matchesDestination,
} from "../utils/hotelQuery";

// Called by: route "/" trong App.
// Params: không nhận props; đọc currentUser, wishlistHotelIds, onToggleWishlist từ useUser().
// Output: trang chủ gồm search box, điểm đến phổ biến, danh sách khách sạn.
// Does: điều phối toàn bộ luồng tìm kiếm ban đầu và chuyển sang trang /hotels.
export default function HomePage() {
  const { currentUser, wishlistHotelIds, onToggleWishlist } = useUser();
  const addressSuggestions = useMemo(() => {
    const destinationNames = destinations.map((item) => item.name);
    const locationNames = hotels.map((hotel) => hotel.location);
    return [...new Set([...destinationNames, ...locationNames])];
  }, []);

  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchDone, setSearchDone] = useState(false);
  const [visibleRows, setVisibleRows] = useState(4);
  const gridColumns = useResponsiveGridColumns();
  const [sortBy, setSortBy] = useState(HOTEL_SORT_DEFAULT);
  const navigate = useNavigate();
  const isWishlistEnabled = Boolean(currentUser);
  const wishlistSet = useMemo(
    () => new Set(wishlistHotelIds),
    [wishlistHotelIds],
  );

  // Called by: submit form tìm kiếm.
  // Params: event submit (có thể undefined nếu gọi thủ công).
  // Output: navigate("/hotels", { state: { searchAddress } }).
  // Does: chuẩn hóa destination, cập nhật UI state và gửi query qua route state.
  const handleSearch = (event) => {
    event?.preventDefault();

    const normalizedDestination = destination.trim();
    setDestination(normalizedDestination);
    setSearchDone(Boolean(normalizedDestination));

    navigate("/hotels", {
      state: {
        searchAddress: normalizedDestination,
      },
    });
  };

  // Called by: click card điểm đến ở section "Điểm đến phổ biến".
  // Params: selectedDestination. Accepted values: chuỗi tên điểm đến hợp lệ.
  // Output: destination/searchDone state mới.
  // Does: áp sẵn địa điểm để người dùng lọc nhanh.
  const handleDestinationClick = (selectedDestination) => {
    setDestination(selectedDestination);
    setSearchDone(true);
  };

  // filters: danh sách nhãn filter cố định lấy từ HOTEL_FILTERS.
  const filters = HOTEL_FILTERS;
  const destinationFilter = useMemo(
    () => (hotel) => matchesDestination(hotel.location, destination),
    [destination],
  );

  const { filteredHotels, visibleHotels, hasMoreHotels } = useHotelListing({
    hotelList: hotels,
    activeFilter,
    sortBy,
    visibleRows,
    gridColumns,
    filterOptions: HOTEL_FILTER_DEFAULTS,
    extraFilter: destinationFilter,
  });

  // Does: reset phân trang về 4 dòng khi tiêu chí lọc thay đổi để UX nhất quán.
  useEffect(() => {
    setVisibleRows(4);
  }, [activeFilter, destination, sortBy]);

  return (
    <div className="app">

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
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="VD: Quận 1, TP.HCM hoặc Đà Nẵng"
                  list="address-suggestions"
                />
                <datalist id="address-suggestions">
                  {addressSuggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="search-divider" />

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
              <div className="search-field-text">
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
            <button type="submit" className="search-btn">

              🔍 Tìm kiếm
            </button>
          </form>
        </div>
      </section>


      <section className="section destinations-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Điểm đến phổ biến</h2>
          </div>
          <div className="destinations-grid">
            {destinations.map((d) => (
              <div key={d.name} className="destination-card" onClick={() => handleDestinationClick(d.name)}>
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


      <section className="section hotels-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">{searchDone ? `Kết quả tại "${destination}"` : "Khách sạn nổi bật"}</h2>
            <span className="result-count">{filteredHotels.length} khách sạn</span>
          </div>
          <div className="hotels-toolbar">
            <div className="filter-bar">
              {filters.map((f) => (
                <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="sort-wrap">
              <label className="sort-label">Sắp xếp:</label>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {HOTEL_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="hotels-grid">

            {visibleHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                interactiveWishlist={isWishlistEnabled}
                isWishlisted={wishlistSet.has(hotel.id)}
                onWishlistToggle={onToggleWishlist}
              />
            ))}
          </div>
          {hasMoreHotels && (
            <div className="load-more-wrap">
              <button className="load-more-btn" onClick={() => setVisibleRows((prev) => prev + 4)}>
                Xem thêm
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
