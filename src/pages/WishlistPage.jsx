import { useMemo } from "react";
import { Link } from "react-router-dom";
import { hotels } from "../data";
import HotelCard from "../components/HotelCard";

export default function WishlistPage({
    currentUser,
    wishlistHotelIds = [],
    onToggleWishlist = () => { },
}) {
    const wishlistSet = useMemo(
        () => new Set(wishlistHotelIds),
        [wishlistHotelIds],
    );
    const wishlistHotels = useMemo(
        () => hotels.filter((hotel) => wishlistSet.has(hotel.id)),
        [wishlistSet],
    );

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
                            <Link to="/login" className="search-btn wishlist-login-link">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="app page-with-header-offset">
            <div className="page-hero">
                <div className="page-hero-inner">
                    <h1 className="page-hero-title">Danh sách yêu thích</h1>
                    <p className="page-hero-sub">{wishlistHotels.length} khách sạn đã được bạn lưu lại</p>
                </div>
            </div>

            <section className="section hotels-section">
                <div className="section-inner">
                    {wishlistHotels.length === 0 ? (
                        <div className="wishlist-empty">
                            <h2 className="section-title">Wishlist đang trống</h2>
                            <p>Bạn chưa thêm khách sạn nào vào danh sách yêu thích.</p>
                            <Link to="/hotels" className="book-btn wishlist-browse-link">
                                Khám phá khách sạn
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="section-header hotels-result-header">
                                <span className="result-count">{wishlistHotels.length} khách sạn yêu thích</span>
                            </div>
                            <div className="hotels-grid">
                                {wishlistHotels.map((hotel) => (
                                    <HotelCard
                                        key={hotel.id}
                                        hotel={hotel}
                                        interactiveWishlist
                                        isWishlisted
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
