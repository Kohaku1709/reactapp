import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import HotelsPage from "./pages/HotelsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";
import "./pages/pages.css";

const AUTH_STORAGE_KEY = "stayhtm_auth_user";

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

  // B3: Login giả lập cho đồ án.
  // Lấy phần trước @ làm tên hiển thị (vd: abc@gmail.com -> abc).
  const handleLogin = (email) => {
    const username = email.split("@")[0] || "bạn mới";
    setCurrentUser({ email, name: username });
  };

  // B4: Logout chỉ cần đưa currentUser về null.
  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    // Đặt Navbar + Footer ở đây để mọi trang dùng chung, tránh copy-paste trong từng page.
    <BrowserRouter>
      <Navbar currentUser={currentUser} onLogout={handleLogout} />
      <Routes>
        {/* Mỗi Route ánh xạ URL -> component, giúp điều hướng kiểu SPA (không reload cả trang). */}
        <Route path="/" element={<HomePage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Truyền currentUser + onLogin cho trang login xử lý điều hướng và cập nhật trạng thái. */}
        <Route path="/login" element={<LoginPage currentUser={currentUser} onLogin={handleLogin} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
