import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/userContext";
import { authAPI, setToken } from "../services/api";

// Component Trang đăng ký (Register Page)
export default function RegisterPage() {
  // Lấy thông tin user hiện tại và callback login để lưu vào Context
  const { currentUser, onLogin } = useUser();
  const navigate = useNavigate();
  // State quản lý toàn bộ các trường nhập liệu trong form
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  // State quản lý báo lỗi và trạng thái loading khi gửi API
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Điều hướng bảo vệ: Nếu đã đăng nhập thì tự động chuyển hướng về trang chủ
  if (currentUser) return <Navigate to="/" replace />;

  // Hàm cập nhật state form khi người dùng nhập dữ liệu vào ô input tương ứng
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Xử lý gửi yêu cầu đăng ký lên Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, confirm } = form;
    
    // Xác thực các quy tắc đầu vào cơ bản ở client
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin."); return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự."); return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp."); return;
    }

    setLoading(true);
    try {
      // Gọi API đăng ký từ authAPI
      const res = await authAPI.register(email.trim().toLowerCase(), password, name.trim());
      if (!res.success) {
        setError(res.message || (res.errors?.[0]?.msg) || "Đăng ký thất bại.");
        return;
      }
      
      // Đăng ký thành công -> Tự động đăng nhập người dùng bằng cách lưu token
      setToken(res.data.token);
      
      // Đồng bộ thông tin user vào Context toàn cục
      onLogin(res.data.user);
      
      // Điều hướng về trang chủ
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
          <h1 className="page-hero-title">Đăng ký</h1>
          <p className="page-hero-sub">Tạo tài khoản để trải nghiệm đặt phòng tiện lợi hơn</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner login-form-wrap">
          {/* Form đăng ký */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3 className="form-title">Tạo tài khoản mới</h3>

            {/* Ô nhập Họ và tên */}
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input className="form-input" name="name" placeholder="Nguyễn Văn A"
                value={form.name} onChange={handleChange} disabled={loading} />
            </div>

            {/* Ô nhập Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" name="email" type="email" placeholder="email@example.com"
                value={form.email} onChange={handleChange} disabled={loading} />
            </div>

            {/* Ô nhập Mật khẩu */}
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input className="form-input" name="password" type="password" placeholder="Ít nhất 6 ký tự"
                value={form.password} onChange={handleChange} disabled={loading} />
            </div>

            {/* Ô nhập lại mật khẩu xác nhận */}
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input className="form-input" name="confirm" type="password" placeholder="Nhập lại mật khẩu"
                value={form.confirm} onChange={handleChange} disabled={loading} />
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && <p className="login-error">{error}</p>}

            {/* Nút gửi */}
            <button type="submit" className="search-btn form-submit-full" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            {/* Liên kết quay lại trang đăng nhập */}
            <p className="login-note">
              Đã có tài khoản?{" "}
              <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
