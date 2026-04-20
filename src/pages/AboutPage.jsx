import { Link } from "react-router-dom";
import { stats, values } from "../data"

// Called by: route "/about-us".
// Params: không có.
// Output: trang giới thiệu thương hiệu, số liệu và giá trị cốt lõi.
// Does: render nội dung tĩnh từ data.js bằng các section layout.
export default function AboutPage() {
  return (
    <div className="app page-with-header-offset">


      <div className="page-hero about-hero">
        <div className="page-hero-inner">
          <p className="hero-eyebrow">Câu chuyện của chúng tôi</p>
          <h1 className="page-hero-title">Về StayHTM</h1>
          <p className="page-hero-sub">Nền tảng đặt phòng khách sạn hàng đầu Việt Nam — được xây dựng bởi người Việt, dành cho người Việt</p>
        </div>
      </div>


      <section className="section section-white">
        <div className="section-inner about-story">
          <div className="about-text">
            <h2 className="section-title section-title-spaced">Chúng tôi là ai?</h2>
            <p className="about-para">StayHTM được thành lập năm 2026 tại TP. Hồ Chí Minh với sứ mệnh đơn giản: giúp mọi người Việt Nam tìm được chỗ nghỉ tốt với mức giá hợp lý nhất.</p>
            <p className="about-para">Xuất phát từ nỗi bức xúc của chính những người sáng lập khi phải trả phí đặt phòng cao ngất cho các nền tảng nước ngoài, chúng tôi quyết định xây dựng một giải pháp thuần Việt — hiểu văn hóa, hiểu nhu cầu, và luôn đặt người dùng lên hàng đầu.</p>
            <p className="about-para">Sau thời gian phát triển ban đầu, StayHTM hiện đang mở rộng hệ thống khách sạn và phục vụ ngày càng nhiều lượt đặt phòng mỗi năm trên toàn quốc.</p>
            <Link to="/contact" className="book-btn about-contact-link">
              Liên hệ chúng tôi →
            </Link>
          </div>
          <div className="about-img-wrap">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" alt="StayHTM Office" className="about-img" />
          </div>
        </div>
      </section>


      <section className="section section-brand-compact">
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


      <section className="section section-surface">
        <div className="section-inner">
          <div className="section-header section-header-centered">
            <h2 className="section-title section-title-centered">Giá trị cốt lõi</h2>
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


      <section className="about-cta">
        <h2>Sẵn sàng khám phá Việt Nam cùng StayHTM?</h2>
        <p>Hàng ngàn khách sạn đang chờ bạn với mức giá tốt nhất</p>
        <Link to="/" className="search-btn about-cta-link">
          Tìm khách sạn ngay
        </Link>
      </section>
    </div>
  );
}
