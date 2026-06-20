// URL gốc của backend API
const BASE = "http://localhost:3001/api";

// Các hàm tương tác với LocalStorage để lưu và quản lý JWT Token đăng nhập
export const getToken = () => localStorage.getItem("stayhtm_token");
export const setToken = (t) => localStorage.setItem("stayhtm_token", t);
export const removeToken = () => localStorage.removeItem("stayhtm_token");

// Hàm fetch dữ liệu dùng chung (Wrapper)
// - Tự động thiết lập header Content-Type là application/json
// - Tự động đính kèm Token xác thực "Authorization: Bearer <token>" nếu có token trong LocalStorage
export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  return res.json();
};

// ─── Các API Auth (Xác thực người dùng) ───────────────────────────────────────────
export const authAPI = {
  // Đăng nhập tài khoản
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Đăng ký tài khoản mới
  register: (email, password, name) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  // Đăng nhập bằng Google OAuth
  googleLogin: (credential) =>
    apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  // Yêu cầu mã xác nhận đặt lại mật khẩu gửi về email
  forgotPassword: (email) =>
    apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Đặt lại mật khẩu bằng mã xác nhận
  resetPassword: (email, otp, newPassword) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword }),
    }),

  // Lấy thông tin cá nhân của user đang đăng nhập (dùng token)
  getMe: () => apiFetch("/auth/me"),

  // Cập nhật thông tin cá nhân (tên hiển thị hoặc đổi mật khẩu)
  updateMe: (payload) =>
    apiFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

// ─── Các API Hotels (Quản lý khách sạn) ──────────────────────────────────────────
export const hotelAPI = {
  // Lấy danh sách khách sạn kèm theo các tham số lọc, tìm kiếm, sắp xếp và phân trang
  getAll: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.sort)        qs.set("sort",      params.sort);
    if (params.filter && params.filter !== "Tất cả") qs.set("filter", params.filter);
    if (params.search)      qs.set("search",    params.search);
    if (params.min_price)   qs.set("min_price", params.min_price);
    if (params.max_price)   qs.set("max_price", params.max_price);
    if (params.page)        qs.set("page",      params.page);
    qs.set("limit", params.limit || 100);
    return apiFetch(`/hotels?${qs}`);
  },

  // Lấy thông tin chi tiết của 1 khách sạn theo ID
  getById: (id) => apiFetch(`/hotels/${id}`),

  // Lấy danh sách khách sạn nổi bật (featured)
  getFeatured: () => apiFetch("/hotels/featured"),
};

// ─── Các API Wishlist (Danh sách yêu thích) ──────────────────────────────────────
export const wishlistAPI = {
  // Lấy toàn bộ danh sách khách sạn yêu thích của user hiện tại
  getAll: () => apiFetch("/wishlist"),

  // Bật/tắt trạng thái yêu thích của 1 khách sạn (Thêm nếu chưa có, xóa nếu đã có)
  toggle: (hotelId) =>
    apiFetch(`/wishlist/${hotelId}/toggle`, { method: "POST" }),

  // Thêm trực tiếp 1 khách sạn vào danh sách yêu thích
  add: (hotelId) =>
    apiFetch(`/wishlist/${hotelId}`, { method: "POST" }),

  // Xóa trực tiếp 1 khách sạn khỏi danh sách yêu thích
  remove: (hotelId) =>
    apiFetch(`/wishlist/${hotelId}`, { method: "DELETE" }),
};

// ─── Các API Bookings (Đặt phòng) ────────────────────────────────────────────────
export const bookingAPI = {
  // Lấy toàn bộ lịch sử các đơn đặt phòng của user
  getAll: () => apiFetch("/bookings"),

  // Tạo một đơn đặt phòng khách sạn mới
  create: (payload) =>
    apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Lấy chi tiết thông tin đơn đặt phòng theo ID đơn
  getById: (id) => apiFetch(`/bookings/${id}`),

  // Hủy đơn đặt phòng (chỉ cho phép khi đơn ở trạng thái chờ/đã xác nhận chưa nhận phòng)
  cancel: (id) =>
    apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" }),
};

// ─── API Contact (Gửi liên hệ hỗ trợ) ─────────────────────────────────────────────
export const contactAPI = {
  // Gửi thông tin liên hệ/góp ý của khách hàng lên hệ thống
  send: (payload) =>
    apiFetch("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ─── API Locations (Lấy danh sách điểm đến phổ biến) ─────────────────────────────────
export const locationAPI = {
  // Lấy danh sách các tỉnh/thành phố du lịch nổi bật hiển thị ở trang chủ
  getAll: () => apiFetch("/locations"),
};

// ─── API Admin (Quản trị hệ thống) ──────────────────────────────────────────────────
export const adminAPI = {
  // Lấy toàn bộ đơn đặt phòng
  getBookings: () => apiFetch("/admin/bookings"),

  // Cập nhật trạng thái đơn hàng (duyệt/hủy/hoàn thành)
  updateBookingStatus: (id, status) =>
    apiFetch(`/admin/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Lấy toàn bộ tin nhắn liên hệ gửi lên
  getContacts: () => apiFetch("/admin/contacts"),

  // Đánh dấu tin nhắn liên hệ đã đọc
  markContactRead: (id) =>
    apiFetch(`/admin/contacts/${id}/read`, { method: "PATCH" }),

  // Tạo khách sạn mới
  createHotel: (payload) =>
    apiFetch("/admin/hotels", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Cập nhật thông tin khách sạn
  updateHotel: (id, payload) =>
    apiFetch(`/admin/hotels/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Xóa khách sạn khỏi hệ thống
  deleteHotel: (id) =>
    apiFetch(`/admin/hotels/${id}`, { method: "DELETE" }),
};
