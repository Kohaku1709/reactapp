import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HotelsPage = lazy(() => import("./pages/HotelsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));

const AUTH_STORAGE_KEY = "stayhtm_auth_user";
const WISHLIST_STORAGE_PREFIX = "stayhtm_wishlist_";

const getWishlistStorageKey = (email) =>
  `${WISHLIST_STORAGE_PREFIX}${email.toLowerCase()}`;

export default function App() {
  // B1: Khi app mở, thử đọc user từ localStorage để giữ trạng thái đăng nhập sau khi F5.
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [wishlistHotelIds, setWishlistHotelIds] = useState([]);

  // B2: Mỗi lần currentUser thay đổi, đồng bộ lại localStorage.
  // - Có user: lưu lại.
  // - Không có user: xóa key để coi như đã logout.
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Khi đổi user, nạp wishlist tương ứng từ localStorage theo email.
  useEffect(() => {
    if (!currentUser?.email) {
      setWishlistHotelIds([]);
      return;
    }

    try {
      const storageKey = getWishlistStorageKey(currentUser.email);
      const rawWishlist = localStorage.getItem(storageKey);
      const parsedWishlist = rawWishlist ? JSON.parse(rawWishlist) : [];
      const normalizedWishlist = Array.isArray(parsedWishlist)
        ? parsedWishlist
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0)
        : [];

      setWishlistHotelIds([...new Set(normalizedWishlist)]);
    } catch {
      setWishlistHotelIds([]);
    }
  }, [currentUser]);

  // Đồng bộ wishlist theo từng tài khoản đăng nhập.
  useEffect(() => {
    if (!currentUser?.email) return;

    const storageKey = getWishlistStorageKey(currentUser.email);
    localStorage.setItem(storageKey, JSON.stringify(wishlistHotelIds));
  }, [currentUser, wishlistHotelIds]);

  // B3: Login giả lập cho đồ án.
  // Lấy phần trước @ làm tên hiển thị (vd: abc@gmail.com -> abc).
  const handleLogin = useCallback((email) => {
    const username = email.split("@")[0] || "bạn mới";
    setCurrentUser({ email, name: username });
  }, []);

  // B4: Logout chỉ cần đưa currentUser về null.
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const handleToggleWishlist = useCallback((hotelId) => {
    setWishlistHotelIds((prevWishlist) =>
      prevWishlist.includes(hotelId)
        ? prevWishlist.filter((id) => id !== hotelId)
        : [...prevWishlist, hotelId],
    );
  }, []);

  // State để hiển thị nút Back to Top khi cuộn xuống đủ xa.
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Lắng nghe sự kiện scroll để cập nhật showBackToTop.
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 280;
      setShowBackToTop((prev) => (prev === shouldShow ? prev : shouldShow));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // Hàm cuộn mượt về đầu trang khi nhấn nút Back to Top.
  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    // Đặt Navbar + Footer ở đây để mọi trang dùng chung, tránh copy-paste trong từng page.
    <BrowserRouter>
      <Navbar currentUser={currentUser} onLogout={handleLogout} />
      <Suspense fallback={<div className="route-loading">Đang tải trang...</div>}>
        <Routes>
          {/* Mỗi Route ánh xạ URL -> component, giúp điều hướng kiểu SPA (không reload cả trang). */}
          <Route
            path="/"
            element={
              <HomePage
                currentUser={currentUser}
                wishlistHotelIds={wishlistHotelIds}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route
            path="/hotels"
            element={
              <HotelsPage
                currentUser={currentUser}
                wishlistHotelIds={wishlistHotelIds}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                currentUser={currentUser}
                wishlistHotelIds={wishlistHotelIds}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Truyền currentUser + onLogin cho trang login xử lý điều hướng và cập nhật trạng thái. */}
          <Route path="/login" element={<LoginPage currentUser={currentUser} onLogin={handleLogin} />} />
        </Routes>
      </Suspense>
      <Footer />
      {/* Nút Back to Top */}
      {showBackToTop && (
        <button className="back-to-top-btn" onClick={handleBackToTop} aria-label="Back to top">
          ↑
        </button>
      )}
    </BrowserRouter>
  );
}
