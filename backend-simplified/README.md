# StayHTM Backend

Backend API cho ứng dụng đặt phòng khách sạn StayHTM.

## Cài đặt và chạy lần đầu

### 1. Tạo database PostgreSQL
Mở pgAdmin hoặc psql, chạy:
```sql
CREATE DATABASE stayhtm_db;
```

### 2. Cấu hình file .env
Mở file `.env`, sửa `DB_PASSWORD` thành mật khẩu PostgreSQL của bạn:
```
DB_PASSWORD=mật_khẩu_của_bạn
```

### 3. Cài dependencies
```bash
npm install
```

### 4. Tạo bảng trong database
```bash
npm run db:migrate
```

### 5. Nhập dữ liệu mẫu (10 khách sạn + 3 user)
```bash
npm run db:seed
```

### 6. Chạy server
```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:3001

## Tài khoản demo
| Email | Mật khẩu |
|-------|---------|
| admin@stayhtm.com | admin123 |
| demo@stayhtm.com  | demo1234 |

## Cấu trúc project
```
src/
├── config/
│   ├── db.js          # Kết nối PostgreSQL
│   ├── migrate.js     # Tạo bảng
│   └── seed.js        # Nhập dữ liệu mẫu
├── controllers/
│   ├── authController.js      # Đăng ký / đăng nhập
│   ├── bookingController.js   # Đặt phòng
│   ├── contactController.js   # Liên hệ
│   ├── hotelController.js     # Danh sách khách sạn
│   ├── locationController.js  # Điểm đến
│   └── wishlistController.js  # Yêu thích
├── middlewares/
│   └── auth.js        # Xác thực JWT
├── routes/
│   ├── auth.js        # /api/auth
│   ├── bookings.js    # /api/bookings
│   ├── contact.js     # /api/contact
│   ├── hotels.js      # /api/hotels
│   ├── locations.js   # /api/locations
│   └── wishlist.js    # /api/wishlist
└── index.js           # Điểm khởi động server
```

## Các endpoint chính
| Method | Endpoint | Mô tả | Cần đăng nhập? |
|--------|----------|-------|----------------|
| POST | /api/auth/register | Đăng ký | Không |
| POST | /api/auth/login | Đăng nhập | Không |
| GET | /api/hotels | Danh sách khách sạn | Không |
| GET | /api/hotels/featured | Khách sạn nổi bật | Không |
| GET | /api/wishlist | Xem yêu thích | Có |
| POST | /api/wishlist/:id/toggle | Thêm/xóa yêu thích | Có |
| GET | /api/bookings | Lịch sử đặt phòng | Có |
| POST | /api/bookings | Đặt phòng | Có |
| POST | /api/contact | Gửi liên hệ | Không |
