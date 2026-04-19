import { useState } from "react";
import { contactInfo } from "../data";

export default function ContactPage() {
  // Gom các field vào một object state để handleChange dùng chung cho nhiều input.
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  // sent = true sẽ chuyển giao diện từ form sang trạng thái gửi thành công.
  const [sent, setSent] = useState(false);

  // Cập nhật theo name của input, giúp tái sử dụng 1 hàm cho toàn bộ field.
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    // Validate tối thiểu cho demo: bắt buộc tên, email, tin nhắn.
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <div className="app page-with-header-offset">

      {/* PAGE HERO */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Liên hệ với chúng tôi</h1>
          <p className="page-hero-sub">Đội ngũ hỗ trợ StayHTM luôn sẵn sàng giải đáp mọi thắc mắc của bạn</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner">
          <div className="contact-layout">

            {/* CONTACT INFO */}
            <div className="contact-info-col">
              <h2 className="section-title contact-info-title">Thông tin liên hệ</h2>
              <p className="contact-info-subtext">
                Hãy liên hệ với chúng tôi qua bất kỳ kênh nào bên dưới hoặc gửi tin nhắn trực tiếp.
              </p>
              <div className="contact-cards">
                {/* map dữ liệu contact từ data.js để dễ chỉnh sửa nội dung. */}
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
                <p className="social-title">Theo dõi chúng tôi</p>
                <div className="social-list">
                  {["Facebook", "Instagram", "TikTok", "YouTube"].map(s => (
                    <button key={s} className="social-btn">{s[0]}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div className="contact-form-col">
              {/* Render có điều kiện: sent=true thì hiện màn thành công, ngược lại hiện form. */}
              {sent ? (
                <div className="form-success">
                  <div className="success-icon">✅</div>
                  <h3>Gửi thành công!</h3>
                  <p>Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng 24 giờ.</p>
                  <button className="book-btn form-success-reset-btn" onClick={() => setSent(false)}>
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
                  <button className="search-btn form-submit-full" onClick={handleSubmit}>
                    Gửi tin nhắn ✉️
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
