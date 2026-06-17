import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UserProvider } from "./context/userContext";
import { getToken, removeToken, wishlistAPI } from "./services/api";
import "./App.css";

// Lazy loading các trang (pages) để tối ưu hiệu suất tải trang ban đầu (chỉ tải trang khi người dùng truy cập)
const HomePage     = lazy(() => import("./pages/HomePage"));
const AboutPage    = lazy(() => import("./pages/AboutPage"));
const HotelsPage   = lazy(() => import("./pages/HotelsPage"));
const ContactPage  = lazy(() => import("./pages/ContactPage"));
const LoginPage    = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));

// Khóa lưu trữ thông tin user đã đăng nhập trong localStorage
const AUTH_STORAGE_KEY = "stayhtm_auth_user";

export default function App() {
  // State lưu trữ thông tin người dùng hiện tại (nạp từ localStorage nếu có sẵn token)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const token = getToken();
      if (savedUser && token) return JSON.parse(savedUser);
      return null;
    } catch { return null; }
  });

  // State lưu trữ danh sách ID các khách sạn yêu thích (wishlist) của user
  const [wishlistHotelIds, setWishlistHotelIds] = useState([]);
  // State lưu trữ danh sách đầy đủ thông tin các khách sạn yêu thích
  const [wishlistHotels,   setWishlistHotels]   = useState([]);

  // Đồng bộ hóa thông tin currentUser với localStorage khi state thay đổi
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Tải danh sách wishlist (cả IDs và Object dữ liệu) từ Backend mỗi khi người dùng đăng nhập
  useEffect(() => {
    if (!currentUser || !getToken()) {
      Promise.resolve().then(() => {
        setWishlistHotelIds([]);
        setWishlistHotels([]);
      });
      return;
    }
    wishlistAPI.getAll()
      .then((res) => {
        if (res.success) {
          setWishlistHotelIds(res.wishlistIds || []);
          setWishlistHotels(res.data || []);
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // Xử lý khi đăng nhập thành công
  const handleLogin = useCallback((user) => {
    setCurrentUser({ id: user.id, email: user.email, name: user.name, role: user.role });
  }, []);

  // Xử lý khi đăng xuất: Xóa token, xóa thông tin user và làm trống wishlist
  const handleLogout = useCallback(() => {
    removeToken();
    setCurrentUser(null);
    setWishlistHotelIds([]);
    setWishlistHotels([]);
  }, []);

  // Xử lý thêm/bớt khách sạn khỏi danh sách yêu thích (wishlist)
  const handleToggleWishlist = useCallback((hotelId) => {
    if (!getToken()) return;
    
    // Cập nhật giao diện lập tức (Optimistic UI update) để tăng tốc độ phản hồi cho người dùng
    setWishlistHotelIds((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
    
    // Gửi yêu cầu cập nhật lên Backend và đồng bộ lại danh sách chính xác
    wishlistAPI.toggle(hotelId)
      .then((res) => {
        if (res.success) {
          return wishlistAPI.getAll(); // Tải lại danh sách đầy đủ để cập nhật thông tin
        }
      })
      .then((res) => {
        if (res?.success) {
          setWishlistHotelIds(res.wishlistIds || []);
          setWishlistHotels(res.data || []);
        }
      })
      .catch(() => {});
  }, []);

  // State và Effect quản lý nút cuộn nhanh về đầu trang (Back to Top)
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 280; // Hiển thị nút khi cuộn xuống qua 280px
      setShowBackToTop((prev) => prev === shouldShow ? prev : shouldShow);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cuộn mượt (smooth) lên đầu trang khi click nút
  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <UserProvider
      currentUser={currentUser}
      wishlistHotelIds={wishlistHotelIds}
      wishlistHotels={wishlistHotels}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onToggleWishlist={handleToggleWishlist}
    >
      <BrowserRouter>
        {/* Navbar đầu trang */}
        <Navbar />
        
        {/* Suspense hiển thị trạng thái chờ trong khi Lazy Loading các trang */}
        <Suspense fallback={<div className="route-loading">Đang tải trang...</div>}>
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/hotels"   element={<HotelsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/contact"  element={<ContactPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile"  element={<ProfilePage />} />
            <Route path="/admin"    element={<AdminDashboardPage />} />
          </Routes>
        </Suspense>
        
        {/* Footer cuối trang */}
        <Footer />
        
        {/* Nút cuộn về đầu trang */}
        {showBackToTop && (
          <button className="back-to-top-btn" onClick={handleBackToTop} aria-label="Back to top">↑</button>
        )}
      </BrowserRouter>
    </UserProvider>
  );
}
