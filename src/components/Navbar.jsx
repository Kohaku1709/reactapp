import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">StayHTM</span>
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
          <Link to="/contact" className="header-btn">
            Hỗ trợ
          </Link>
          {currentUser ? (
            <>
              <span className="header-user">Xin chào, {currentUser.name}</span>
              <button type="button" className="header-btn outlined" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="header-btn outlined">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
