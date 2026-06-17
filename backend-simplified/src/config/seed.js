/**
 * seed.js — Nhập dữ liệu mẫu vào database PostgreSQL
 * Chạy lệnh: npm run db:seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db");

// ─── DỮ LIỆU MẪU ĐỊA ĐIỂM (LOCATIONS) ───────────────────────────────────────────
const locations = [
  { name: "TP.HCM",    slug: "tp-hcm",    hotel_count: 2345, img_url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop" },
  { name: "Hà Nội",    slug: "ha-noi",    hotel_count: 1234, img_url: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&h=400&fit=crop" },
  { name: "Đà Nẵng",   slug: "da-nang",   hotel_count: 876,  img_url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop" },
  { name: "Hội An",    slug: "hoi-an",    hotel_count: 543,  img_url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&h=400&fit=crop" },
  { name: "Phú Quốc",  slug: "phu-quoc",  hotel_count: 412,  img_url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop" },
  { name: "Nha Trang", slug: "nha-trang", hotel_count: 721,  img_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop" },
  { name: "Đà Lạt",    slug: "da-lat",    hotel_count: 654,  img_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop" },
  { name: "Sapa",      slug: "sapa",      hotel_count: 312,  img_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" },
  { name: "Vũng Tàu",  slug: "vung-tau",  hotel_count: 498,  img_url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop" },
  { name: "Hạ Long",   slug: "ha-long",   hotel_count: 389,  img_url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop" },
  { name: "Ninh Bình", slug: "ninh-binh", hotel_count: 245,  img_url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop" }
];

// ─── DỮ LIỆU MẪU KHÁCH SẠN (HOTELS) ──────────────────────────────────────────────
const hotels = [
  // HÀ NỘI (10)
  {
    name: "InterContinental Hanoi Westlake", location: "Tây Hồ, Hà Nội",
    rating: 4.8, reviews: 2341, price: 4800000, original_price: 6200000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 5, badge: "Bán chạy",
    tags: ["Hồ bơi", "Spa", "View sông", "Đưa đón sân bay", "Lễ tân 24/7"]
  },
  {
    name: "Sofitel Legend Metropole Hanoi", location: "Hoàn Kiếm, Hà Nội",
    rating: 4.9, reviews: 3120, price: 6500000, original_price: 8500000,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=600&fit=crop",
    stars: 5, badge: "Di sản cổ kính",
    tags: ["Hồ bơi", "Spa", "Lễ tân 24/7", "Bữa sáng miễn phí", "Nhà hàng"]
  },
  {
    name: "Lotte Hotel Hanoi", location: "Ba Đình, Hà Nội",
    rating: 4.7, reviews: 1824, price: 3500000, original_price: 4500000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "View toàn cảnh thành phố",
    tags: ["Hồ bơi", "Spa", "Lễ tân 24/7", "Rooftop bar", "Gym"]
  },
  {
    name: "Hilton Hanoi Opera", location: "Hoàn Kiếm, Hà Nội",
    rating: 4.5, reviews: 1450, price: 2800000, original_price: 3800000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 5, badge: "Gần Hồ Gươm",
    tags: ["Hồ bơi", "Trung tâm thành phố", "Lễ tân 24/7", "Nhà hàng", "Gym"]
  },
  {
    name: "Melia Hanoi", location: "Hoàn Kiếm, Hà Nội",
    rating: 4.6, reviews: 2190, price: 3100000, original_price: 4000000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 5, badge: "Dịch vụ đẳng cấp",
    tags: ["Hồ bơi", "Spa", "Trung tâm thành phố", "Lễ tân 24/7", "Chỗ đậu xe"]
  },
  {
    name: "Hanoi La Siesta Hotel & Spa", location: "Hoàn Kiếm, Hà Nội",
    rating: 4.8, reviews: 1560, price: 2100000, original_price: 2700000,
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop",
    stars: 4, badge: "Đánh giá xuất sắc",
    tags: ["Spa", "Trung tâm thành phố", "Lễ tân 24/7", "Bữa sáng miễn phí", "Phong cách boutique"]
  },
  {
    name: "Apricot Hotel Hanoi", location: "Hoàn Kiếm, Hà Nội",
    rating: 4.7, reviews: 1120, price: 2900000, original_price: 3900000,
    image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop",
    stars: 5, badge: "Nghệ thuật & Sang trọng",
    tags: ["Hồ bơi", "Rooftop bar", "Trung tâm thành phố", "Lễ tân 24/7", "Spa"]
  },
  {
    name: "The Oriental Jade Hotel", location: "Hoàn Kiếm, Hà Nội",
    rating: 4.8, reviews: 980, price: 2600000, original_price: 3400000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 5, badge: "Phố cổ Hà Nội",
    tags: ["Hồ bơi", "Trung tâm thành phố", "Spa", "Lễ tân 24/7", "Bữa sáng miễn phí"]
  },
  {
    name: "Pan Pacific Hanoi", location: "Ba Đình, Hà Nội",
    rating: 4.6, reviews: 1420, price: 3200000, original_price: 4100000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Rooftop bar hồ Tây đẹp",
    tags: ["Hồ bơi", "Rooftop bar", "Spa", "View sông", "Lễ tân 24/7"]
  },
  {
    name: "O'Gallery Classy Hotel", location: "Hoàn Kiếm, Hà Nội",
    rating: 4.7, reviews: 750, price: 1750000, original_price: 2400000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 4, badge: "Boutique ấm cúng",
    tags: ["Trung tâm thành phố", "Lễ tân 24/7", "Bữa sáng miễn phí", "Phong cách boutique", "Wifi tốc độ cao"]
  },

  // TP.HCM (10)
  {
    name: "Park Hyatt Saigon", location: "Quận 1, TP.HCM",
    rating: 4.9, reviews: 3102, price: 5200000, original_price: 6500000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "Bán chạy",
    tags: ["Nhà hàng", "Rooftop bar", "Spa", "Trung tâm thành phố", "Lễ tân 24/7"]
  },
  {
    name: "The Reverie Saigon", location: "Quận 1, TP.HCM",
    rating: 4.9, reviews: 1450, price: 6800000, original_price: 9000000,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=600&fit=crop",
    stars: 5, badge: "Siêu sang trọng",
    tags: ["Hồ bơi", "Spa", "Trung tâm thành phố", "Lễ tân 24/7", "Nhà hàng"]
  },
  {
    name: "Caravelle Saigon", location: "Quận 1, TP.HCM",
    rating: 4.6, reviews: 2380, price: 3200000, original_price: 4300000,
    image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop",
    stars: 5, badge: "Biểu tượng Sài Gòn",
    tags: ["Hồ bơi", "Rooftop bar", "Trung tâm thành phố", "Lễ tân 24/7", "Gym"]
  },
  {
    name: "Hotel Majestic Saigon", location: "Quận 1, TP.HCM",
    rating: 4.5, reviews: 1980, price: 2600000, original_price: 3600000,
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop",
    stars: 5, badge: "View sông Sài Gòn",
    tags: ["Hồ bơi", "View sông", "Trung tâm thành phố", "Lễ tân 24/7", "Nhà hàng"]
  },
  {
    name: "Rex Hotel Saigon", location: "Quận 1, TP.HCM",
    rating: 4.4, reviews: 2010, price: 2400000, original_price: 3200000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 5, badge: "Vị trí đắc địa",
    tags: ["Hồ bơi", "Rooftop bar", "Trung tâm thành phố", "Lễ tân 24/7", "Nhà hàng"]
  },
  {
    name: "Pullman Saigon Centre", location: "Quận 1, TP.HCM",
    rating: 4.6, reviews: 1850, price: 2900000, original_price: 3900000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 5, badge: "Thiết kế hiện đại",
    tags: ["Hồ bơi", "Rooftop bar", "Spa", "Gym", "Lễ tân 24/7"]
  },
  {
    name: "Liberty Central Saigon Citypoint", location: "Quận 1, TP.HCM",
    rating: 4.5, reviews: 1200, price: 1950000, original_price: 2600000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 4, badge: "Phổ biến",
    tags: ["Hồ bơi", "Rooftop bar", "Trung tâm thành phố", "Lễ tân 24/7", "Bữa sáng miễn phí"]
  },
  {
    name: "Sheraton Saigon Hotel & Towers", location: "Quận 1, TP.HCM",
    rating: 4.7, reviews: 2780, price: 4100000, original_price: 5500000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 5, badge: "Đặt nhiều hàng đầu",
    tags: ["Hồ bơi", "Spa", "Trung tâm thành phố", "Gym", "Lễ tân 24/7"]
  },
  {
    name: "Nikko Hotel Saigon", location: "Quận 1, TP.HCM",
    rating: 4.8, reviews: 2450, price: 3800000, original_price: 4900000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Ẩm thực đỉnh cao",
    tags: ["Hồ bơi", "Spa", "Lễ tân 24/7", "Nhà hàng", "Gym"]
  },
  {
    name: "InterContinental Saigon", location: "Quận 1, TP.HCM",
    rating: 4.8, reviews: 2130, price: 4500000, original_price: 5800000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 5, badge: "Phục vụ chuyên nghiệp",
    tags: ["Hồ bơi", "Spa", "Trung tâm thành phố", "Lễ tân 24/7", "Gym"]
  },

  // ĐÀ NẴNG (10)
  {
    name: "Vinpearl Resort & Spa Đà Nẵng", location: "Sơn Trà, Đà Nẵng",
    rating: 4.7, reviews: 1876, price: 3950000, original_price: 5100000,
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop",
    stars: 5, badge: "Nghỉ dưỡng cao cấp",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Bữa sáng miễn phí"]
  },
  {
    name: "InterContinental Danang Sun Peninsula Resort", location: "Sơn Trà, Đà Nẵng",
    rating: 4.9, reviews: 2890, price: 11200000, original_price: 15000000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 5, badge: "Siêu phẩm nghỉ dưỡng",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Đưa đón sân bay"]
  },
  {
    name: "Hyatt Regency Danang Resort and Spa", location: "Ngũ Hành Sơn, Đà Nẵng",
    rating: 4.7, reviews: 2210, price: 4800000, original_price: 6200000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "Gia đình yêu thích",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Gym"]
  },
  {
    name: "Novotel Danang Premier Han River", location: "Hải Châu, Đà Nẵng",
    rating: 4.6, reviews: 1950, price: 2600000, original_price: 3500000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 5, badge: "View sông Hàn",
    tags: ["Hồ bơi", "View sông", "Rooftop bar", "Lễ tân 24/7", "Gym"]
  },
  {
    name: "Pullman Danang Beach Resort", location: "Ngũ Hành Sơn, Đà Nẵng",
    rating: 4.6, reviews: 1680, price: 3400000, original_price: 4500000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 5, badge: "Bãi cát trắng mịn",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Nhà hàng"]
  },
  {
    name: "Furama Resort Danang", location: "Ngũ Hành Sơn, Đà Nẵng",
    rating: 4.7, reviews: 2450, price: 3800000, original_price: 5000000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 5, badge: "Vườn nhiệt đới",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Nhà hàng"]
  },
  {
    name: "TMS Hotel Da Nang Beach", location: "Ngũ Hành Sơn, Đà Nẵng",
    rating: 4.5, reviews: 950, price: 1900000, original_price: 2500000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 4, badge: "Bể bơi vô cực đẹp",
    tags: ["Hồ bơi", "View biển", "Rooftop bar", "Spa", "Lễ tân 24/7"]
  },
  {
    name: "Hilton Da Nang", location: "Hải Châu, Đà Nẵng",
    rating: 4.6, reviews: 1120, price: 2700000, original_price: 3600000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 5, badge: "Trung tâm thành phố",
    tags: ["Hồ bơi", "View sông", "Nhà hàng", "Gym", "Lễ tân 24/7"]
  },
  {
    name: "Sala Danang Beach Hotel", location: "Sơn Trà, Đà Nẵng",
    rating: 4.4, reviews: 860, price: 1450000, original_price: 1900000,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=600&fit=crop",
    stars: 4, badge: "Giá tốt",
    tags: ["Hồ bơi", "View biển", "Bữa sáng miễn phí", "Lễ tân 24/7", "Spa"]
  },
  {
    name: "Haian Beach Hotel & Spa", location: "Ngũ Hành Sơn, Đà Nẵng",
    rating: 4.5, reviews: 1410, price: 1650000, original_price: 2200000,
    image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop",
    stars: 4, badge: "Được yêu thích nhất",
    tags: ["Hồ bơi", "View biển", "Rooftop bar", "Bữa sáng miễn phí", "Spa"]
  },

  // HỘI AN (8)
  {
    name: "Anantara Hội An Resort", location: "Cẩm Châu, Hội An",
    rating: 4.7, reviews: 1234, price: 4300000, original_price: 5600000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 5, badge: "Gia đình yêu thích",
    tags: ["View sông", "Hồ bơi", "Spa", "Phong cách boutique", "Bữa sáng miễn phí"]
  },
  {
    name: "La Siesta Hoi An Resort & Spa", location: "Thanh Hà, Hội An",
    rating: 4.8, reviews: 1980, price: 2800000, original_price: 3700000,
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop",
    stars: 5, badge: "Dịch vụ xuất sắc",
    tags: ["Hồ bơi", "Spa", "Bữa sáng miễn phí", "Nhà hàng", "Phong cách boutique"]
  },
  {
    name: "Four Seasons Resort The Nam Hai", location: "Điện Bàn, Hội An",
    rating: 4.9, reviews: 1150, price: 15500000, original_price: 20000000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 5, badge: "Đẳng cấp hoàng gia",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Chỗ đậu xe"]
  },
  {
    name: "Allegro Hoi An Luxury Hotel & Spa", location: "Cẩm Phô, Hội An",
    rating: 4.7, reviews: 890, price: 2200000, original_price: 2900000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "Trung tâm phố cổ",
    tags: ["Hồ bơi", "Spa", "Bữa sáng miễn phí", "Lễ tân 24/7", "Phong cách boutique"]
  },
  {
    name: "Hoi An Silk Marina Resort & Spa", location: "Cẩm Phô, Hội An",
    rating: 4.5, reviews: 1320, price: 1800000, original_price: 2400000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 4, badge: "Cạnh sông Thu Bồn",
    tags: ["Hồ bơi", "View sông", "Spa", "Bữa sáng miễn phí", "Nhà hàng"]
  },
  {
    name: "Little Hoi An Boutique Hotel & Spa", location: "Minh An, Hội An",
    rating: 4.6, reviews: 650, price: 1350000, original_price: 1800000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 4, badge: "Phong cách ấm cúng",
    tags: ["Hồ bơi", "Spa", "Phong cách boutique", "Bữa sáng miễn phí", "Trung tâm thành phố"]
  },
  {
    name: "Mulberry Collection Silk Eco", location: "Cẩm Phô, Hội An",
    rating: 4.4, reviews: 520, price: 1100000, original_price: 1500000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 4, badge: "Thân thiện môi trường",
    tags: ["Hồ bơi", "Spa", "Bữa sáng miễn phí", "Wifi tốc độ cao", "Phong cách boutique"]
  },
  {
    name: "Bel Marina Hoi An Resort", location: "Cẩm Phô, Hội An",
    rating: 4.6, reviews: 990, price: 2100000, original_price: 2800000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Phổ biến nhất",
    tags: ["Hồ bơi", "View sông", "Spa", "Bữa sáng miễn phí", "Nhà hàng"]
  },

  // PHÚ QUỐC (9)
  {
    name: "Nam Nghi Resort Phú Quốc", location: "Dương Đông, Phú Quốc",
    rating: 4.8, reviews: 1543, price: 6100000, original_price: 7800000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 5, badge: "Nghỉ dưỡng cao cấp",
    tags: ["Bãi biển riêng", "Hồ bơi", "Spa", "View biển", "Đưa đón sân bay"]
  },
  {
    name: "JW Marriott Phu Quoc Emerald Bay Resort & Spa", location: "An Thới, Phú Quốc",
    rating: 4.9, reviews: 2310, price: 8900000, original_price: 12000000,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=600&fit=crop",
    stars: 5, badge: "Kiệt tác kiến trúc",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Đưa đón sân bay"]
  },
  {
    name: "Regent Phu Quoc", location: "Dương Tơ, Phú Quốc",
    rating: 4.9, reviews: 860, price: 9500000, original_price: 13000000,
    image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop",
    stars: 5, badge: "Hoàng gia & Sang trọng",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Đưa đón sân bay"]
  },
  {
    name: "InterContinental Phu Quoc Long Beach Resort", location: "Dương Tơ, Phú Quốc",
    rating: 4.8, reviews: 3100, price: 4200000, original_price: 5600000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 5, badge: "Gia đình yêu thích",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Đưa đón sân bay"]
  },
  {
    name: "Salinda Resort Phu Quoc Island", location: "Dương Tơ, Phú Quốc",
    rating: 4.8, reviews: 1890, price: 3300000, original_price: 4400000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "Phục vụ xuất sắc",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Đưa đón sân bay"]
  },
  {
    name: "Novotel Phu Quoc Resort", location: "Dương Tơ, Phú Quốc",
    rating: 4.5, reviews: 2430, price: 2100000, original_price: 2800000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 5, badge: "Giá tốt",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Bữa sáng miễn phí", "Đưa đón sân bay"]
  },
  {
    name: "Premier Village Phu Quoc Resort", location: "An Thới, Phú Quốc",
    rating: 4.7, reviews: 1120, price: 6500000, original_price: 8500000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 5, badge: "Mũi Ông Đội thơ mộng",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Nhà hàng"]
  },
  {
    name: "Sol by Meliá Phu Quoc", location: "Dương Tơ, Phú Quốc",
    rating: 4.4, reviews: 1980, price: 1650000, original_price: 2200000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 4, badge: "Phong cách trẻ trung",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Bữa sáng miễn phí", "Đưa đón sân bay"]
  },
  {
    name: "VinOasis Phu Quoc", location: "Gành Dầu, Phú Quốc",
    rating: 4.6, reviews: 3420, price: 2300000, original_price: 3100000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Tổ hợp giải trí",
    tags: ["Hồ bơi", "Spa", "Bữa sáng miễn phí", "Đưa đón sân bay", "Nhà hàng"]
  },

  // NHA TRANG (8)
  {
    name: "Sheraton Nha Trang Hotel & Spa", location: "Trần Phú, Nha Trang",
    rating: 4.6, reviews: 2087, price: 3500000, original_price: 4400000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Đặt nhiều hôm nay",
    tags: ["View biển", "Hồ bơi", "Spa", "Nhà hàng", "Wifi tốc độ cao"]
  },
  {
    name: "Vinpearl Resort & Spa Nha Trang Bay", location: "Hòn Tre, Nha Trang",
    rating: 4.7, reviews: 2680, price: 3200000, original_price: 4200000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 5, badge: "Thiên đường vui chơi",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Nhà hàng"]
  },
  {
    name: "Amiana Resort Nha Trang", location: "Phạm Văn Đồng, Nha Trang",
    rating: 4.8, reviews: 2120, price: 3900000, original_price: 5200000,
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop",
    stars: 5, badge: "Hồ nước mặn tự nhiên",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Bữa sáng miễn phí"]
  },
  {
    name: "Mia Resort Nha Trang", location: "Cam Lâm, Nha Trang",
    rating: 4.8, reviews: 1540, price: 4500000, original_price: 5900000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "Yên tĩnh biệt lập",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Yên tĩnh"]
  },
  {
    name: "InterContinental Nha Trang", location: "Trần Phú, Nha Trang",
    rating: 4.8, reviews: 1980, price: 3800000, original_price: 5000000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 5, badge: "Trung tâm đường Trần Phú",
    tags: ["Hồ bơi", "View biển", "Spa", "Gym", "Lễ tân 24/7"]
  },
  {
    name: "Liberty Central Nha Trang Hotel", location: "Trần Phú, Nha Trang",
    rating: 4.4, reviews: 1450, price: 1350000, original_price: 1800000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 4, badge: "Giá tốt sát biển",
    tags: ["Hồ bơi", "View biển", "Bữa sáng miễn phí", "Lễ tân 24/7", "Spa"]
  },
  {
    name: "Regalia Gold Hotel Nha Trang", location: "Nguyễn Thị Minh Khai, Nha Trang",
    rating: 4.5, reviews: 2100, price: 1200000, original_price: 1650000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 5, badge: "Hồ bơi vô cực dát vàng",
    tags: ["Hồ bơi", "Rooftop bar", "Spa", "Bữa sáng miễn phí", "Trung tâm thành phố"]
  },

  // ĐÀ LẠT (7)
  {
    name: "Ana Mandara Villas Dalat Resort & Spa", location: "Phường 5, Đà Lạt",
    rating: 4.7, reviews: 1420, price: 2900000, original_price: 3900000,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=600&fit=crop",
    stars: 5, badge: "Biệt thự Pháp cổ",
    tags: ["Hồ bơi", "Spa", "Bữa sáng miễn phí", "Yên tĩnh", "Phong cách boutique"]
  },
  {
    name: "Dalat Palace Heritage Hotel", location: "Phường 1, Đà Lạt",
    rating: 4.8, reviews: 980, price: 3500000, original_price: 4600000,
    image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop",
    stars: 5, badge: "Lịch sử lâu đời",
    tags: ["Nhà hàng", "Spa", "Bữa sáng miễn phí", "Trung tâm thành phố", "Chỗ đậu xe"]
  },
  {
    name: "Colline Hotel Dalat", location: "Phường 1, Đà Lạt",
    rating: 4.5, reviews: 2300, price: 1600000, original_price: 2200000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 4, badge: "Cạnh chợ Đà Lạt",
    tags: ["Trung tâm thành phố", "Lễ tân 24/7", "Nhà hàng", "Gym", "Wifi tốc độ cao"]
  },
  {
    name: "Terracotta Hotel & Resort Dalat", location: "Hồ Tuyền Lâm, Đà Lạt",
    rating: 4.6, reviews: 3120, price: 1850000, original_price: 2450000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 4, badge: "Ven hồ Tuyền Lâm",
    tags: ["Hồ bơi", "Spa", "Yên tĩnh", "Nhà hàng", "Chỗ đậu xe"]
  },
  {
    name: "Swiss-Belresort Tuyen Lam", location: "Hồ Tuyền Lâm, Đà Lạt",
    rating: 4.5, reviews: 1980, price: 1700000, original_price: 2300000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 5, badge: "Lâu đài giữa rừng thông",
    tags: ["Hồ bơi", "Spa", "Sân Golf", "Nhà hàng", "Bữa sáng miễn phí"]
  },
  {
    name: "Duparc Hotel Dalat", location: "Phường 3, Đà Lạt",
    rating: 4.2, reviews: 750, price: 1100000, original_price: 1500000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 4, badge: "Giá tốt",
    tags: ["Trung tâm thành phố", "Lễ tân 24/7", "Bữa sáng miễn phí", "Nhà hàng", "Wifi tốc độ cao"]
  },
  {
    name: "Ladalat Hotel", location: "Phường 8, Đà Lạt",
    rating: 4.4, reviews: 1120, price: 1350000, original_price: 1850000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 5, badge: "Gần Thung lũng Tình Yêu",
    tags: ["Hồ bơi", "Spa", "Khu vui chơi trẻ em", "Bữa sáng miễn phí", "Lễ tân 24/7"]
  },

  // SAPA (6)
  {
    name: "Hotel de la Coupole - MGallery", location: "Thị xã Sapa, Lào Cai",
    rating: 4.9, reviews: 2450, price: 3900000, original_price: 5200000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Phong cách Đông Dương",
    tags: ["Hồ bơi", "Spa", "View núi", "Trung tâm thành phố", "Lễ tân 24/7"]
  },
  {
    name: "Silk Path Grand Resort & Spa Sapa", location: "Thị xã Sapa, Lào Cai",
    rating: 4.8, reviews: 1560, price: 2800000, original_price: 3800000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 5, badge: "Đồi hoa hồng tuyệt đẹp",
    tags: ["Hồ bơi", "Spa", "View núi", "Bữa sáng miễn phí", "Chỗ đậu xe"]
  },
  {
    name: "Topas Ecolodge Sapa", location: "Bản Lếch, Sapa",
    rating: 4.8, reviews: 1120, price: 6200000, original_price: 8000000,
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop",
    stars: 4, badge: "Top khu nghỉ sinh thái",
    tags: ["Hồ bơi", "View núi", "Yên tĩnh", "Nhà hàng", "Đưa đón sân bay"]
  },
  {
    name: "Pao's Sapa Leisure Hotel", location: "Mường Hoa, Sapa",
    rating: 4.5, reviews: 1890, price: 1750000, original_price: 2400000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "View thung lũng Mường Hoa",
    tags: ["Hồ bơi", "Spa", "View núi", "Bữa sáng miễn phí", "Nhà hàng"]
  },
  {
    name: "Bamboo Sapa Hotel", location: "Mường Hoa, Sapa",
    rating: 4.4, reviews: 920, price: 1250000, original_price: 1700000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 4, badge: "Bể bơi vô cực view núi",
    tags: ["Hồ bơi", "View núi", "Spa", "Bữa sáng miễn phí", "Trung tâm thành phố"]
  },
  {
    name: "KK Sapa Hotel", location: "Thị xã Sapa, Lào Cai",
    rating: 4.6, reviews: 1410, price: 1500000, original_price: 2000000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 5, badge: "Dịch vụ chu đáo",
    tags: ["Hồ bơi", "Spa", "View núi", "Lễ tân 24/7", "Bữa sáng miễn phí"]
  },

  // VŨNG TÀU (6)
  {
    name: "The Imperial Hotel Vũng Tàu", location: "Bãi Sau, Vũng Tàu",
    rating: 4.7, reviews: 2890, price: 2900000, original_price: 4000000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 5, badge: "Phong cách hoàng gia Anh",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Lễ tân 24/7"]
  },
  {
    name: "Marina Bay Vung Tau Resort & Spa", location: "Trần Phú, Vũng Tàu",
    rating: 4.6, reviews: 1650, price: 2400000, original_price: 3200000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Ngắm hoàng hôn cực đẹp",
    tags: ["Hồ bơi", "View biển", "Spa", "Nhà hàng", "Chỗ đậu xe"]
  },
  {
    name: "Pullman Vung Tau", location: "Phường Thắng Tam, Vũng Tàu",
    rating: 4.5, reviews: 2100, price: 2200000, original_price: 3000000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 5, badge: "Trung tâm hội nghị",
    tags: ["Hồ bơi", "Spa", "Gym", "Lễ tân 24/7", "Nhà hàng"]
  },
  {
    name: "Mercure Vung Tau", location: "Bãi Dứa, Vũng Tàu",
    rating: 4.6, reviews: 1340, price: 2150000, original_price: 2850000,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=600&fit=crop",
    stars: 4, badge: "Sát bờ biển",
    tags: ["Hồ bơi", "View biển", "Bữa sáng miễn phí", "Lễ tân 24/7", "Nhà hàng"]
  },
  {
    name: "Vias Hotel Vung Tau", location: "Bãi Sau, Vũng Tàu",
    rating: 4.7, reviews: 980, price: 1850000, original_price: 2500000,
    image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop",
    stars: 4, badge: "Top 1 Bãi Sau",
    tags: ["Hồ bơi", "View biển", "Rooftop bar", "Gym", "Bữa sáng miễn phí"]
  },
  {
    name: "Malibu Hotel Vung Tau", location: "Bãi Sau, Vũng Tàu",
    rating: 4.4, reviews: 1750, price: 1500000, original_price: 2100000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 4, badge: "Bể bơi chân mây tầng cao",
    tags: ["Hồ bơi", "View biển", "Rooftop bar", "Bữa sáng miễn phí", "Lễ tân 24/7"]
  },

  // HẠ LONG (5)
  {
    name: "Vinpearl Resort & Spa Hạ Long", location: "Đảo Rều, Hạ Long",
    rating: 4.8, reviews: 2130, price: 3600000, original_price: 4800000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "Lâu đài trên biển đảo",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Đưa đón sân bay"]
  },
  {
    name: "Wyndham Legend Halong Hotel", location: "Bãi Cháy, Hạ Long",
    rating: 4.6, reviews: 1450, price: 2300000, original_price: 3100000,
    image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&h=600&fit=crop",
    stars: 5, badge: "Ngắm cầu Bãi Cháy",
    tags: ["Hồ bơi", "View sông", "Spa", "Gym", "Lễ tân 24/7"]
  },
  {
    name: "Novotel Ha Long Bay Hotel", location: "Bãi Cháy, Hạ Long",
    rating: 4.5, reviews: 1780, price: 1950000, original_price: 2600000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 4, badge: "Gần Sun World",
    tags: ["Hồ bơi", "Spa", "Bữa sáng miễn phí", "Nhà hàng", "Lễ tân 24/7"]
  },
  {
    name: "Paradise Suites Hotel", location: "Tuần Châu, Hạ Long",
    rating: 4.6, reviews: 950, price: 1650000, original_price: 2200000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 4, badge: "Phong cách Boutique Tuần Châu",
    tags: ["Spa", "Bãi biển riêng", "Bữa sáng miễn phí", "Phong cách boutique", "Lễ tân 24/7"]
  },
  {
    name: "d'Lioro Hotel Halong", location: "Bãi Cháy, Hạ Long",
    rating: 4.4, reviews: 620, price: 1350000, original_price: 1850000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Biệt thự sườn đồi",
    tags: ["Hồ bơi", "Spa", "Bữa sáng miễn phí", "Gym", "Lễ tân 24/7"]
  },

  // NINH BÌNH (4)
  {
    name: "Emeralda Resort Ninh Bình", location: "Gia Viễn, Ninh Bình",
    rating: 4.7, reviews: 1890, price: 2300000, original_price: 3100000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 5, badge: "Làng quê Kinh Kỳ xưa",
    tags: ["Hồ bơi", "Spa", "Yên tĩnh", "Bữa sáng miễn phí", "Nhà hàng"]
  },
  {
    name: "Ninh Binh Legend Hotel", location: "TP. Ninh Bình, Ninh Bình",
    rating: 4.5, reviews: 920, price: 1600000, original_price: 2150000,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=600&fit=crop",
    stars: 5, badge: "Trung tâm thành phố",
    tags: ["Hồ bơi", "Spa", "Bữa sáng miễn phí", "Lễ tân 24/7", "Nhà hàng"]
  },
  {
    name: "Tam Coc Garden Resort", location: "Hoa Lư, Ninh Bình",
    rating: 4.8, reviews: 750, price: 3400000, original_price: 4500000,
    image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop",
    stars: 4, badge: "Ốc đảo xanh giữa đồng lúa",
    tags: ["Hồ bơi", "Yên tĩnh", "Bữa sáng miễn phí", "Nhà hàng", "Phong cách boutique"]
  },
  {
    name: "Aravinda Resort Ninh Binh", location: "Hoa Lư, Ninh Bình",
    rating: 4.7, reviews: 540, price: 2600000, original_price: 3400000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 4, badge: "Tinh hoa làng quê Bắc Bộ",
    tags: ["Hồ bơi", "Spa", "Yên tĩnh", "Bữa sáng miễn phí", "Nhà hàng"]
  }
];

// ─── DỮ LIỆU MẪU USER (USERS) ──────────────────────────────────────────────────
const demoUsers = [
  { email: "admin@stayhtm.com",  password: "admin123",  name: "Admin StayHTM", role: "admin" },
  { email: "demo@stayhtm.com",   password: "demo1234",  name: "Demo User", role: "user" },
  { email: "nguyen@example.com", password: "pass1234",  name: "Nguyễn Văn A", role: "user" }
];

// ─── Hàm chính khởi chạy Seeder dữ liệu ──────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Khởi động một PostgreSQL Transaction
    console.log("🌱 Bắt đầu seed dữ liệu...");

    // 1. Xóa sạch dữ liệu cũ trong các bảng theo thứ tự khóa ngoại để tránh xung đột
    await client.query("DELETE FROM hotel_tags");
    await client.query("DELETE FROM wishlists");
    await client.query("DELETE FROM bookings");
    await client.query("DELETE FROM hotels");
    await client.query("DELETE FROM tags");
    await client.query("DELETE FROM locations");
    await client.query("DELETE FROM users");
    console.log("  🗑  Đã xóa dữ liệu cũ");

    // 2. Chèn danh sách địa điểm du lịch (Locations)
    for (const loc of locations) {
      await client.query(
        "INSERT INTO locations(name, slug, hotel_count, img_url) VALUES($1,$2,$3,$4)",
        [loc.name, loc.slug, loc.hotel_count, loc.img_url]
      );
    }
    console.log(`  📍 Đã thêm ${locations.length} điểm đến`);

    // Lấy lại danh sách locations kèm ID để làm bản đồ đối chiếu (map)
    const locRows = (await client.query("SELECT id, name FROM locations")).rows;
    const locMap = Object.fromEntries(locRows.map(r => [r.name, r.id]));

    // 3. Thu thập toàn bộ các thẻ tiện ích (Tags) độc bản từ danh sách khách sạn mẫu và chèn vào bảng tags
    const allTagNames = [...new Set(hotels.flatMap(h => h.tags))];
    for (const tagName of allTagNames) {
      await client.query(
        "INSERT INTO tags(name) VALUES($1) ON CONFLICT DO NOTHING",
        [tagName]
      );
    }
    // Lấy lại danh sách tag kèm ID để làm bản đồ đối chiếu (map)
    const tagRows = (await client.query("SELECT id, name FROM tags")).rows;
    const tagMap = Object.fromEntries(tagRows.map(r => [r.name, r.id]));
    console.log(`  🏷  Đã thêm ${allTagNames.length} tag`);

    // 4. Chèn thông tin khách sạn (Hotels) và lập liên kết thẻ tiện ích (Hotel Tags)
    for (const h of hotels) {
      // Tìm location_id tương thích từ trường location (vd: "Tây Hồ, Hà Nội" -> "Hà Nội")
      let locId = null;
      for (const locName of Object.keys(locMap)) {
        if (h.location.includes(locName)) {
          locId = locMap[locName];
          break;
        }
      }

      const res = await client.query(
        `INSERT INTO hotels(name, location, location_id, rating, reviews, price, original_price, image_url, stars, badge)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [h.name, h.location, locId, h.rating, h.reviews, h.price, h.original_price, h.image_url, h.stars, h.badge]
      );
      const hotelId = res.rows[0].id;
      
      // Chèn các liên kết tiện ích tương ứng của khách sạn này vào bảng trung gian
      for (const tagName of h.tags) {
        await client.query(
          "INSERT INTO hotel_tags(hotel_id, tag_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
          [hotelId, tagMap[tagName]]
        );
      }
    }
    console.log(`  🏨 Đã thêm ${hotels.length} khách sạn`);

    // 5. Chèn tài khoản người dùng mẫu (Users) - Mã hóa mật khẩu bằng bcrypt 10 vòng băm
    for (const u of demoUsers) {
      const hash = await bcrypt.hash(u.password, 10);
      await client.query(
        "INSERT INTO users(email, password, name, role) VALUES($1,$2,$3,$4)",
        [u.email, hash, u.name, u.role]
      );
    }
    console.log(`  👤 Đã thêm ${demoUsers.length} user demo`);

    await client.query("COMMIT"); // Xác nhận lưu lại toàn bộ thay đổi thành công vào DB
    console.log("\n✅ Seed hoàn tất!");
    console.log("   Tài khoản demo:");
    console.log("   → admin@stayhtm.com  /  admin123");
    console.log("   → demo@stayhtm.com   /  demo1234");
  } catch (err) {
    await client.query("ROLLBACK"); // Quay lui giao dịch nếu có bất kỳ lỗi nào xảy ra để bảo toàn DB
    console.error("❌ Seed thất bại:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end(); // Ngắt kết nối PostgreSQL
  }
}

seed();
