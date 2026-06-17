const express = require("express");
const { getWishlist, toggleWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Bắt buộc tất cả các tuyến liên quan đến danh sách yêu thích phải đi qua authMiddleware để kiểm tra đăng nhập
router.use(authMiddleware);

// Định nghĩa các endpoint danh sách yêu thích:
// 1. Lấy toàn bộ danh sách khách sạn yêu thích của user (GET /api/wishlist)
router.get("/",                     getWishlist);

// 2. Thêm hoặc xóa khách sạn khỏi danh sách yêu thích (POST /api/wishlist/:hotelId/toggle)
router.post("/:hotelId/toggle",     toggleWishlist);

// 3. Xóa trực tiếp một khách sạn khỏi danh sách yêu thích (DELETE /api/wishlist/:hotelId)
router.delete("/:hotelId",          removeFromWishlist);

module.exports = router;
