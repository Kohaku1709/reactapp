import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import BookingModal from "./BookingModal";
import { getDiscountPercent } from "../utils/hotelPricing";
import { useUser } from "../context/userContext";

function HotelCard({ hotel, interactiveWishlist = false, isWishlisted = false, onWishlistToggle }) {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const discount = getDiscountPercent(hotel);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!interactiveWishlist) return;
    onWishlistToggle?.(hotel.id);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (!currentUser) { navigate("/login"); return; }
    setShowBooking(true);
  };

  // API trả về image_url, data.js dùng image — hỗ trợ cả 2
  const imageUrl = hotel.image_url || hotel.image;

  return (
    <>
      <div className="hotel-card">
        <div className="hotel-img-wrap">
          <img src={imageUrl} alt={hotel.name} className="hotel-img" />
          {hotel.badge && <span className="hotel-badge">{hotel.badge}</span>}
          <span className="hotel-discount">-{discount}%</span>
          {interactiveWishlist && (
            <button className="wishlist-btn" onClick={handleWishlistClick}
              aria-pressed={isWishlisted} aria-label="Lưu vào danh sách yêu thích">
              {isWishlisted ? "❤️" : "♡"}
            </button>
          )}
        </div>
        <div className="hotel-info">
          <div className="hotel-header">
            <StarRating count={hotel.stars} />
            <span className="hotel-location">📍 {hotel.location}</span>
          </div>
          <h3 className="hotel-name">{hotel.name}</h3>
          <div className="hotel-tags">
            {(hotel.tags || []).map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="tag">{tag}</span>
            ))}
          </div>
          <div className="hotel-rating-row">
            <span className="rating-score">{hotel.rating}</span>
            <span className="rating-label">{hotel.rating > 4.7 ? "Xuất sắc" : "Tốt"}</span>
            <span className="rating-count">{Number(hotel.reviews).toLocaleString()} đánh giá</span>
          </div>
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

      {showBooking && (
        <BookingModal hotel={hotel} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
}

export default memo(HotelCard);
