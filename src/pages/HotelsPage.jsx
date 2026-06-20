import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import { useUser } from "../context/userContext";
import { hotelAPI } from "../services/api";
import { HOTEL_FILTERS, HOTEL_SORT_DEFAULT, HOTEL_SORT_OPTIONS } from "../utils/hotelQuery";

// Component Trang danh sách toàn bộ khách sạn (Hotels Page)
export default function HotelsPage() {
  const { currentUser, wishlistHotelIds, onToggleWishlist } = useUser();
  const routeLocation = useLocation();
  const initialSearch = routeLocation.state?.searchAddress || "";

  // State quản lý danh sách khách sạn và trạng thái gọi API
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State quản lý bộ lọc và sắp xếp
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState(HOTEL_SORT_DEFAULT);
  const [addressQuery, setAddressQuery] = useState(typeof initialSearch === "string" ? initialSearch.trim() : "");

  // State quản lý Phân trang
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);


  const isWishlistEnabled = Boolean(currentUser);
  const wishlistSet = useMemo(() => new Set(wishlistHotelIds), [wishlistHotelIds]);

  // Gọi API
  const fetchHotels = useCallback(() => {
    Promise.resolve().then(() => {
      setLoading(true);
      setError("");
    });
    
    hotelAPI.getAll({ filter: activeFilter, sort: sortBy, search: addressQuery, limit: 100 })
      .then((res) => {
        if (res.success) setHotels(res.data);
        else setError("Không tải được danh sách khách sạn.");
      })
      .catch(() => setError("Không kết nối được server."))
      .finally(() => setLoading(false));
  }, [activeFilter, sortBy, addressQuery]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  // Reset về Trang 1 mỗi khi người dùng thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    Promise.resolve().then(() => {
      setCurrentPage(1);
    });
  }, [activeFilter, sortBy, addressQuery]);

  useEffect(() => {
    const s = routeLocation.state?.searchAddress;
    if (typeof s === "string") {
      Promise.resolve().then(() => {
        setAddressQuery(s.trim());
      });
    }
  }, [routeLocation.state]);

  // Cuộn lên đầu trang mỗi khi chuyển trang hoặc load lần đầu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Logic cắt mảng để hiển thị theo Trang hiện tại
  const totalPages = Math.ceil(hotels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleHotels = hotels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Các hàm điều hướng trang
  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="app page-with-header-offset">
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
              {HOTEL_FILTERS.map((f) => (
                <button key={f}
                  className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>

            <div className="sort-wrap">
              <label className="sort-label">Sắp xếp:</label>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {HOTEL_SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="address-filter-wrap">
            <span className="address-filter-icon">📍</span>
            <input
              className="address-filter-input"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              placeholder="Lọc nhanh theo địa chỉ..."
            />
            {addressQuery && (
              <button className="address-clear-btn" type="button" onClick={() => setAddressQuery("")}>
                Xóa
              </button>
            )}
          </div>

          <div className="section-header hotels-result-header">
            <span className="result-count">
              {loading ? "Đang tải..." : `${hotels.length} khách sạn được tìm thấy`}
            </span>
          </div>

          {error && <p style={{ color: "red", textAlign: "center", padding: "1rem" }}>{error}</p>}

          {loading ? (
            <div className="loading-wrap">
              <div className="loading-spinner" />
              <p>Đang tải khách sạn...</p>
            </div>
          ) : (
            <>
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

              {/* Thanh điều hướng phân trang (Đã tách CSS) */}
              {totalPages > 1 && (
                <div className="pagination-wrap">
                  <button 
                    className="load-more-btn" 
                    onClick={goToFirstPage} 
                    disabled={currentPage === 1}
                  >
                    Trang đầu
                  </button>
                  <button 
                    className="load-more-btn" 
                    onClick={goToPrevPage} 
                    disabled={currentPage === 1}
                  >
                    Trang trước
                  </button>
                  
                  <span className="pagination-info">
                    Trang {currentPage} / {totalPages}
                  </span>
                  
                  <button 
                    className="load-more-btn" 
                    onClick={goToNextPage} 
                    disabled={currentPage === totalPages}
                  >
                    Trang sau
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