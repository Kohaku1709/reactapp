import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function LoginPage({ currentUser, onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }

        if (password.trim().length < 4) {
            setError("Mật khẩu tối thiểu 4 ký tự.");
            return;
        }

        onLogin(email.trim().toLowerCase());
        navigate("/");
    };

    return (
        <div className="app" style={{ paddingTop: "68px" }}>
            <div className="page-hero">
                <div className="page-hero-inner">
                    <h1 className="page-hero-title">Đăng nhập</h1>
                    <p className="page-hero-sub">Đăng nhập nhanh để lưu thông tin đặt phòng của bạn</p>
                </div>
            </div>

            <section className="section" style={{ background: "white" }}>
                <div className="section-inner" style={{ maxWidth: "620px" }}>
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

                        <button type="submit" className="search-btn" style={{ width: "100%", marginTop: "8px" }}>
                            Đăng nhập
                        </button>

                        <p className="login-note">Demo: Chỉ cần nhập email hợp lệ và mật khẩu từ 4 ký tự.</p>
                    </form>
                </div>
            </section>
        </div>
    );
}