import { memo, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";

function Navbar() {
  const { currentUser, onLogout } = useUser();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    onLogout();
    navigate("/");
  }, [navigate, onLogout]);

  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">StayHTM</span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Trang chủ
          </NavLink>
          <NavLink to="/hotels" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Khách sạn
          </NavLink>
          {currentUser && (
            <>
              <NavLink to="/wishlist" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Yêu thích
              </NavLink>
              <NavLink to="/bookings" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Đặt phòng
              </NavLink>
            </>
          )}
          <NavLink to="/about-us" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Giới thiệu
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Liên hệ
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link to="/contact" className="header-btn">Hỗ trợ</Link>
          {currentUser ? (
            <>
              <span className="header-user">Xin chào, {currentUser.name}</span>
              <button type="button" className="header-btn outlined" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-btn outlined">Đăng nhập</Link>
              <Link to="/register" className="header-btn" style={{ marginLeft: 6 }}>Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);
