import { memo } from "react";
import { Link } from "react-router-dom";

// Component Chân trang (Footer) chứa thông tin bản quyền và liên kết phụ
function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                {/* Khối thông tin thương hiệu ở góc trái chân trang */}
                <div className="footer-brand">
                    <div className="logo"><span className="logo-icon">✦</span><span className="logo-text">StayHTM</span></div>
                    <p>Nền tảng đặt phòng khách sạn hàng đầu Việt Nam</p>
                </div>
                
                {/* Khối các nhóm liên kết hữu ích ở góc phải */}
                <div className="footer-links">
                    <div><h4>Về chúng tôi</h4><Link to="/about-us">Giới thiệu</Link><a href="#">Tuyển dụng</a></div>
                    <div><h4>Hỗ trợ</h4><a href="#">Trung tâm trợ giúp</a><Link to="/contact">Liên hệ</Link></div>
                    <div><h4>Đối tác</h4><a href="#">Đăng ký khách sạn</a><a href="#">API</a></div>
                </div>
            </div>
            
            {/* Dòng bản quyền và cấu hình ngôn ngữ dưới cùng */}
            <div className="footer-bottom">
                <span>© 2026 StayHTM.</span>
                <span>🇻🇳 Tiếng Việt · VND</span>
            </div>
        </footer>
    );
}

export default memo(Footer);