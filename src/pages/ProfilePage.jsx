import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { authAPI, setToken } from "../services/api";

export default function ProfilePage() {
  const { currentUser, onLogin } = useUser();

  // State cập nhật thông tin cá nhân
  const [name, setName] = useState(() => currentUser?.name || "");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  // State thay đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Điều hướng bảo vệ: Nếu chưa đăng nhập thì tự động chuyển hướng về trang login
  if (!currentUser) return <Navigate to="/login" replace />;

  // Xử lý gửi cập nhật tên hiển thị
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess("");

    if (!name.trim()) {
      setNameError("Tên hiển thị không được để trống.");
      return;
    }

    setNameLoading(true);
    try {
      const res = await authAPI.updateMe({ name: name.trim() });
      if (!res.success) {
        setNameError(res.message || "Cập nhật tên thất bại.");
        return;
      }
      
      // Cập nhật lại token mới nhận được từ API và đồng bộ hóa state
      setToken(res.data.token);
      onLogin(res.data.user);
      setNameSuccess("Đã cập nhật tên hiển thị thành công!");
    } catch {
      setNameError("Lỗi kết nối máy chủ.");
    } finally {
      setNameLoading(false);
    }
  };

  // Xử lý gửi cập nhật mật khẩu mới
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("Vui lòng điền đầy đủ thông tin mật khẩu.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("Mật khẩu mới phải từ 6 ký tự trở lên.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setPassLoading(true);
    try {
      const res = await authAPI.updateMe({
        currentPassword,
        newPassword
      });

      if (!res.success) {
        setPassError(res.message || "Đổi mật khẩu thất bại.");
        return;
      }

      // Đổi mật khẩu thành công -> Cập nhật token và xóa trắng form mật khẩu
      setToken(res.data.token);
      onLogin(res.data.user);
      setPassSuccess("Thay đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPassError("Lỗi kết nối máy chủ hoặc mật khẩu hiện tại không đúng.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="app page-with-header-offset">
      {/* Banner trang trí đầu trang */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Trang cá nhân</h1>
          <p className="page-hero-sub">Quản lý thông tin cá nhân và cài đặt bảo mật tài khoản của bạn</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner profile-container" style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2.5rem", marginTop: "2rem" }}>
            
            {/* Cột 1: Quản lý thông tin cá nhân */}
            <div className="profile-card" style={{ background: "#ffffff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
              <h3 className="form-title" style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--text)", marginBottom: "1.5rem", borderBottom: "2px solid var(--primary-light, #f0f0f0)", paddingBottom: "0.5rem" }}>
                Thông tin cá nhân
              </h3>
              
              <form onSubmit={handleUpdateName}>
                {/* Trường hiển thị Email (không cho sửa) */}
                <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                  <label className="form-label" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Email tài khoản</label>
                  <input
                    className="form-input"
                    type="email"
                    value={currentUser.email}
                    disabled
                    style={{ background: "#f8f9fa", cursor: "not-allowed", opacity: 0.8 }}
                  />
                </div>

                {/* Trường sửa Tên hiển thị */}
                <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                  <label className="form-label" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Tên hiển thị</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Nhập tên hiển thị"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={nameLoading}
                  />
                </div>

                {/* Phân quyền tài khoản */}
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Vai trò hệ thống</label>
                  <span style={{ display: "inline-block", background: currentUser.role === "admin" ? "#ffebee" : "#e8f5e9", color: currentUser.role === "admin" ? "#d32f2f" : "#2e7d32", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600 }}>
                    {currentUser.role === "admin" ? "Quản trị viên (Admin)" : "Thành viên (User)"}
                  </span>
                </div>

                {nameError && <p className="login-error" style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: 4 }}>{nameError}</p>}
                {nameSuccess && <p style={{ color: "#2e7d32", fontSize: "0.85rem", marginTop: 4, fontWeight: 500 }}>{nameSuccess}</p>}

                <button type="submit" className="search-btn form-submit-full" disabled={nameLoading} style={{ marginTop: "1rem" }}>
                  {nameLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>
              </form>
            </div>

            {/* Cột 2: Đổi mật khẩu tài khoản */}
            <div className="profile-card" style={{ background: "#ffffff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
              <h3 className="form-title" style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--text)", marginBottom: "1.5rem", borderBottom: "2px solid var(--primary-light, #f0f0f0)", paddingBottom: "0.5rem" }}>
                Đổi mật khẩu bảo mật
              </h3>
              
              <form onSubmit={handleUpdatePassword}>
                {/* Mật khẩu cũ */}
                <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                  <label className="form-label" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Mật khẩu hiện tại</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={passLoading}
                  />
                </div>

                {/* Mật khẩu mới */}
                <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                  <label className="form-label" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Mật khẩu mới</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={passLoading}
                  />
                </div>

                {/* Nhập lại mật khẩu mới */}
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Xác nhận mật khẩu mới</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={passLoading}
                  />
                </div>

                {passError && <p className="login-error" style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: 4 }}>{passError}</p>}
                {passSuccess && <p style={{ color: "#2e7d32", fontSize: "0.85rem", marginTop: 4, fontWeight: 500 }}>{passSuccess}</p>}

                <button type="submit" className="search-btn form-submit-full" disabled={passLoading} style={{ marginTop: "1rem", background: "var(--accent, #ff385c)" }}>
                  {passLoading ? "Đang đổi mật khẩu..." : "Thay đổi mật khẩu"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
