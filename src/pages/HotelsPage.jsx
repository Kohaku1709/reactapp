import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { hotels } from "../data";
import useResponsiveGridColumns from "../hooks/useResponsiveGridColumns";
import useHotelListing from "../hooks/useHotelListing";
import HotelCard from "../components/HotelCard";
import { useUser } from "../context/userContext";
import {
  HOTEL_FILTERS,
  HOTEL_SORT_DEFAULT,
  HOTEL_SORT_OPTIONS,
  HOTEL_FILTER_DEFAULTS,
  matchesDestination,
} from "../utils/hotelQuery";

// Called by: route "/hotels" trong App.
// Params: không nhận props; dùng state/action từ useUser().
// Output: danh sách khách sạn có filter, sort, lọc địa chỉ, load-more.
// Does: là trang listing chính sau khi người dùng tìm kiếm từ HomePage.
export default function HotelsPage() {
  const { currentUser, wishlistHotelIds, onToggleWishlist } = useUser();
  // routeLocation.state?.searchAddress nhận dữ liệu do HomePage gửi qua navigate.
  const routeLocation = useLocation();
  const initialSearchAddress = routeLocation.state?.searchAddress;
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState(HOTEL_SORT_DEFAULT);
  const [addressQuery, setAddressQuery] = useState(
    typeof initialSearchAddress === "string" ? initialSearchAddress.trim() : "",
  );
  const [visibleRows, setVisibleRows] = useState(4);
  const gridColumns = useResponsiveGridColumns();
  const filters = HOTEL_FILTERS;
  const isWishlistEnabled = Boolean(currentUser);
  const wishlistSet = useMemo(
    () => new Set(wishlistHotelIds),
    [wishlistHotelIds],
  );
  // addressFilter: hàm filter phụ truyền cho useHotelListing.
  const addressFilter = useMemo(
    () => (hotel) => matchesDestination(hotel.location, addressQuery),
    [addressQuery],
  );

  // Does: đồng bộ input địa chỉ khi state của route thay đổi.
  useEffect(() => {
    const searchAddress = routeLocation.state?.searchAddress;
    if (typeof searchAddress === "string") {
      setAddressQuery(searchAddress.trim());
    }
  }, [routeLocation.state]);

  // Does: dùng pipeline chung filter -> sort -> paginate để đảm bảo hành vi nhất quán.
  const { filteredHotels, visibleHotels, hasMoreHotels } = useHotelListing({
    hotelList: hotels,
    activeFilter,
    sortBy,
    visibleRows,
    gridColumns,
    filterOptions: HOTEL_FILTER_DEFAULTS,
    extraFilter: addressFilter,
  });

  // Does: reset visibleRows khi đổi filter/sort/address.
  useEffect(() => {
    setVisibleRows(4);
  }, [activeFilter, sortBy, addressQuery]);

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
              {filters.map((f) => (
                <button key={f} className={`filter-btn ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="sort-wrap">
              <label className="sort-label">Sắp xếp:</label>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {HOTEL_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="address-filter-wrap">
            <span className="address-filter-icon">📍</span>
            <input
              className="address-filter-input"
              value={addressQuery}
              onChange={(event) => setAddressQuery(event.target.value)}
              placeholder="Lọc nhanh theo địa chỉ..."
            />
            {addressQuery && (
              <button
                className="address-clear-btn"
                type="button"
                onClick={() => setAddressQuery("")}
              >
                Xóa
              </button>
            )}
          </div>

          <div className="section-header hotels-result-header">
            <span className="result-count">{filteredHotels.length} khách sạn được tìm thấy</span>
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
