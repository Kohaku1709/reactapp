import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useResponsiveGridColumns from "../hooks/useResponsiveGridColumns";
import HotelCard from "../components/HotelCard";
import { useUser } from "../context/userContext";
import { hotelAPI } from "../services/api";
import { HOTEL_FILTERS, HOTEL_SORT_DEFAULT, HOTEL_SORT_OPTIONS } from "../utils/hotelQuery";

// Component Trang danh sách toàn bộ khách sạn (Hotels Page)
export default function HotelsPage() {
  const { currentUser, wishlistHotelIds, onToggleWishlist } = useUser();
  const routeLocation = useLocation();
  // Đọc từ khóa tìm kiếm được truyền từ Trang chủ nếu có
  const initialSearch = routeLocation.state?.searchAddress || "";

  // State quản lý danh sách khách sạn và trạng thái gọi API
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State quản lý bộ lọc và sắp xếp
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState(HOTEL_SORT_DEFAULT);

  // State lọc địa chỉ/tên khách sạn trực tiếp bằng ô input trên trang
  const [addressQuery, setAddressQuery] = useState(typeof initialSearch === "string" ? initialSearch.trim() : "");

  // State phân trang: quản lý số lượng card khách sạn hiển thị tối đa
  const [visibleCount, setVisibleCount] = useState(12);
  const gridColumns = useResponsiveGridColumns(); // Hook tính số cột grid responsive

  const isWishlistEnabled = Boolean(currentUser);
  const wishlistSet = useMemo(() => new Set(wishlistHotelIds), [wishlistHotelIds]);
  // const bookedSet = useMemo(() => new Set(bookedHotelIds || []), [bookedHotelIds]); // Đã hoàn tác

  // Gọi API tải danh sách khách sạn dựa trên các tiêu chí lọc, sắp xếp, tìm kiếm đã chọn
  // (Nhờ Backend cập nhật, quá trình lọc và sắp xếp này diễn ra hoàn toàn chính xác ở DB)
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

  // Kích hoạt gọi API mỗi khi các tham số lọc hoặc sắp xếp thay đổi
  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  // Tự động cuộn lên đầu trang khi trang được load/mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset số lượng khách sạn hiển thị về 12 mỗi khi người dùng đổi bộ lọc
  useEffect(() => {
    Promise.resolve().then(() => {
      setVisibleCount(12);
    });
  }, [activeFilter, sortBy, addressQuery]);

  // Đồng bộ lại ô tìm kiếm địa chỉ khi người dùng navigate từ Trang chủ qua (sử dụng State điều hướng)
  useEffect(() => {
    const s = routeLocation.state?.searchAddress;
    if (typeof s === "string") {
      Promise.resolve().then(() => {
        setAddressQuery(s.trim());
      });
    }
  }, [routeLocation.state]);

  // Cuộn trang về đầu khi component HotelsPage được tải lần đầu (mỗi khi navigate đến trang này)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Cắt lát (Slice) mảng để phân trang hiển thị thực tế trên UI
  const visibleHotels = hotels.slice(0, visibleCount);
  const hasMore = visibleCount < hotels.length;

  return (
    <div className="app page-with-header-offset">
      {/* Khối Banner trang trí đầu trang */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Tất cả khách sạn</h1>
          <p className="page-hero-sub">Tìm kiếm và đặt phòng từ hàng trăm khách sạn chất lượng</p>
        </div>
      </div>

      <section className="section hotels-section">
        <div className="section-inner">
          {/* Thanh Toolbar lọc & sắp xếp */}
          <div className="hotels-toolbar">
            {/* Bộ lọc nhanh */}
            <div className="filter-bar">
              {HOTEL_FILTERS.map((f) => (
                <button key={f}
                  className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>

            {/* Tiêu chí sắp xếp */}
            <div className="sort-wrap">
              <label className="sort-label">Sắp xếp:</label>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {HOTEL_SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ô nhập lọc nhanh theo địa chỉ/tên khách sạn */}
          <div className="address-filter-wrap">
            <span className="address-filter-icon">📍</span>
            <input
              className="address-filter-input"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              placeholder="Lọc nhanh theo địa chỉ..."
            />
            {/* Hiển thị nút Xóa nhanh từ khóa khi có chữ */}
            {addressQuery && (
              <button className="address-clear-btn" type="button" onClick={() => setAddressQuery("")}>
                Xóa
              </button>
            )}
          </div>

          {/* Dòng tóm tắt kết quả tìm kiếm */}
          <div className="section-header hotels-result-header">
            <span className="result-count">
              {loading ? "Đang tải..." : `${hotels.length} khách sạn được tìm thấy`}
            </span>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && <p style={{ color: "red", textAlign: "center", padding: "1rem" }}>{error}</p>}

          {loading ? (
            <div className="loading-wrap">
              <div className="loading-spinner" />
              <p>Đang tải khách sạn...</p>
            </div>
          ) : (
            <>
              {/* Lưới hiển thị danh sách thẻ khách sạn */}
              <div className="hotels-grid">
                {visibleHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    // isBooked={bookedSet.has(Number(hotel.id))} // Đã hoàn tác
                    interactiveWishlist={isWishlistEnabled}
                    isWishlisted={wishlistSet.has(hotel.id)}
                    onWishlistToggle={onToggleWishlist}
                  />
                ))}
              </div>

              {/* Nút Xem thêm */}
              {hasMore && (
                <div className="load-more-wrap">
                  <button className="load-more-btn"
                    onClick={() => setVisibleCount((p) => p + 4 * gridColumns)}>
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
