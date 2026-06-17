import { memo, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";

// Component thanh menu điều hướng trên cùng (Navbar)
// - memo được sử dụng để tránh việc component re-render khi các component cha render lại mà props của Navbar không đổi.
function Navbar() {
  // Lấy thông tin user hiện tại và hàm logout từ UserContext
  const { currentUser, onLogout } = useUser();
  const navigate = useNavigate();

  // Hàm xử lý đăng xuất người dùng và điều hướng về trang chủ
  const handleLogout = useCallback(() => {
    onLogout();
    navigate("/");
  }, [navigate, onLogout]);

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo của ứng dụng, click sẽ quay về Trang chủ */}
        <NavLink to="/" className="logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">StayHTM</span>
        </NavLink>
        
        {/* Khối liên kết điều hướng chính */}
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Trang chủ
          </NavLink>
          <NavLink to="/hotels" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Khách sạn
          </NavLink>
          {/* Chỉ hiển thị menu Yêu thích và Đặt phòng khi người dùng đã đăng nhập */}
          {currentUser && (
            <>
              {currentUser.role === "admin" && (
                <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                  Quản trị Admin
                </NavLink>
              )}
              <NavLink to="/profile" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Trang cá nhân
              </NavLink>
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
        
        {/* Khu vực nút hành động (Auth & Support) bên phải */}
        <div className="header-actions">
          <Link to="/contact" className="header-btn">Hỗ trợ</Link>
          {currentUser ? (
            // Nếu đã đăng nhập: hiển thị lời chào và nút Đăng xuất
            <>
              <Link to="/profile" className="header-user" style={{ textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--muted)"}>
                👤 {currentUser.name}
              </Link>
              <button type="button" className="header-btn outlined" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            // Nếu chưa đăng nhập: hiển thị nút Đăng nhập và Đăng ký
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
