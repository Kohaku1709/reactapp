import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import BookingModal from "./BookingModal";
import { getDiscountPercent } from "../utils/hotelPricing";
import { useUser } from "../context/userContext";

// Component card thông tin khách sạn đơn lẻ hiển thị trên grid (isBooked = false đã được hoàn tác)
function HotelCard({ hotel, interactiveWishlist = false, isWishlisted = false, onWishlistToggle }) {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  // State quản lý việc hiển thị Modal đặt phòng
  const [showBooking, setShowBooking] = useState(false);
  // Tính tỷ lệ phần trăm giảm giá của khách sạn
  const discount = getDiscountPercent(hotel);

  // Xử lý khi click vào biểu tượng trái tim yêu thích (ngăn sự kiện lan truyền click vào card)
  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!interactiveWishlist) return;
    onWishlistToggle?.(hotel.id);
  };

  // Xử lý khi click nút Đặt phòng
  const handleBookClick = (e) => {
    e.stopPropagation();
    // Nếu chưa đăng nhập, chuyển hướng sang trang Login
    if (!currentUser) { navigate("/login"); return; }
    // Nếu đã đăng nhập, mở modal đặt phòng
    setShowBooking(true);
  };

  // Tương thích ảnh hiển thị từ API (image_url) và mock data (image)
  const imageUrl = hotel.image_url || hotel.image;

  return (
    <>
      <div className="hotel-card">
        {/* Phần ảnh và các nhãn (badge) nổi bật */}
        <div className="hotel-img-wrap">
          <img src={imageUrl} alt={hotel.name} className="hotel-img" />
          {hotel.badge && <span className="hotel-badge">{hotel.badge}</span>}
          <span className="hotel-discount">-{discount}%</span>
          {/* Biểu tượng yêu thích (Trái tim) */}
          {interactiveWishlist && (
            <button className="wishlist-btn" onClick={handleWishlistClick}
              aria-pressed={isWishlisted} aria-label="Lưu vào danh sách yêu thích">
              {isWishlisted ? "❤️" : "♡"}
            </button>
          )}
        </div>
        
        {/* Phần nội dung chi tiết khách sạn bên dưới */}
        <div className="hotel-info">
          <div className="hotel-header">
            {/* Hiển thị số sao */}
            <StarRating count={hotel.stars} />
            <span className="hotel-location">📍 {hotel.location}</span>
          </div>
          <h3 className="hotel-name">{hotel.name}</h3>
          
          {/* Danh sách các nhãn tiện ích (wifi, hồ bơi, spa...) */}
          <div className="hotel-tags">
            {(hotel.tags || []).map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="tag">{tag}</span>
            ))}
          </div>
          
          {/* Dòng hiển thị đánh giá và lượt đánh giá */}
          <div className="hotel-rating-row">
            <span className="rating-score">{hotel.rating}</span>
            <span className="rating-label">{hotel.rating > 4.7 ? "Xuất sắc" : "Tốt"}</span>
            <span className="rating-count">{Number(hotel.reviews).toLocaleString()} đánh giá</span>
          </div>
          
          {/* Khối hiển thị giá phòng và nút Đặt phòng */}
          <div className="hotel-price-row">
            <div>
              <span className="original-price">
                {Number(hotel.original_price || hotel.originalPrice).toLocaleString("vi-VN")}₫
              </span>
              <div className="current-price">
                {Number(hotel.price).toLocaleString("vi-VN")}₫
                <span className="per-night">/đêm</span>
                </div> 
            </div>
            <button className="book-btn" onClick={handleBookClick}>
              {currentUser ? "Đặt phòng" : "Xem phòng"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal đặt phòng hiển thị khi state showBooking = true */}
      {showBooking && (
        <BookingModal hotel={hotel} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
}

export default memo(HotelCard);
