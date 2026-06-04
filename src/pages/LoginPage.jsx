import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/userContext";
import { authAPI, setToken } from "../services/api";

export default function LoginPage() {
  const { currentUser, onLogin } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login(email.trim().toLowerCase(), password.trim());
      if (!res.success) {
        setError(res.message || "Đăng nhập thất bại.");
        return;
      }
      setToken(res.data.token);
      onLogin(res.data.user);
      navigate("/");
    } catch {
      setError("Không kết nối được server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app page-with-header-offset">
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Đăng nhập</h1>
          <p className="page-hero-sub">Đăng nhập để lưu khách sạn yêu thích và quản lý đặt phòng</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner login-form-wrap">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3 className="form-title">Tài khoản StayHTM</h3>

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

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="search-btn form-submit-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

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
