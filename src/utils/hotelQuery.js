import { getDiscountRate } from "./hotelPricing";

// Danh sách các bộ lọc hiển thị trên giao diện thanh tìm kiếm/lọc
// Chỉ những nhãn trong mảng này mới được xử lý lọc cụ thể
export const HOTEL_FILTERS = [
  "Tất cả",
  "5 sao",
  "4 sao",
  "3 sao",
  "Giá thấp nhất",
  "Đánh giá cao",
  "Có hồ bơi",
];

// Ngưỡng lọc mặc định được áp dụng khi lọc giá rẻ hoặc đánh giá cao
// - cheapPriceMax: giá tối đa để được coi là "Giá thấp nhất" (1,604,000₫)
// - highRatingMin: điểm đánh giá trung bình tối thiểu để được coi là "Đánh giá cao" (4.6)
export const HOTEL_FILTER_DEFAULTS = {
  cheapPriceMax: 1604000,
  highRatingMin: 4.6,
};

// Các tùy chọn sắp xếp hiển thị ở dropdown trên trang danh sách khách sạn
export const HOTEL_SORT_OPTIONS = [
  { value: "promotion", label: "Khuyến mãi tốt nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

// Kiểu sắp xếp mặc định khi người dùng mới tải trang là theo Khuyến mãi
export const HOTEL_SORT_DEFAULT = "promotion";

// Định nghĩa các bí danh (aliases) cho các thành phố lớn tại Việt Nam
// Giúp tìm kiếm thông minh hơn khi người dùng nhập các từ viết tắt/khác nhau (ví dụ: hcm, sai gon, tp hcm đều quy về hcm)
const DESTINATION_ALIASES = {
  hcm: ["tp hcm", "tp ho chi minh", "ho chi minh", "sai gon", "saigon"],
  hanoi: ["ha noi", "hanoi"],
  danang: ["da nang", "danang"],
  hoian: ["hoi an", "hoian"],
  phuquoc: ["phu quoc", "phuquoc"],
  nhatrang: ["nha trang", "nhatrang"],
};

// Hàm chuẩn hóa chuỗi văn bản: chuyển thành chữ thường, loại bỏ dấu tiếng Việt và các ký tự đặc biệt
// Ví dụ: "TP. Hồ Chí Minh" -> "tphochiminh"
const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu
    .replace(/[^a-z0-9]/g, "")      // Loại bỏ ký tự đặc biệt khác ngoài chữ và số
    .trim();

// Tạo một bản đồ (Map) từ bí danh sang tên điểm đến chuẩn hóa (canonical key)
// Ví dụ: "sai gon" -> "hcm", "tp ho chi minh" -> "hcm"
const ALIAS_TO_CANONICAL_DESTINATION = Object.entries(
  DESTINATION_ALIASES,
).reduce((aliasMap, [key, aliases]) => {
  aliases.forEach((alias) => {
    aliasMap.set(normalizeText(alias), key);
  });
  return aliasMap;
}, new Map());

// Hàm lấy tên điểm đến chuẩn hóa dựa trên văn bản nhập vào
// Trả về canonical key (hcm, hanoi...) hoặc null nếu không khớp
const getCanonicalDestination = (text) => {
  const normalizedText = normalizeText(text);
  return ALIAS_TO_CANONICAL_DESTINATION.get(normalizedText) ?? null;
};

// Kiểm tra xem vị trí của khách sạn có khớp với từ khóa tìm kiếm điểm đến hay không
// Hỗ trợ cả tìm kiếm chuỗi trực tiếp và qua bảng đối chiếu bí danh thông minh
export const matchesDestination = (location, destination) => {
  if (!destination) return true; // Nếu không nhập điểm đến thì coi như khớp tất cả

  const normalizedLocation = normalizeText(location);
  const normalizedDestination = normalizeText(destination);

  if (!normalizedDestination) return true;
  
  // So khớp trực tiếp chuỗi sau khi chuẩn hóa
  if (
    normalizedLocation.includes(normalizedDestination) ||
    normalizedDestination.includes(normalizedLocation)
  ) {
    return true;
  }

  // Nếu so khớp trực tiếp thất bại, sử dụng bảng bí danh thông minh
  const locationKey = getCanonicalDestination(location);
  const destinationKey = getCanonicalDestination(destination);

  return Boolean(
    locationKey && destinationKey && locationKey === destinationKey,
  );
};

// Kiểm tra xem khách sạn có tiện ích hồ bơi hay không
// Duyệt qua mảng tags của khách sạn tìm từ khóa "hồ bơi"
const containsPoolTag = (hotel) =>
  (hotel.tags || []).some((tag) => tag.toLowerCase().includes("hồ bơi"));

// Hàm chính để lọc danh sách khách sạn theo bộ lọc được chọn (activeFilter)
// - hotelList: mảng danh sách khách sạn ban đầu
// - activeFilter: bộ lọc đang kích hoạt ("5 sao", "Có hồ bơi"...)
// - options: ngưỡng giá thấp và đánh giá cao
export function filterHotels(
  hotelList,
  activeFilter,
  options = HOTEL_FILTER_DEFAULTS,
) {
  const { cheapPriceMax, highRatingMin } = options;

  return hotelList.filter((hotel) => {
    // Sửa lỗi so khớp số sao (hotel.stars) thay vì điểm đánh giá (hotel.rating)
    if (activeFilter === "5 sao") return hotel.stars === 5;
    if (activeFilter === "4 sao") return hotel.stars === 4;
    if (activeFilter === "3 sao") return hotel.stars === 3;
    
    // Lọc các khách sạn có giá nhỏ hơn ngưỡng quy định
    if (activeFilter === "Giá thấp nhất") return hotel.price < cheapPriceMax;
    
    // Lọc các khách sạn có điểm đánh giá trung bình cao hơn ngưỡng quy định
    if (activeFilter === "Đánh giá cao") return hotel.rating >= highRatingMin;
    
    // Lọc các khách sạn có hồ bơi
    if (activeFilter === "Có hồ bơi") return containsPoolTag(hotel);

    return true; // Mặc định bộ lọc "Tất cả" trả về true
  });
}

// Hàm chính để sắp xếp danh sách khách sạn theo lựa chọn
// Trả về một mảng mới đã sắp xếp mà không thay đổi (mutate) mảng gốc
export function sortHotels(hotelList, sortBy) {
  // Sắp xếp theo mức giảm giá từ cao đến thấp (Khuyến mãi tốt nhất)
  if (sortBy === "promotion") {
    return [...hotelList].sort(
      (a, b) => getDiscountRate(b) - getDiscountRate(a),
    );
  }

  // Sắp xếp theo giá phòng tăng dần
  if (sortBy === "price-asc")
    return [...hotelList].sort((a, b) => a.price - b.price);
    
  // Sắp xếp theo giá phòng giảm dần
  if (sortBy === "price-desc")
    return [...hotelList].sort((a, b) => b.price - a.price);
    
  // Sắp xếp theo điểm đánh giá trung bình từ cao đến thấp
  if (sortBy === "rating")
    return [...hotelList].sort((a, b) => b.rating - a.rating);

  // Fallback mặc định sắp xếp theo khuyến mãi tốt nhất
  return [...hotelList].sort((a, b) => getDiscountRate(b) - getDiscountRate(a));
}
