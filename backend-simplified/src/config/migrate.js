/**
 * migrate.js — Tạo schema các bảng cho StayHTM trong database PostgreSQL
 * Chạy lệnh: npm run db:migrate
 */
require("dotenv").config();
const pool = require("./db");

// Định nghĩa toàn bộ câu lệnh SQL tạo bảng và tạo chỉ mục (Index)
const SQL = `
DROP TABLE IF EXISTS hotel_tags CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. BẢNG USERS: Lưu trữ thông tin tài khoản người dùng
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,       -- Email đăng nhập (duy nhất)
  password    VARCHAR(255),                       -- Mật khẩu (null nếu chỉ đăng nhập bằng Google)
  name        VARCHAR(100) NOT NULL,              -- Tên hiển thị người dùng
  avatar_url  TEXT,                               -- Đường dẫn ảnh đại diện
  role        VARCHAR(20) NOT NULL DEFAULT 'user',-- Vai trò (user, admin)
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,      -- Trạng thái tài khoản (True: đang hoạt động)
  google_id   VARCHAR(255) UNIQUE,                -- ID tài khoản Google
  reset_otp   VARCHAR(6),                         -- Mã xác nhận đặt lại mật khẩu
  reset_otp_expires_at TIMESTAMPTZ,                -- Hạn dùng của mã xác nhận
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); -- Tạo chỉ mục cho email để tăng tốc truy vấn đăng nhập

-- 2. BẢNG LOCATIONS: Các địa điểm du lịch phổ biến (Hà Nội, TP.HCM...)
CREATE TABLE IF NOT EXISTS locations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL UNIQUE,       -- Tên địa điểm hiển thị (VD: Hội An)
  slug        VARCHAR(150) NOT NULL UNIQUE,       -- Slug URL thân thiện (VD: hoi-an)
  hotel_count INTEGER NOT NULL DEFAULT 0,         -- Số lượng khách sạn tại địa điểm
  img_url     TEXT,                               -- Đường dẫn ảnh banner điểm đến
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BẢNG HOTELS: Lưu trữ thông tin chi tiết các khách sạn
CREATE TABLE IF NOT EXISTS hotels (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,           -- Tên khách sạn
  location       VARCHAR(255) NOT NULL,           -- Địa chỉ hiển thị (Quận, Huyện, Tỉnh)
  location_id    INTEGER REFERENCES locations(id) ON DELETE SET NULL, -- Khóa ngoại liên kết bảng locations
  rating         NUMERIC(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 5), -- Điểm đánh giá (0.0 đến 5.0)
  reviews        INTEGER NOT NULL DEFAULT 0,      -- Lượt đánh giá
  price          INTEGER NOT NULL,                -- Giá phòng hiện tại sau giảm giá (đêm)
  original_price INTEGER NOT NULL,                -- Giá phòng gốc chưa giảm
  image_url      TEXT,                            -- Ảnh khách sạn
  stars          SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5), -- Xếp hạng sao (1-5)
  badge          VARCHAR(100),                    -- Nhãn trang trí (VD: Bán chạy)
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,   -- Trạng thái ẩn/hiện khách sạn
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hotels_location ON hotels(location);
CREATE INDEX IF NOT EXISTS idx_hotels_rating   ON hotels(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hotels_price    ON hotels(price);
CREATE INDEX IF NOT EXISTS idx_hotels_stars    ON hotels(stars);

-- 4. BẢNG TAGS: Danh sách các thẻ tiện ích khách sạn (VD: Hồ bơi, Spa, Wifi...)
CREATE TABLE IF NOT EXISTS tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE              -- Tên tiện ích
);

-- 5. BẢNG HOTEL_TAGS: Bảng trung gian liên kết Nhiều-Nhiều giữa Hotels và Tags
CREATE TABLE IF NOT EXISTS hotel_tags (
  hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (hotel_id, tag_id)
);

-- 6. BẢNG WISHLISTS: Lưu trữ danh sách các khách sạn yêu thích của từng người dùng
CREATE TABLE IF NOT EXISTS wishlists (
  user_id    INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  hotel_id   INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, hotel_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

-- 7. BẢNG BOOKINGS: Quản lý các đơn đặt phòng khách sạn của khách hàng
CREATE TABLE IF NOT EXISTS bookings (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE, -- Ai đặt phòng
  hotel_id     INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE, -- Đặt khách sạn nào
  check_in     DATE NOT NULL,                                            -- Ngày nhận phòng
  check_out    DATE NOT NULL,                                            -- Ngày trả phòng
  guests       SMALLINT NOT NULL DEFAULT 1,                              -- Số lượng khách đi cùng
  rooms        SMALLINT NOT NULL DEFAULT 1,                              -- Số lượng phòng đặt
  total_price  INTEGER NOT NULL,                                         -- Tổng giá tiền hóa đơn
  status       VARCHAR(30) NOT NULL DEFAULT 'pending'                    -- Trạng thái đơn đặt
               CHECK (status IN ('pending','confirmed','cancelled','completed')),
  note         TEXT,                                                     -- Yêu cầu đặc biệt của khách
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_dates CHECK (check_out > check_in)                      -- Kiểm tra ngày trả phòng phải lớn hơn ngày nhận
);
CREATE INDEX IF NOT EXISTS idx_bookings_user   ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel  ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 8. BẢNG CONTACT_MESSAGES: Lưu trữ tin nhắn góp ý, liên hệ của người dùng gửi lên
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(255),
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,      -- Trạng thái tin nhắn đã được admin đọc chưa
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// Hàm thực hiện chạy câu lệnh SQL khởi tạo Database
async function migrate() {
  const client = await pool.connect();
  try {
    console.log("🚀 Bắt đầu migrate database...");
    await client.query(SQL);
    console.log("✅ Migration hoàn tất! Các bảng đã được tạo.");
  } catch (err) {
    console.error("❌ Migration thất bại:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end(); // Ngắt kết nối PostgreSQL sau khi hoàn tất
  }
}

migrate();
