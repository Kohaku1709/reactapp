import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";

// Called by: route "/login".
// Params: không nhận props; đọc currentUser, onLogin từ useUser().
// Output: form đăng nhập hoặc redirect về "/" nếu đã đăng nhập.
// Does: validate input tối thiểu và tạo phiên đăng nhập giả lập.
export default function LoginPage() {
    const { currentUser, onLogin } = useUser();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    // Called by: submit form đăng nhập.
    // Params: event submit.
    // Accepted values:
    // - email: chuỗi không rỗng, dạng email
    // - password: chuỗi >= 4 ký tự
    // Output: set currentUser qua onLogin và chuyển route về trang chủ.
    // Does: chặn submit không hợp lệ và hiển thị error nếu thiếu dữ liệu.
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim() || password.trim().length < 4) {
            setError("Vui lòng nhập đúng định dạng.");
            return;
        }

        onLogin(email.trim().toLowerCase());
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


                        <p className="login-note">Demo: Chỉ cần nhập email hợp lệ và mật khẩu từ 4 ký tự.</p>
                    </form>
                </div>
            </section>
        </div>
    );
}