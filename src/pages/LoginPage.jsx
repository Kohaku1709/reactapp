import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function LoginPage({ currentUser, onLogin }) {
    const navigate = useNavigate();
    // State form đăng nhập.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // Dùng để hiển thị lỗi validate ngay trên form.
    const [error, setError] = useState("");

    // Nếu đã đăng nhập thì không cho vào lại trang /login.
    // replace giúp nút Back không quay ngược về trang login.
    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = (e) => {
        // Chặn reload trang mặc định của thẻ form.
        e.preventDefault();

        // Validate cơ bản cho đồ án: không cho rỗng.
        if (!email.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }

        // Validate thêm: mật khẩu tối thiểu 4 ký tự.
        if (password.trim().length < 4) {
            setError("Mật khẩu tối thiểu 4 ký tự.");
            return;
        }

        // Login thành công: chuẩn hóa email rồi báo ngược lên App.jsx để lưu user.
        onLogin(email.trim().toLowerCase());
        // Sau đó chuyển về trang chủ để người dùng thấy ngay trạng thái đã đăng nhập.
        navigate("/");
    };

    return (
        <div className="app page-with-header-offset">
            <div className="page-hero">
                <div className="page-hero-inner">
                    <h1 className="page-hero-title">Đăng nhập</h1>
                    <p className="page-hero-sub">Đăng nhập nhanh để lưu thông tin đặt phòng của bạn</p>
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
                            />
                        </div>

                        {error ? <p className="login-error">{error}</p> : null}

                        <button type="submit" className="search-btn form-submit-full">
                            Đăng nhập
                        </button>

                        {/* Ghi chú rule demo để tránh nhầm là auth thật có backend. */}
                        <p className="login-note">Demo: Chỉ cần nhập email hợp lệ và mật khẩu từ 4 ký tự.</p>
                    </form>
                </div>
            </section>
        </div>
    );
}