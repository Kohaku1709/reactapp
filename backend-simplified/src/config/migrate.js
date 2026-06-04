/**
 * migrate.js — Tạo schema cho StayHTM
 * Chạy: npm run db:migrate
 */
require("dotenv").config();
const pool = require("./db");

const SQL = `
-- USERS
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- LOCATIONS
CREATE TABLE IF NOT EXISTS locations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL UNIQUE,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  hotel_count INTEGER NOT NULL DEFAULT 0,
  img_url     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HOTELS
CREATE TABLE IF NOT EXISTS hotels (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  location       VARCHAR(255) NOT NULL,
  location_id    INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  rating         NUMERIC(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  reviews        INTEGER NOT NULL DEFAULT 0,
  price          INTEGER NOT NULL,
  original_price INTEGER NOT NULL,
  image_url      TEXT,
  stars          SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  badge          VARCHAR(100),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hotels_location ON hotels(location);
CREATE INDEX IF NOT EXISTS idx_hotels_rating   ON hotels(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hotels_price    ON hotels(price);
CREATE INDEX IF NOT EXISTS idx_hotels_stars    ON hotels(stars);

-- TAGS
CREATE TABLE IF NOT EXISTS tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- HOTEL_TAGS
CREATE TABLE IF NOT EXISTS hotel_tags (
  hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (hotel_id, tag_id)
);

-- WISHLISTS
CREATE TABLE IF NOT EXISTS wishlists (
  user_id    INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  hotel_id   INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, hotel_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  hotel_id     INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  check_in     DATE NOT NULL,
  check_out    DATE NOT NULL,
  guests       SMALLINT NOT NULL DEFAULT 1,
  rooms        SMALLINT NOT NULL DEFAULT 1,
  total_price  INTEGER NOT NULL,
  status       VARCHAR(30) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','cancelled','completed')),
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_dates CHECK (check_out > check_in)
);
CREATE INDEX IF NOT EXISTS idx_bookings_user   ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel  ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- CONTACT_MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(255),
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

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
    await pool.end();
  }
}

migrate();
