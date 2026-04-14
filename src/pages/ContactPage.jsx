import { useState } from "react";

const contactInfo = [
  { icon: "📍", title: "Địa chỉ", detail: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" },
  { icon: "📞", title: "Điện thoại", detail: "1800 1234 (Miễn phí)" },
  { icon: "✉️", title: "Email", detail: "support@stayvn.com" },
  { icon: "🕐", title: "Giờ làm việc", detail: "24/7 — Hỗ trợ không nghỉ" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <div className="app" style={{ paddingTop: "68px" }}>

      {/* PAGE HERO */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Liên hệ với chúng tôi</h1>
          <p className="page-hero-sub">Đội ngũ hỗ trợ StayVN luôn sẵn sàng giải đáp mọi thắc mắc của bạn</p>
        </div>
      </div>

      <section className="section" style={{ background: "white" }}>
        <div className="section-inner">
          <div className="contact-layout">

            {/* CONTACT INFO */}
            <div className="contact-info-col">
              <h2 className="section-title" style={{ marginBottom: "8px" }}>Thông tin liên hệ</h2>
              <p style={{ color: "var(--muted)", marginBottom: "32px", fontSize: "15px" }}>
                Hãy liên hệ với chúng tôi qua bất kỳ kênh nào bên dưới hoặc gửi tin nhắn trực tiếp.
              </p>
              <div className="contact-cards">
                {contactInfo.map((c) => (
                  <div key={c.title} className="contact-card">
                    <div className="contact-card-icon">{c.icon}</div>
                    <div>
                      <div className="contact-card-title">{c.title}</div>
                      <div className="contact-card-detail">{c.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="social-links">
                <p style={{ fontWeight: 600, marginBottom: "12px", color: "var(--dark)" }}>Theo dõi chúng tôi</p>
                <div style={{ display: "flex", gap: "12px" }}>
                  {["Facebook", "Instagram", "TikTok", "YouTube"].map(s => (
                    <button key={s} className="social-btn">{s[0]}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div className="contact-form-col">
              {sent ? (
                <div className="form-success">
                  <div className="success-icon">✅</div>
                  <h3>Gửi thành công!</h3>
                  <p>Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng 24 giờ.</p>
                  <button className="book-btn" onClick={() => setSent(false)} style={{ marginTop: "16px" }}>
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <div className="contact-form">
                  <h3 className="form-title">Gửi tin nhắn</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Họ và tên *</label>
                      <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chủ đề</label>
                    <select className="form-input" name="subject" value={form.subject} onChange={handleChange}>
                      <option value="">Chọn chủ đề...</option>
                      <option>Hỗ trợ đặt phòng</option>
                      <option>Thay đổi / Hủy đặt phòng</option>
                      <option>Vấn đề thanh toán</option>
                      <option>Đăng ký làm đối tác</option>
                      <option>Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tin nhắn *</label>
                    <textarea className="form-input form-textarea" name="message" value={form.message} onChange={handleChange} placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..." rows={5} />
                  </div>
                  <button className="search-btn" style={{ width: "100%", marginTop: "8px" }} onClick={handleSubmit}>
                    Gửi tin nhắn ✉️
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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
