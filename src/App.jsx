import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UserProvider } from "./context/userContext";
import { getToken, removeToken, wishlistAPI } from "./services/api";
import "./App.css";

const HomePage     = lazy(() => import("./pages/HomePage"));
const AboutPage    = lazy(() => import("./pages/AboutPage"));
const HotelsPage   = lazy(() => import("./pages/HotelsPage"));
const ContactPage  = lazy(() => import("./pages/ContactPage"));
const LoginPage    = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));

const AUTH_STORAGE_KEY = "stayhtm_auth_user";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const token = getToken();
      if (savedUser && token) return JSON.parse(savedUser);
      return null;
    } catch { return null; }
  });

  const [wishlistHotelIds, setWishlistHotelIds] = useState([]);
  const [wishlistHotels,   setWishlistHotels]   = useState([]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Khi đăng nhập → tải toàn bộ wishlist (IDs + objects) từ server
  useEffect(() => {
    if (!currentUser || !getToken()) {
      setWishlistHotelIds([]);
      setWishlistHotels([]);
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

  const handleLogin = useCallback((user) => {
    setCurrentUser({ id: user.id, email: user.email, name: user.name });
  }, []);

  const handleLogout = useCallback(() => {
    removeToken();
    setCurrentUser(null);
    setWishlistHotelIds([]);
    setWishlistHotels([]);
  }, []);

  const handleToggleWishlist = useCallback((hotelId) => {
    if (!getToken()) return;
    // Optimistic UI update
    setWishlistHotelIds((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
    // Sync với server; nếu thành công cũng sync lại full wishlist objects
    wishlistAPI.toggle(hotelId)
      .then((res) => {
        if (res.success) {
          // Refresh full wishlist để có đủ thông tin hotel
          return wishlistAPI.getAll();
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

  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 280;
      setShowBackToTop((prev) => prev === shouldShow ? prev : shouldShow);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <Navbar />
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
          </Routes>
        </Suspense>
        <Footer />
        {showBackToTop && (
          <button className="back-to-top-btn" onClick={handleBackToTop} aria-label="Back to top">↑</button>
        )}
      </BrowserRouter>
    </UserProvider>
  );
}
