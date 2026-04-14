import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">StayVN</span>
        </NavLink>
        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/hotels"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Khách sạn
          </NavLink>
          <NavLink
            to="/about-us"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Giới thiệu
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Liên hệ
          </NavLink>
        </nav>
        <div className="header-actions">
          <button className="header-btn">Hỗ trợ</button>
          <button className="header-btn outlined">Đăng nhập</button>
        </div>
      </div>
    </header>
  );
}
