import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UserProvider } from "./context/userContext";
import "./App.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HotelsPage = lazy(() => import("./pages/HotelsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));

const AUTH_STORAGE_KEY = "stayhtm_auth_user";
const WISHLIST_STORAGE_PREFIX = "stayhtm_wishlist_";

// Called by: các effect load/save wishlist trong App.
// Params: email. Accepted values: chuỗi email đã normalize lowercase.
// Output: key localStorage dạng stayhtm_wishlist_<email>.
// Does: tách dữ liệu wishlist theo từng tài khoản.
const getWishlistStorageKey = (email) =>
  `${WISHLIST_STORAGE_PREFIX}${email.toLowerCase()}`;

// Called by: main.jsx.
// Params: không có.
// Output: router tree + layout dùng chung + provider context.
// Does: giữ state auth/wishlist trung tâm, đồng bộ localStorage, cung cấp action cho toàn app.
export default function App() {
  // Init auth state từ localStorage (mount lần đầu).
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  // wishlistHotelIds: mảng số nguyên dương (id khách sạn) của user hiện tại.
  const [wishlistHotelIds, setWishlistHotelIds] = useState([]);

  // Does: đồng bộ currentUser vào localStorage, null thì xóa session auth.
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Called by: React effect khi currentUser thay đổi.
  // Params: currentUser. Accepted values: null hoặc { email, name }.
  // Output: setWishlistHotelIds với dữ liệu đã normalize/unique.
  // Does: nạp wishlist đúng tài khoản và chống dữ liệu bẩn từ localStorage.
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

  // Called by: React effect khi currentUser hoặc wishlistHotelIds đổi.
  // Params: currentUser, wishlistHotelIds.
  // Output: localStorage record mới.
  // Does: persist wishlist theo user hiện tại.
  useEffect(() => {
    if (!currentUser?.email) return;

    const storageKey = getWishlistStorageKey(currentUser.email);
    localStorage.setItem(storageKey, JSON.stringify(wishlistHotelIds));
  }, [currentUser, wishlistHotelIds]);

  // Called by: LoginPage thông qua onLogin trong context.
  // Params: email. Accepted values: chuỗi email không rỗng.
  // Output: currentUser mới dạng { email, name }.
  // Does: tạo user object demo từ email (name = phần trước @).
  const handleLogin = useCallback((email) => {
    const username = email.split("@")[0] || "bạn mới";
    setCurrentUser({ email, name: username });
  }, []);

  // Called by: Navbar thông qua onLogout trong context.
  // Params: không có.
  // Output: currentUser = null.
  // Does: kết thúc phiên đăng nhập hiện tại.
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // Called by: HomePage/HotelsPage/WishlistPage qua context action onToggleWishlist.
  // Params: hotelId. Accepted values: số nguyên dương tồn tại trong data khách sạn.
  // Output: wishlistHotelIds mới sau khi toggle.
  // Does: thêm id nếu chưa có, xóa id nếu đã có.
  const handleToggleWishlist = useCallback((hotelId) => {
    setWishlistHotelIds((prevWishlist) =>
      prevWishlist.includes(hotelId)
        ? prevWishlist.filter((id) => id !== hotelId)
        : [...prevWishlist, hotelId],
    );
  }, []);

  // UI state: true thì hiện nút Back to Top.
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Does: theo dõi scrollY để bật/tắt nút quay về đầu trang.
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 280;
      setShowBackToTop((prev) => (prev === shouldShow ? prev : shouldShow));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // Called by: click nút Back to Top.
  // Params: không có.
  // Output: viewport cuộn về top.
  // Does: scroll mượt bằng window.scrollTo({ behavior: "smooth" }).
  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <UserProvider
      // Provider payload: toàn bộ user state + action để các page đọc bằng useUser().
      currentUser={currentUser}
      wishlistHotelIds={wishlistHotelIds}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onToggleWishlist={handleToggleWishlist}
    >
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<div className="route-loading">Đang tải trang...</div>}>
          <Routes>

            <Route path="/" element={<HomePage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Suspense>
        <Footer />

        {showBackToTop && (
          <button className="back-to-top-btn" onClick={handleBackToTop} aria-label="Back to top">
            ↑
          </button>
        )}
      </BrowserRouter>
    </UserProvider>
  );
}
