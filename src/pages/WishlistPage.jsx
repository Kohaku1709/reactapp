import { useMemo } from "react";
import { Link } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import { useUser } from "../context/userContext";

// Component Trang danh sách yêu thích (Wishlist Page)
export default function WishlistPage() {
  // Lấy dữ liệu user và danh sách khách sạn yêu thích từ UserContext
  const { currentUser, wishlistHotelIds, onToggleWishlist, wishlistHotels } = useUser();
  
  // Tạo một Set chứa ID các khách sạn yêu thích để tối ưu hóa tốc độ tìm kiếm (O(1) thay vì O(N))
  const wishlistSet = useMemo(() => new Set(wishlistHotelIds), [wishlistHotelIds]);

  // Nếu chưa đăng nhập: Hiển thị màn hình thông báo yêu cầu đăng nhập
  if (!currentUser) {
    return (
      <div className="app page-with-header-offset">
        <div className="page-hero">
          <div className="page-hero-inner">
            <h1 className="page-hero-title">Danh sách yêu thích</h1>
            <p className="page-hero-sub">Đăng nhập để xem và quản lý wishlist của bạn</p>
          </div>
        </div>
        <section className="section section-white">
          <div className="section-inner">
            <div className="wishlist-empty">
              <h2 className="section-title">Bạn chưa đăng nhập</h2>
              <p>Hãy đăng nhập để lưu và đồng bộ khách sạn yêu thích theo tài khoản.</p>
              <Link to="/login" className="search-btn wishlist-login-link">Đăng nhập ngay</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // wishlistHotels được đồng bộ liên tục từ server trong tệp App.jsx
  const hotels = wishlistHotels || [];

  return (
    <div className="app page-with-header-offset">
      {/* Banner trang trí */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Danh sách yêu thích</h1>
          <p className="page-hero-sub">{hotels.length} khách sạn đã được bạn lưu lại</p>
        </div>
      </div>

      <section className="section hotels-section">
        <div className="section-inner">
          {hotels.length === 0 ? (
            // Khối hiển thị khi danh sách yêu thích rỗng
            <div className="wishlist-empty">
              <h2 className="section-title">Danh sách yêu thích đang trống</h2>
              <p>Bạn chưa thêm khách sạn nào vào danh sách yêu thích.</p>
              <Link to="/hotels" className="book-btn wishlist-browse-link">Khám phá khách sạn</Link>
            </div>
          ) : (
            // Khối hiển thị lưới các khách sạn yêu thích
            <>
              <div className="section-header hotels-result-header">
                <span className="result-count">{hotels.length} khách sạn yêu thích</span>
              </div>
              <div className="hotels-grid">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel}
                    interactiveWishlist isWishlisted={wishlistSet.has(hotel.id)}
                    onWishlistToggle={onToggleWishlist}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
