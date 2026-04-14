import { Link } from "react-router-dom";

const stats = [
  { number: "500K+", label: "Khách sạn toàn cầu" },
  { number: "2M+", label: "Khách hàng tin dùng" },
  { number: "98%", label: "Tỷ lệ hài lòng" },
  { number: "24/7", label: "Hỗ trợ khách hàng" },
];

const values = [
  { icon: "🏆", title: "Chất lượng hàng đầu", desc: "Chúng tôi chỉ hợp tác với các khách sạn đạt tiêu chuẩn chất lượng cao, đảm bảo trải nghiệm tốt nhất cho khách hàng." },
  { icon: "💰", title: "Giá cả minh bạch", desc: "Không phí ẩn, không bất ngờ. Giá bạn thấy là giá bạn trả — cam kết rõ ràng từ lúc đặt đến lúc check-out." },
  { icon: "🤝", title: "Hỗ trợ tận tâm", desc: "Đội ngũ hỗ trợ 24/7 luôn sẵn sàng giải quyết mọi vấn đề, từ thay đổi đặt phòng đến yêu cầu đặc biệt." },
  { icon: "🌱", title: "Du lịch bền vững", desc: "Chúng tôi ưu tiên các đối tác cam kết bảo vệ môi trường và phát triển du lịch có trách nhiệm." },
];

export default function AboutPage() {
  return (
    <div className="app" style={{ paddingTop: "68px" }}>

      {/* PAGE HERO */}
      <div className="page-hero about-hero">
        <div className="page-hero-inner">
          <p className="hero-eyebrow">Câu chuyện của chúng tôi</p>
          <h1 className="page-hero-title">Về StayVN</h1>
          <p className="page-hero-sub">Nền tảng đặt phòng khách sạn hàng đầu Việt Nam — được xây dựng bởi người Việt, dành cho người Việt</p>
        </div>
      </div>

      {/* STORY */}
      <section className="section" style={{ background: "white" }}>
        <div className="section-inner about-story">
          <div className="about-text">
            <h2 className="section-title" style={{ marginBottom: "20px" }}>Chúng tôi là ai?</h2>
            <p className="about-para">StayVN được thành lập năm 2020 tại TP. Hồ Chí Minh với sứ mệnh đơn giản: giúp mọi người Việt Nam tìm được chỗ nghỉ tốt với mức giá hợp lý nhất.</p>
            <p className="about-para">Xuất phát từ nỗi bức xúc của chính những người sáng lập khi phải trả phí đặt phòng cao ngất cho các nền tảng nước ngoài, chúng tôi quyết định xây dựng một giải pháp thuần Việt — hiểu văn hóa, hiểu nhu cầu, và luôn đặt người dùng lên hàng đầu.</p>
            <p className="about-para">Sau 5 năm phát triển, StayVN hiện có hơn 500,000 khách sạn trong hệ thống, phục vụ hàng triệu lượt đặt phòng mỗi năm trên toàn quốc và quốc tế.</p>
            <Link to="/contact" className="book-btn" style={{ display: "inline-block", marginTop: "24px", textDecoration: "none" }}>
              Liên hệ chúng tôi →
            </Link>
          </div>
          <div className="about-img-wrap">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" alt="StayVN Office" className="about-img" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section" style={{ background: "var(--brand)", padding: "60px 0" }}>
        <div className="section-inner">
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="section-inner">
          <div className="section-header" style={{ justifyContent: "center", marginBottom: "48px" }}>
            <h2 className="section-title" style={{ textAlign: "center" }}>Giá trị cốt lõi</h2>
          </div>
          <div className="values-grid">
            {values.map((v) => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="about-cta">
        <h2>Sẵn sàng khám phá Việt Nam cùng StayVN?</h2>
        <p>Hàng ngàn khách sạn đang chờ bạn với mức giá tốt nhất</p>
        <Link to="/" className="search-btn" style={{ display: "inline-block", textDecoration: "none", marginTop: "8px" }}>
          Tìm khách sạn ngay
        </Link>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo"><span className="logo-icon">✦</span><span className="logo-text">StayVN</span></div>
            <p>Nền tảng đặt phòng khách sạn hàng đầu Việt Nam</p>
          </div>
          <div className="footer-links">
            <div><h4>Về chúng tôi</h4><a href="/about-us">Giới thiệu</a><a href="#">Tuyển dụng</a></div>
            <div><h4>Hỗ trợ</h4><a href="#">Trung tâm trợ giúp</a><a href="/contact">Liên hệ</a></div>
            <div><h4>Đối tác</h4><a href="#">Đăng ký khách sạn</a><a href="#">API</a></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 StayVN. Bảo lưu mọi quyền.</span>
          <span>🇻🇳 Tiếng Việt · VND</span>
        </div>
      </footer>
    </div>
  );
}
