import { useState } from "react";
import { contactInfo } from "../data";
import { useUser } from "../context/userContext";
import { contactAPI } from "../services/api";

// Component Trang liên hệ (Contact Page)
export default function ContactPage() {
  const { currentUser } = useUser();
  // State quản lý thông tin nhập vào form liên hệ
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  // State quản lý trạng thái gửi thành công, trạng thái đang load và lỗi từ API
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Hàm thay đổi giá trị nhập liệu của các trường trong form
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Xử lý gửi tin nhắn liên hệ hỗ trợ lên Backend
  const handleSubmit = async () => {
    setError("");
    
    // Nếu đã đăng nhập, tự động điền Tên và Email của user, ngược lại lấy từ form
    const name    = currentUser?.name  ?? form.name;
    const email   = currentUser?.email ?? form.email;
    const message = form.message.trim();

    // Xác thực cơ bản dữ liệu đầu vào
    if (!name || !email || !message) {
      setError("Vui lòng điền đầy đủ thông tin."); return;
    }
    if (message.length < 10) {
      setError("Nội dung tin nhắn phải có ít nhất 10 ký tự."); return;
    }

    setLoading(true);
    try {
      // Gọi API gửi tin nhắn liên hệ
      const res = await contactAPI.send({ name, email, subject: form.subject, message });
      if (res.success) setSent(true);
      else setError(res.message || res.errors?.[0]?.msg || "Gửi thất bại. Vui lòng thử lại.");
    } catch {
      setError("Không kết nối được server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app page-with-header-offset">
      {/* Banner trang trí */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">Liên hệ với chúng tôi</h1>
          <p className="page-hero-sub">Đội ngũ hỗ trợ StayHTM luôn sẵn sàng giải đáp mọi thắc mắc của bạn</p>
        </div>
      </div>

      <section className="section section-white">
        <div className="section-inner">
          <div className="contact-layout">
            
            {/* Cột hiển thị thông tin liên hệ tĩnh (Địa chỉ, Điện thoại, Email, Mạng xã hội) */}
            <div className="contact-info-col">
              <h2 className="section-title contact-info-title">Thông tin liên hệ</h2>
              <p className="contact-info-subtext">Liên hệ qua bất kỳ kênh nào bên dưới hoặc gửi tin nhắn trực tiếp.</p>
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

            {/* Cột Form gửi tin nhắn hỗ trợ */}
            <div className="contact-form-col">
              {sent ? (
                // Khối thông báo khi gửi liên hệ thành công
                <div className="form-success">
                  <div className="success-icon">✅</div>
                  <h3>Gửi thành công!</h3>
                  <p>Chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong vòng 24 giờ.</p>
                  <button className="book-btn form-success-reset-btn"
                    onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                // Form nhập tin nhắn
                <div className="contact-form">
                  <h3 className="form-title">Gửi tin nhắn</h3>
                  
                  {/* Chỉ hiển thị trường Tên và Email nhập tay nếu user chưa đăng nhập */}
                  {!currentUser && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Họ và tên *</label>
                        <input className="form-input" name="name" value={form.name}
                          onChange={handleChange} placeholder="Nguyễn Văn A" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input className="form-input" name="email" type="email" value={form.email}
                          onChange={handleChange} placeholder="email@example.com" />
                      </div>
                    </div>
                  )}
                  
                  {/* Lựa chọn chủ đề liên hệ */}
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
                  
                  {/* Nhập nội dung tin nhắn */}
                  <div className="form-group">
                    <label className="form-label">Tin nhắn *</label>
                    <textarea className="form-input form-textarea" name="message" value={form.message}
                      onChange={handleChange} placeholder="Mô tả vấn đề hoặc câu hỏi..." rows={5} />
                  </div>
                  
                  {/* Hiển thị lỗi nếu có */}
                  {error && <p className="login-error">{error}</p>}
                  
                  {/* Nút gửi */}
                  <button className="search-btn form-submit-full" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang gửi..." : "Gửi tin nhắn ✉️"}
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
