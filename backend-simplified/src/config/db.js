const { Pool } = require("pg");
require("dotenv").config();

// Khởi tạo một đối tượng kết nối Pool tới PostgreSQL Database
// Pool cho phép tái sử dụng các kết nối cũ, giảm chi phí hiệu năng tạo kết nối mới liên tục
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "stayhtm_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,                          // Số lượng kết nối tối đa có thể mở đồng thời
  idleTimeoutMillis: 30000,         // Thời gian giải phóng một kết nối nhàn rỗi (30s)
  connectionTimeoutMillis: 2000,    // Thời gian chờ tối đa khi cố gắng kết nối (2s)
});

// Lắng nghe sự kiện kết nối thành công đầu tiên
pool.on("connect", () => {
  if (process.env.NODE_ENV !== "test") {
    console.log("✅ Kết nối PostgreSQL thành công");
  }
});

// Lắng nghe và báo cáo lỗi nếu có sự cố xảy ra trong pool kết nối
pool.on("error", (err) => {
  console.error("❌ Lỗi PostgreSQL pool:", err.message);
});

module.exports = pool;
