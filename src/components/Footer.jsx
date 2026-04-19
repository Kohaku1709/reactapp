import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="logo"><span className="logo-icon">✦</span><span className="logo-text">StayHTM</span></div>
                    <p>Nền tảng đặt phòng khách sạn hàng đầu Việt Nam</p>
                </div>
                <div className="footer-links">
                    <div><h4>Về chúng tôi</h4><Link to="/about-us">Giới thiệu</Link><a href="#">Tuyển dụng</a></div>
                    <div><h4>Hỗ trợ</h4><a href="#">Trung tâm trợ giúp</a><Link to="/contact">Liên hệ</Link></div>
                    <div><h4>Đối tác</h4><a href="#">Đăng ký khách sạn</a><a href="#">API</a></div>
                </div>
            </div>
            <div className="footer-bottom">
                <span>© 2026 StayHTM.</span>
                <span>🇻🇳 Tiếng Việt · VND</span>
            </div>
        </footer>
    );
}