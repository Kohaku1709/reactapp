import { memo } from "react";
import StarRating from "./StarRating";
import { getDiscountPercent } from "../utils/hotelPricing";

// Called by: HomePage/HotelsPage/WishlistPage khi map danh sách khách sạn.
// Params:
// - hotel: object khách sạn (id, name, location, rating, price, tags...)
// - interactiveWishlist: boolean (true cho phép toggle wishlist)
// - isWishlisted: boolean (trạng thái tim)
// - onWishlistToggle: function(hotelId)
// Output: 1 card khách sạn đầy đủ thông tin hiển thị.
// Does: render thông tin khách sạn + xử lý nút wishlist khi được bật.
function HotelCard({
    hotel,
    interactiveWishlist = false,
    isWishlisted = false,
    onWishlistToggle,
}) {
    const discount = getDiscountPercent(hotel);

    // Called by: click nút tim trên card.
    // Params: event click từ button.
    // Output: gọi onWishlistToggle(hotel.id) nếu interactiveWishlist=true.
    // Does: ngăn event nổi bọt và chuyển yêu cầu toggle lên component cha.
    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (!interactiveWishlist) return;
        onWishlistToggle?.(hotel.id);
    };

    return (
        <div className="hotel-card">
            <div className="hotel-img-wrap">
                <img src={hotel.image} alt={hotel.name} className="hotel-img" />
                {hotel.badge && <span className="hotel-badge">{hotel.badge}</span>}
                <span className="hotel-discount">-{discount}%</span>
                {interactiveWishlist && (
                    <button
                        className="wishlist-btn"
                        onClick={handleWishlistClick}
                        aria-pressed={isWishlisted}
                        aria-label="Lưu vào danh sách yêu thích"
                        title="Lưu vào yêu thích"
                    >
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
                    {hotel.tags.map((tag, idx) => (
                        <span key={`${tag}-${idx}`} className="tag">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="hotel-rating-row">
                    <span className="rating-score">{hotel.rating}</span>
                    <span className="rating-label">
                        {hotel.rating > 4.7 ? "Xuất sắc" : "Tốt"}
                    </span>
                    <span className="rating-count">
                        {hotel.reviews.toLocaleString()} đánh giá
                    </span>
                </div>
                <div className="hotel-price-row">
                    <div>
                        <span className="original-price">
                            {hotel.originalPrice.toLocaleString("vi-VN")}₫
                        </span>
                        <div className="current-price">
                            {hotel.price.toLocaleString("vi-VN")}₫
                            <span className="per-night">/đêm</span>
                        </div>
                    </div>
                    <button className="book-btn">Xem phòng</button>
                </div>
            </div>
        </div>
    );
}

export default memo(HotelCard);
