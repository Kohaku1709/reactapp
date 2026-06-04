const express = require("express");
const { getWishlist, toggleWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Tất cả wishlist routes đều cần đăng nhập
router.use(authMiddleware);

router.get("/",                     getWishlist);
router.post("/:hotelId/toggle",     toggleWishlist);
router.delete("/:hotelId",          removeFromWishlist);

module.exports = router;
