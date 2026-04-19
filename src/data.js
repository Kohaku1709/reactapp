// File này sinh dữ liệu mẫu cho đồ án.
// Mục tiêu: dữ liệu đủ đa dạng để test UI/filter/sort, không mô phỏng thị trường 100% chính xác.
const hotelNamePrefixes = [
  "Aurora",
  "Lotus",
  "Sapphire",
  "Golden",
  "Emerald",
  "Coral",
  "Velvet",
  "Atlas",
  "Sunrise",
  "Luna",
  "Bamboo",
  "Ivory",
  "Harmony",
  "Ocean",
  "Heritage",
];

const hotelNameStyles = [
  "Riverside",
  "Skyline",
  "Garden",
  "Boutique",
  "Harbor",
  "Peak",
  "Lagoon",
  "Old Quarter",
  "Forest",
  "Seaview",
  "Central",
  "Hilltop",
  "Premier",
  "Sunset",
  "Bayfront",
];

const hotelNameTypes = [
  "Hotel",
  "Resort",
  "Suites",
  "Retreat",
  "Inn",
  "Villas",
  "Residence",
  "Lodge",
  "Haven",
  "Palace",
];

const hotelLocations = [
  "Quận 1, TP.HCM",
  "Quận 3, TP.HCM",
  "Quận 7, TP.HCM",
  "Thủ Đức, TP.HCM",
  "Hoàn Kiếm, Hà Nội",
  "Tây Hồ, Hà Nội",
  "Sơn Trà, Đà Nẵng",
  "Hải Châu, Đà Nẵng",
  "Cẩm Châu, Hội An",
  "Trần Phú, Nha Trang",
  "Dương Đông, Phú Quốc",
  "Bãi Cháy, Hạ Long",
  "TP. Đà Lạt, Lâm Đồng",
  "Ninh Kiều, Cần Thơ",
  "Mũi Né, Bình Thuận",
  "TP. Vũng Tàu, Bà Rịa - Vũng Tàu",
  "Tràng An, Ninh Bình",
  "Sapa, Lào Cai",
  "Tam Đảo, Vĩnh Phúc",
  "Cát Bà, Hải Phòng",
  "TP. Huế, Thừa Thiên Huế",
  "TP. Quy Nhơn, Bình Định",
  "TP. Đồng Hới, Quảng Bình",
  "Bố Trạch, Quảng Bình",
  "TP. Buôn Ma Thuột, Đắk Lắk",
  "TP. Pleiku, Gia Lai",
  "TP. Tuy Hòa, Phú Yên",
  "Cam Ranh, Khánh Hòa",
  "Mộc Châu, Sơn La",
  "Mũi Cà Mau, Cà Mau",
];

const hotelTagPool = [
  "Hồ bơi",
  "Spa",
  "Nhà hàng",
  "Gym",
  "Bữa sáng miễn phí",
  "View biển",
  "View sông",
  "Phòng gia đình",
  "Wifi tốc độ cao",
  "Lễ tân 24/7",
  "Đưa đón sân bay",
  "Rooftop bar",
  "Bãi biển riêng",
  "Kid club",
  "Pet friendly",
  "Coworking space",
  "Phong cách boutique",
  "Check-in đẹp",
  "Yên tĩnh",
  "Trung tâm thành phố",
];

const hotelBadgePool = [
  "Bán chạy",
  "Giá tốt",
  "Mới mở",
  "Gia đình yêu thích",
  "Nghỉ dưỡng cao cấp",
  "Ưu đãi cuối tuần",
  "Đặt nhiều hôm nay",
];

const getHotelImage = (id) => `https://picsum.photos/seed/hotel-${id}/900/600`;
const getDestinationImage = (name) =>
  `https://picsum.photos/seed/destination-${encodeURIComponent(name)}/600/400`;

const roundToNearest50k = (value) => Math.round(value / 50000) * 50000;

const getLocationDemandFactor = (location) => {
  if (
    /(Quận 1|Hoàn Kiếm|Tây Hồ|Sơn Trà|Cam Ranh|Phú Quốc|Bãi Cháy|Trần Phú)/.test(
      location,
    )
  ) {
    return 1.28;
  }
  if (
    /(Hội An|Đà Lạt|Sapa|Mũi Né|Cát Bà|Ninh Bình|Huế|Nha Trang)/.test(location)
  ) {
    return 1.14;
  }
  if (/(Pleiku|Cà Mau|Buôn Ma Thuột|Đồng Hới|Tuy Hòa)/.test(location)) {
    return 0.92;
  }
  return 1;
};

const getBadge = ({ rating, reviews, discountRate, stars, id }) => {
  if (rating >= 4.7 && reviews >= 1600) return hotelBadgePool[0];
  if (discountRate >= 0.22) return hotelBadgePool[1];
  if (id % 17 === 0) return hotelBadgePool[2];
  if (stars === 5 && rating >= 4.6) return hotelBadgePool[4];
  if (stars >= 4 && id % 11 === 0) return hotelBadgePool[3];
  if (id % 13 === 0) return hotelBadgePool[5];
  return null;
};

const ratingScale = Array.from({ length: 31 }, (_, idx) =>
  Number((5 - idx * 0.1).toFixed(1)),
);

export const hotels = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1;
  const location = hotelLocations[id % hotelLocations.length];
  // Dùng thang 0.1 để có nhiều mức rating (5.0, 4.9, ..., 2.0) thay vì lặp quá ít giá trị.
  const rating = ratingScale[(id * 7) % ratingScale.length];
  const stars = rating >= 4.6 ? 5 : rating >= 4.0 ? 4 : rating >= 3.2 ? 3 : 2;
  const demandFactor = getLocationDemandFactor(location);
  const basePriceByStars = {
    2: 540000,
    3: 920000,
    4: 1580000,
    5: 2760000,
  };
  const seasonalFactor = 0.92 + ((id * 5) % 9) * 0.03;
  const price = roundToNearest50k(
    basePriceByStars[stars] * demandFactor * seasonalFactor,
  );
  // Giá gốc được suy ra từ giá hiện tại + mức giảm để sort khuyến mãi dùng chung.
  const discountRate = Number(
    (0.08 + ((id * 11) % 8) * 0.025 + (rating < 3.5 ? 0.05 : 0)).toFixed(3),
  );
  const originalPrice = roundToNearest50k(
    price / (1 - Math.min(discountRate, 0.33)),
  );
  const reviews = Math.max(
    60,
    Math.round(
      150 + ((id * 71) % 1400) + demandFactor * 850 + (rating - 3) * 520,
    ),
  );
  const tagStart = (id * 3) % hotelTagPool.length;
  const locationHintTag =
    /biển|Bãi|Cam Ranh|Phú Quốc|Mũi Né|Nha Trang|Vũng Tàu/i.test(location)
      ? "View biển"
      : /sông|Riverside|Ninh Kiều/i.test(location)
        ? "View sông"
        : /Sapa|Đà Lạt|Tam Đảo|Mộc Châu/i.test(location)
          ? "Check-in đẹp"
          : "Trung tâm thành phố";
  const serviceTag = stars >= 4 ? "Spa" : "Bữa sáng miễn phí";
  const convenienceTag = stars >= 5 ? "Đưa đón sân bay" : "Wifi tốc độ cao";

  return {
    id,
    name: `${hotelNamePrefixes[id % hotelNamePrefixes.length]} ${
      hotelNameStyles[(id * 2) % hotelNameStyles.length]
    } ${hotelNameTypes[(id * 3) % hotelNameTypes.length]}`,
    location,
    rating,
    reviews,
    price,
    originalPrice,
    image: getHotelImage(id),
    tags: [
      locationHintTag,
      serviceTag,
      hotelTagPool[(tagStart + (stars >= 4 ? 5 : 9)) % hotelTagPool.length],
      convenienceTag,
    ],
    badge: getBadge({ rating, reviews, discountRate, stars, id }),
    stars,
  };
});

export const destinations = [
  {
    name: "TP.HCM",
    img: getDestinationImage("tp-ho-chi-minh"),
    hotels: "2,345",
  },
  {
    name: "Hà Nội",
    img: getDestinationImage("ha-noi"),
    hotels: "1,234",
  },
  {
    name: "Đà Nẵng",
    img: getDestinationImage("da-nang"),
    hotels: "876",
  },
  {
    name: "Hội An",
    img: getDestinationImage("hoi-an"),
    hotels: "543",
  },
  {
    name: "Phú Quốc",
    img: getDestinationImage("phu-quoc"),
    hotels: "412",
  },
  {
    name: "Nha Trang",
    img: getDestinationImage("nha-trang"),
    hotels: "721",
  },
];

// Số liệu hiển thị ở AboutPage.
export const stats = [
  { number: "500K+", label: "Khách sạn toàn cầu" },
  { number: "2M+", label: "Khách hàng tin dùng" },
  { number: "98%", label: "Tỷ lệ hài lòng" },
  { number: "24/7", label: "Hỗ trợ khách hàng" },
];

export const values = [
  {
    icon: "🏆",
    title: "Chất lượng hàng đầu",
    desc: "Chúng tôi chỉ hợp tác với các khách sạn đạt tiêu chuẩn chất lượng cao, đảm bảo trải nghiệm tốt nhất cho khách hàng.",
  },
  {
    icon: "💰",
    title: "Giá cả minh bạch",
    desc: "Không phí ẩn, không bất ngờ. Giá bạn thấy là giá bạn trả — cam kết rõ ràng từ lúc đặt đến lúc check-out.",
  },
  {
    icon: "🤝",
    title: "Hỗ trợ tận tâm",
    desc: "Đội ngũ hỗ trợ 24/7 luôn sẵn sàng giải quyết mọi vấn đề, từ thay đổi đặt phòng đến yêu cầu đặc biệt.",
  },
  {
    icon: "🌱",
    title: "Du lịch bền vững",
    desc: "Chúng tôi ưu tiên các đối tác cam kết bảo vệ môi trường và phát triển du lịch có trách nhiệm.",
  },
];

// Thông tin liên hệ hiển thị ở ContactPage.
export const contactInfo = [
  {
    icon: "📍",
    title: "Địa chỉ",
    detail: "97 Man Thiện, P. Tăng Nhơn Phú, TP. Hồ Chí Minh",
  },
  { icon: "📞", title: "Điện thoại", detail: "0358 749 165" },
  { icon: "✉️", title: "Email", detail: "ngvanhau1201@gmail.com" },
  {
    icon: "🕐",
    title: "Giờ làm việc",
    detail: "24/7 — Hỗ trợ khách hàng liên tục",
  },
];
