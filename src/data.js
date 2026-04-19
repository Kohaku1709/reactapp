// File này chỉ chứa dữ liệu mẫu cho demo.
// Tách dữ liệu riêng giúp component gọn hơn và dễ thay dữ liệu sau này.

// Danh sách khách sạn dùng cho HomePage và HotelsPage.
export const hotels = [
  {
    id: 1,
    name: "The Grand Saigon Palace",
    location: "Quận 1, TP.HCM",
    rating: 4.9,
    reviews: 2341,
    price: 2850000,
    originalPrice: 3800000,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    tags: ["Hồ bơi vô cực", "Spa", "Nhà hàng"],
    badge: "Bán chạy nhất",
    stars: 5,
  },
  {
    id: 2,
    name: "Mekong River Boutique",
    location: "Bến Nghé, TP.HCM",
    rating: 4.7,
    reviews: 987,
    price: 1450000,
    originalPrice: 1900000,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
    tags: ["View sông", "Bữa sáng miễn phí", "Gym"],
    badge: "Giá tốt",
    stars: 4,
  },
  {
    id: 3,
    name: "Lotus Heritage Resort",
    location: "Thủ Đức, TP.HCM",
    rating: 4.8,
    reviews: 1523,
    price: 3200000,
    originalPrice: 4100000,
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    tags: ["Biệt thự riêng", "Hồ bơi", "Butler service"],
    badge: "Sang trọng",
    stars: 5,
  },
  {
    id: 4,
    name: "Cityscape Business Hotel",
    location: "Bình Thạnh, TP.HCM",
    rating: 4.5,
    reviews: 654,
    price: 980000,
    originalPrice: 1200000,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
    tags: ["Trung tâm thành phố", "Wifi tốc độ cao", "Coworking"],
    badge: "Giá rẻ",
    stars: 4,
  },
  {
    id: 5,
    name: "Indochine Sky Suites",
    location: "Quận 3, TP.HCM",
    rating: 4.6,
    reviews: 1102,
    price: 1750000,
    originalPrice: 2300000,
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
    tags: ["Tầng thượng", "Bar", "Lịch sử"],
    badge: "Đặc sắc",
    stars: 4,
  },
  {
    id: 6,
    name: "Pearl Riverside Escape",
    location: "Quận 4, TP.HCM",
    rating: 4.4,
    reviews: 431,
    price: 820000,
    originalPrice: 1100000,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    tags: ["Ven sông", "Yên tĩnh", "Bếp riêng"],
    badge: null,
    stars: 3,
  },
  {
    id: 7,
    name: "Azure Rooftop Hotel",
    location: "Quận 7, TP.HCM",
    rating: 4.3,
    reviews: 312,
    price: 1100000,
    originalPrice: 1400000,
    image:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80",
    tags: ["Rooftop pool", "Bar", "Gym"],
    badge: null,
    stars: 4,
  },
  {
    id: 8,
    name: "Saigon Heritage Inn",
    location: "Quận 1, TP.HCM",
    rating: 4.2,
    reviews: 218,
    price: 650000,
    originalPrice: 850000,
    image:
      "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=600&q=80",
    tags: ["Lịch sử", "Trung tâm", "Bữa sáng"],
    badge: null,
    stars: 3,
  },
  {
    id: 9,
    name: "The Riviera Suites",
    location: "Quận 2, TP.HCM",
    rating: 4.8,
    reviews: 876,
    price: 2400000,
    originalPrice: 3100000,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
    tags: ["Hồ bơi", "Spa", "Nhà hàng fine dining"],
    badge: "Mới mở",
    stars: 5,
  },
];

export const destinations = [
  {
    name: "Hà Nội",
    img: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=300&q=80",
    hotels: "1,234",
  },
  {
    name: "Đà Nẵng",
    img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=300&q=80",
    hotels: "876",
  },
  {
    name: "Hội An",
    img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=300&q=80",
    hotels: "543",
  },
  {
    name: "Phú Quốc",
    img: "https://images.unsplash.com/photo-1602940659805-770d1b3b9911?w=300&q=80",
    hotels: "412",
  },
  {
    name: "Nha Trang",
    img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80",
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
