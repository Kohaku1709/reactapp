const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "stayhtm_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test kết nối khi khởi động
pool.on("connect", () => {
  if (process.env.NODE_ENV !== "test") {
    console.log("✅ Kết nối PostgreSQL thành công");
  }
});

pool.on("error", (err) => {
  console.error("❌ Lỗi PostgreSQL pool:", err.message);
});

module.exports = pool;
