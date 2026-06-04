/**
 * seed.js — Nhập dữ liệu mẫu vào database
 * Chạy: npm run db:seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db");

// ─── Dữ liệu mẫu tường minh ───────────────────────────────────────────────────

const locations = [
  { name: "TP.HCM",    slug: "tp-hcm",    hotel_count: 2345, img_url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop" },
  { name: "Hà Nội",    slug: "ha-noi",    hotel_count: 1234, img_url: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&h=400&fit=crop" },
  { name: "Đà Nẵng",   slug: "da-nang",   hotel_count: 876,  img_url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop" },
  { name: "Hội An",    slug: "hoi-an",    hotel_count: 543,  img_url: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&h=400&fit=crop" },
  { name: "Phú Quốc",  slug: "phu-quoc",  hotel_count: 412,  img_url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop" },
  { name: "Nha Trang", slug: "nha-trang", hotel_count: 721,  img_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop" },
];

const hotels = [
  {
    name: "InterContinental Hanoi Westlake", location: "Tây Hồ, Hà Nội",
    rating: 4.8, reviews: 2341, price: 4800000, original_price: 6200000,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop",
    stars: 5, badge: "Bán chạy",
    tags: ["Hồ bơi", "Spa", "View sông", "Đưa đón sân bay", "Lễ tân 24/7"],
  },
  {
    name: "Vinpearl Resort & Spa Đà Nẵng", location: "Sơn Trà, Đà Nẵng",
    rating: 4.7, reviews: 1876, price: 3950000, original_price: 5100000,
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop",
    stars: 5, badge: "Nghỉ dưỡng cao cấp",
    tags: ["Hồ bơi", "View biển", "Bãi biển riêng", "Spa", "Bữa sáng miễn phí"],
  },
  {
    name: "Park Hyatt Saigon", location: "Quận 1, TP.HCM",
    rating: 4.9, reviews: 3102, price: 5200000, original_price: 6500000,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop",
    stars: 5, badge: "Bán chạy",
    tags: ["Nhà hàng", "Rooftop bar", "Spa", "Trung tâm thành phố", "Lễ tân 24/7"],
  },
  {
    name: "Nam Nghi Resort Phú Quốc", location: "Dương Đông, Phú Quốc",
    rating: 4.8, reviews: 1543, price: 6100000, original_price: 7800000,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=600&fit=crop",
    stars: 5, badge: "Nghỉ dưỡng cao cấp",
    tags: ["Bãi biển riêng", "Hồ bơi", "Spa", "View biển", "Đưa đón sân bay"],
  },
  {
    name: "Anantara Hội An Resort", location: "Cẩm Châu, Hội An",
    rating: 4.7, reviews: 1234, price: 4300000, original_price: 5600000,
    image_url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&h=600&fit=crop",
    stars: 5, badge: "Gia đình yêu thích",
    tags: ["View sông", "Hồ bơi", "Spa", "Phong cách boutique", "Bữa sáng miễn phí"],
  },
  {
    name: "Sheraton Nha Trang Hotel & Spa", location: "Trần Phú, Nha Trang",
    rating: 4.6, reviews: 2087, price: 3500000, original_price: 4400000,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&h=600&fit=crop",
    stars: 5, badge: "Đặt nhiều hôm nay",
    tags: ["View biển", "Hồ bơi", "Spa", "Nhà hàng", "Wifi tốc độ cao"],
  },
  {
    name: "Novotel Dalat", location: "TP. Đà Lạt, Lâm Đồng",
    rating: 4.4, reviews: 987, price: 1850000, original_price: 2300000,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=600&fit=crop",
    stars: 4, badge: "Giá tốt",
    tags: ["Check-in đẹp", "Nhà hàng", "Bữa sáng miễn phí", "Wifi tốc độ cao"],
  },
  {
    name: "Sapa Eco Valley Resort", location: "Sapa, Lào Cai",
    rating: 4.5, reviews: 763, price: 2100000, original_price: 2700000,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&h=600&fit=crop",
    stars: 4, badge: null,
    tags: ["Check-in đẹp", "Yên tĩnh", "Bữa sáng miễn phí", "Wifi tốc độ cao"],
  },
  {
    name: "Wyndham Quảng Bình", location: "TP. Đồng Hới, Quảng Bình",
    rating: 4.3, reviews: 541, price: 1600000, original_price: 2050000,
    image_url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&h=600&fit=crop",
    stars: 4, badge: "Giá tốt",
    tags: ["Hồ bơi", "Bữa sáng miễn phí", "Wifi tốc độ cao", "Lễ tân 24/7"],
  },
  {
    name: "Mường Thanh Grand Cần Thơ", location: "Ninh Kiều, Cần Thơ",
    rating: 4.2, reviews: 892, price: 1350000, original_price: 1700000,
    image_url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop",
    stars: 4, badge: null,
    tags: ["View sông", "Trung tâm thành phố", "Nhà hàng", "Wifi tốc độ cao"],
  },
];

const demoUsers = [
  { email: "admin@stayhtm.com",  password: "admin123",  name: "Admin StayHTM" },
  { email: "demo@stayhtm.com",   password: "demo1234",  name: "Demo User" },
  { email: "nguyen@example.com", password: "pass1234",  name: "Nguyễn Văn A" },
];

// ─── Chạy seed ────────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("🌱 Bắt đầu seed dữ liệu...");

    // 1. Xóa dữ liệu cũ
    await client.query("DELETE FROM hotel_tags");
    await client.query("DELETE FROM wishlists");
    await client.query("DELETE FROM bookings");
    await client.query("DELETE FROM hotels");
    await client.query("DELETE FROM tags");
    await client.query("DELETE FROM locations");
    await client.query("DELETE FROM users");
    console.log("  🗑  Đã xóa dữ liệu cũ");

    // 2. Thêm locations
    for (const loc of locations) {
      await client.query(
        "INSERT INTO locations(name, slug, hotel_count, img_url) VALUES($1,$2,$3,$4)",
        [loc.name, loc.slug, loc.hotel_count, loc.img_url]
      );
    }
    console.log(`  📍 Đã thêm ${locations.length} điểm đến`);

    // 3. Thu thập tất cả tags và insert
    const allTagNames = [...new Set(hotels.flatMap(h => h.tags))];
    for (const tagName of allTagNames) {
      await client.query(
        "INSERT INTO tags(name) VALUES($1) ON CONFLICT DO NOTHING",
        [tagName]
      );
    }
    const tagRows = (await client.query("SELECT id, name FROM tags")).rows;
    const tagMap = Object.fromEntries(tagRows.map(r => [r.name, r.id]));
    console.log(`  🏷  Đã thêm ${allTagNames.length} tag`);

    // 4. Thêm hotels + hotel_tags
    for (const h of hotels) {
      const res = await client.query(
        `INSERT INTO hotels(name, location, rating, reviews, price, original_price, image_url, stars, badge)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [h.name, h.location, h.rating, h.reviews, h.price, h.original_price, h.image_url, h.stars, h.badge]
      );
      const hotelId = res.rows[0].id;
      for (const tagName of h.tags) {
        await client.query(
          "INSERT INTO hotel_tags(hotel_id, tag_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
          [hotelId, tagMap[tagName]]
        );
      }
    }
    console.log(`  🏨 Đã thêm ${hotels.length} khách sạn`);

    // 5. Thêm users demo
    for (const u of demoUsers) {
      const hash = await bcrypt.hash(u.password, 10);
      await client.query(
        "INSERT INTO users(email, password, name) VALUES($1,$2,$3)",
        [u.email, hash, u.name]
      );
    }
    console.log(`  👤 Đã thêm ${demoUsers.length} user demo`);

    await client.query("COMMIT");
    console.log("\n✅ Seed hoàn tất!");
    console.log("   Tài khoản demo:");
    console.log("   → admin@stayhtm.com  /  admin123");
    console.log("   → demo@stayhtm.com   /  demo1234");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed thất bại:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
