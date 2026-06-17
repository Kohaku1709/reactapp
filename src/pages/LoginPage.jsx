import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/userContext";
import { authAPI, setToken } from "../services/api";

// Component Trang đăng nhập (Login Page)
export default function LoginPage() {
  // Lấy thông tin user hiện tại và hàm login callback từ UserContext
  const { currentUser, onLogin } = useUser();
  const navigate = useNavigate();
  
  // State quản lý email, mật khẩu nhập vào, trạng thái loading và báo lỗi
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Điều hướng bảo vệ: Nếu đã đăng nhập thì tự động chuyển hướng về trang chủ
  if (currentUser) return <Navigate to="/" replace />;

  // Xử lý gửi Form đăng nhập lên Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Xác thực cơ bản dữ liệu nhập
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng nhập từ authAPI
      const res = await authAPI.login(email.trim().toLowerCase(), password.trim());
      if (!res.success) {
        setError(res.message || "Đăng nhập thất bại.");
        return;
      }
      // Lưu trữ JWT token vào LocalStorage để duy trì trạng thái đăng nhập
      setToken(res.data.token);
      
      // Đồng bộ thông tin user vào Context toàn cục
      onLogin(res.data.user);
      
      // Chuyển hướng người dùng về Trang chủ sau khi đăng nhập thành công
      navigate("/");
    } catch {
      setError("Không kết nối được server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app page-with-header-offset">
      {/* Banner trang trí */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Đăng nhập</h1>
          <p className="page-hero-sub">Đăng nhập để lưu khách sạn yêu thích và quản lý đặt phòng</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner login-form-wrap">
          {/* Form đăng nhập */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3 className="form-title">Tài khoản StayHTM</h3>

            {/* Ô nhập Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Ô nhập Mật khẩu */}
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input
                className="form-input"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Hiển thị thông tin báo lỗi nếu đăng nhập thất bại */}
            {error && <p className="login-error">{error}</p>}

            {/* Nút đăng nhập */}
            <button type="submit" className="search-btn form-submit-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Gợi ý đăng ký và tài khoản demo */}
            <p className="login-note">
              Chưa có tài khoản?{" "}
              <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Đăng ký ngay
              </Link>
            </p>
            <p className="login-note" style={{ marginTop: 4 }}>
              Demo: <strong>demo@stayhtm.com</strong> / <strong>demo1234</strong>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
