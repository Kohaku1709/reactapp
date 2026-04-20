import { useState } from "react";
import { contactInfo } from "../data";
import { useUser } from "../context/userContext";

// Called by: route "/contact".
// Params: không nhận props; đọc currentUser từ useUser().
// Output: trang liên hệ + form gửi + trạng thái gửi thành công.
// Does: gom dữ liệu liên hệ và validate tối thiểu trước khi set sent=true.
export default function ContactPage() {
  const { currentUser } = useUser();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  // Called by: onChange của input/select/textarea.
  // Params: event từ field có name thuộc {name,email,subject,message}.
  // Output: form state mới với đúng field vừa thay đổi.
  // Does: dùng computed property [e.target.name] để tái sử dụng 1 handler cho nhiều field.
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Called by: click nút "Gửi tin nhắn".
  // Params: không có trực tiếp; dùng currentUser + form state.
  // Accepted values:
  // - currentUser: null hoặc { name, email }
  // - form.message: chuỗi không rỗng
  // Output: sent=true nếu đủ dữ liệu, ngược lại return sớm.
  // Does: thống nhất luồng gửi cho cả user đã login và guest.
  const handleSubmit = () => {
    // Nếu đã đăng nhập thì ưu tiên lấy dữ liệu profile, chưa login thì fallback về form.
    // currentUser?.name:
    // - nếu currentUser tồn tại -> lấy name
    // - nếu currentUser là null/undefined -> trả về undefined (không throw lỗi)
    // currentUser?.name ?? form.name:
    // - nếu vế trái null/undefined -> dùng form.name
    // - nếu vế trái có giá trị hợp lệ -> giữ vế trái
    const senderName = currentUser?.name ?? form.name;
    const senderEmail = currentUser?.email ?? form.email;

    if (!senderName || !senderEmail || !form.message) return;
    setSent(true);
  };

  return (
    <div className="app page-with-header-offset">


      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Liên hệ với chúng tôi</h1>
          <p className="page-hero-sub">Đội ngũ hỗ trợ StayHTM luôn sẵn sàng giải đáp mọi thắc mắc của bạn</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner">
          <div className="contact-layout">


            <div className="contact-info-col">
              <h2 className="section-title contact-info-title">Thông tin liên hệ</h2>
              <p className="contact-info-subtext">
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
                <p className="social-title">Theo dõi chúng tôi</p>
                <div className="social-list">
                  {["Facebook", "Instagram", "TikTok", "YouTube"].map(s => (
                    <button key={s} className="social-btn">{s[0]}</button>
                  ))}
                </div>
              </div>
            </div>


            <div className="contact-form-col">

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
                  {!currentUser && (<div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Họ và tên *</label>
                      <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn Hậu" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="n23dccn018@students.ptit.edu.vn" />
                    </div>
                  </div>)}
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
