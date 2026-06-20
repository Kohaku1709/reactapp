import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/userContext";
import { authAPI, setToken } from "../services/api";

// Component Trang đăng nhập (Login Page)
export default function LoginPage() {
  // Lấy thông tin user hiện tại và hàm login callback từ UserContext
  const { currentUser, onLogin } = useUser();
  const navigate = useNavigate();
  
  // State quản lý chế độ form: "login" (đăng nhập), "forgot" (yêu cầu gửi OTP), "reset" (nhập OTP và đổi pass)
  const [mode, setMode] = useState("login");

  // State quản lý đăng nhập thường
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State quản lý khôi phục mật khẩu
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State quản lý báo lỗi, thông báo thành công và trạng thái loading
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý Google OAuth ID Token nhận được từ Client SDK
  const handleGoogleResponse = useCallback(async (response) => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await authAPI.googleLogin(response.credential);
      if (!res.success) {
        setError(res.message || "Đăng nhập bằng Google thất bại.");
        return;
      }
      // Lưu token vào localstorage và đồng bộ state
      setToken(res.data.token);
      onLogin(res.data.user);
      navigate("/");
    } catch {
      setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [onLogin, navigate]);

  // Khởi chạy Google Sign-In SDK sau khi nhúng ở index.html
  useEffect(() => {
    if (mode !== "login") return;

    const initGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // Client ID demo (sinh viên có thể đổi sang Client ID của mình trong production)
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1035987157833-2nfsb97d1t0e9epskm3eghl1lhjrt69p.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        
        const googleBtn = document.getElementById("google-signin-button");
        if (googleBtn) {
          window.google.accounts.id.renderButton(googleBtn, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular"
          });
        }
      }
    };

    // Gọi khởi tạo ngay
    initGoogleSignIn();

    // Thiết lập kiểm tra định kỳ đề phòng thư viện load trễ
    const timer = setInterval(() => {
      if (window.google) {
        initGoogleSignIn();
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [mode, handleGoogleResponse]);

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

  // Xử lý gửi yêu cầu mã xác nhận khôi phục mật khẩu qua Email
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!resetEmail.trim()) {
      setError("Vui lòng nhập địa chỉ Email.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(resetEmail.trim().toLowerCase());
      if (res.success) {
        setSuccessMsg("Mã xác nhận gồm 6 chữ số đã được gửi về Email của bạn.");
        setMode("reset");
      } else {
        setError(res.message || "Gửi yêu cầu thất bại.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác nhận OTP và cập nhật mật khẩu mới
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(
        resetEmail.trim().toLowerCase(),
        otp.trim(),
        newPassword.trim()
      );
      if (res.success) {
        setSuccessMsg("Đổi mật khẩu thành công! Đang chuyển về màn hình đăng nhập...");
        setTimeout(() => {
          setMode("login");
          setError("");
          setSuccessMsg("");
          setPassword("");
        }, 2500);
      } else {
        setError(res.message || "Đổi mật khẩu thất bại.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app page-with-header-offset">
      {/* Banner trang trí */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">
            {mode === "login" && "Đăng nhập"}
            {mode === "forgot" && "Quên mật khẩu"}
            {mode === "reset" && "Đặt lại mật khẩu"}
          </h1>
          <p className="page-hero-sub">
            {mode === "login" && "Đăng nhập để lưu khách sạn yêu thích và quản lý đặt phòng"}
            {mode === "forgot" && "Nhập email đăng ký để hệ thống gửi mã xác nhận"}
            {mode === "reset" && "Nhập mã xác nhận nhận được từ email và đặt lại mật khẩu mới"}
          </p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner login-form-wrap">
          
          {/* CHẾ ĐỘ 1: ĐĂNG NHẬP THƯỜNG / GOOGLE */}
          {mode === "login" && (
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label">Mật khẩu</label>
                  <button 
                    type="button" 
                    onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }}
                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", fontWeight: 600, padding: 0 }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Hiển thị lỗi */}
              {error && <p className="login-error">{error}</p>}
              {successMsg && <p className="login-success" style={{ color: "#10b981", fontSize: "13px", marginTop: "8px", textAlign: "center" }}>{successMsg}</p>}

              {/* Nút đăng nhập */}
              <button type="submit" className="search-btn form-submit-full" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div style={{ display: "flex", alignItems: "center", margin: "16px 0", color: "#888", fontSize: "12px" }}>
                <div style={{ flex: 1, height: "1px", background: "#eee" }}></div>
                <span style={{ padding: "0 10px" }}>HOẶC</span>
                <div style={{ flex: 1, height: "1px", background: "#eee" }}></div>
              </div>

              {/* Nút Đăng nhập bằng Google */}
              <div id="google-signin-button" style={{ display: "flex", justifyContent: "center" }}></div>

              {/* Gợi ý đăng ký và tài khoản demo */}
              <p className="login-note" style={{ marginTop: "20px" }}>
                Chưa có tài khoản?{" "}
                <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
                  Đăng ký ngay
                </Link>
              </p>
              <p className="login-note" style={{ marginTop: 4 }}>
                Demo: <strong>demo@stayhtm.com</strong> / <strong>demo1234</strong>
              </p>
            </form>
          )}

          {/* CHẾ ĐỘ 2: QUÊN MẬT KHẨU - YÊU CẦU GỬI OTP */}
          {mode === "forgot" && (
            <form className="contact-form" onSubmit={handleForgotPasswordSubmit}>
              <h3 className="form-title">Khôi phục mật khẩu</h3>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "16px", textAlign: "center" }}>
                Nhập Email tài khoản của bạn. Chúng tôi sẽ gửi một mã xác nhận gồm 6 chữ số để đặt lại mật khẩu mới.
              </p>

              <div className="form-group">
                <label className="form-label">Email tài khoản</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="email@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="search-btn form-submit-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Gửi mã xác nhận"}
              </button>

              <p className="login-note">
                <button 
                  type="button" 
                  onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                  style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}
                >
                  Quay lại đăng nhập
                </button>
              </p>
            </form>
          )}

          {/* CHẾ ĐỘ 3: ĐẶT LẠI MẬT KHẨU - NHẬP OTP & PASS MỚI */}
          {mode === "reset" && (
            <form className="contact-form" onSubmit={handleResetPasswordSubmit}>
              <h3 className="form-title">Nhập mã xác nhận</h3>
              
              {successMsg && <p className="login-success" style={{ color: "#10b981", fontSize: "12.5px", marginBottom: "12px", background: "#f0fdf4", padding: "10px", borderRadius: "6px", textAlign: "center" }}>{successMsg}</p>}

              <div className="form-group">
                <label className="form-label">Mã xác nhận (6 chữ số)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nhập mã 6 số"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="search-btn form-submit-full" disabled={loading}>
                {loading ? "Đang xác thực..." : "Xác nhận đổi mật khẩu"}
              </button>

              <p className="login-note">
                <button 
                  type="button" 
                  onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }}
                  style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", marginRight: "10px" }}
                >
                  Gửi lại mã
                </button>
                |
                <button 
                  type="button" 
                  onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                  style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", marginLeft: "10px" }}
                >
                  Quay lại đăng nhập
                </button>
              </p>
            </form>
          )}

        </div>
      </section>
    </div>
  );
}
