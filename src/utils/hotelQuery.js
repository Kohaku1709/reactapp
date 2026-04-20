import { getDiscountRate } from "./hotelPricing";

// Called by: HomePage/HotelsPage để render thanh filter.
// Accepted values: chỉ các nhãn trong mảng này mới được filterHotels xử lý tường minh.
export const HOTEL_FILTERS = [
  "Tất cả",
  "5 sao",
  "4 sao",
  "3 sao",
  "Giá thấp nhất",
  "Đánh giá cao",
  "Có hồ bơi",
];

// Called by: useHotelListing -> filterHotels.
// Params: object ngưỡng lọc.
// Accepted values mặc định:
// - cheapPriceMax: số tiền ngưỡng lọc "Giá thấp nhất"
// - highRatingMin: điểm tối thiểu lọc "Đánh giá cao"
// Output: filter config mặc định.
// Does: gom ngưỡng để thay đổi tập trung.
export const HOTEL_FILTER_DEFAULTS = {
  cheapPriceMax: 1604000,
  highRatingMin: 4.6,
};

// Called by: HomePage/HotelsPage để render dropdown sort.
// Accepted values của sortBy chính là các field value bên dưới.
export const HOTEL_SORT_OPTIONS = [
  { value: "promotion", label: "Khuyến mãi tốt nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

export const HOTEL_SORT_DEFAULT = "promotion";

const DESTINATION_ALIASES = {
  hcm: ["tp hcm", "tp ho chi minh", "ho chi minh", "sai gon", "saigon"],
  hanoi: ["ha noi", "hanoi"],
  danang: ["da nang", "danang"],
  hoian: ["hoi an", "hoian"],
  phuquoc: ["phu quoc", "phuquoc"],
  nhatrang: ["nha trang", "nhatrang"],
};

// Called by: matchesDestination/getCanonicalDestination.
// Params: value. Accepted values: chuỗi bất kỳ, null/undefined.
// Output: chuỗi đã bỏ dấu + bỏ ký tự đặc biệt.
// Does: chuẩn hóa text để so khớp địa điểm ổn định.
const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

const ALIAS_TO_CANONICAL_DESTINATION = Object.entries(
  DESTINATION_ALIASES,
).reduce((aliasMap, [key, aliases]) => {
  aliases.forEach((alias) => {
    aliasMap.set(normalizeText(alias), key);
  });
  return aliasMap;
}, new Map());

// Called by: matchesDestination.
// Params: text địa điểm. Accepted values: chuỗi người dùng hoặc location từ hotel.
// Output: key canonical (hcm/hanoi/...) hoặc null nếu không map được.
// Does: ánh xạ alias về cùng một mã điểm đến.
const getCanonicalDestination = (text) => {
  const normalizedText = normalizeText(text);
  return ALIAS_TO_CANONICAL_DESTINATION.get(normalizedText) ?? null;
};

// Called by: HomePage/HotelsPage qua extraFilter.
// Params:
// - location: địa chỉ hotel (string)
// - destination: chuỗi người dùng nhập/chọn
// Output: boolean khớp/không khớp.
// Does: ưu tiên so chuỗi trực tiếp, fallback sang canonical alias để tránh mismatch tên gọi.
export const matchesDestination = (location, destination) => {
  if (!destination) return true;

  const normalizedLocation = normalizeText(location);
  const normalizedDestination = normalizeText(destination);

  if (!normalizedDestination) return true;
  if (
    normalizedLocation.includes(normalizedDestination) ||
    normalizedDestination.includes(normalizedLocation)
  ) {
    return true;
  }

  const locationKey = getCanonicalDestination(location);
  const destinationKey = getCanonicalDestination(destination);

  return Boolean(
    locationKey && destinationKey && locationKey === destinationKey,
  );
};

// Called by: filterHotels khi activeFilter="Có hồ bơi".
// Output: true nếu tags có chứa từ "hồ bơi".
const containsPoolTag = (hotel) =>
  hotel.tags.some((tag) => tag.toLowerCase().includes("hồ bơi"));

// Called by: useHotelListing.
// Params:
// - hotelList: hotel[]
// - activeFilter: một nhãn trong HOTEL_FILTERS
// - options: object ngưỡng lọc
// Output: hotel[] sau khi lọc.
// Does: áp điều kiện lọc theo activeFilter hiện tại.
export function filterHotels(
  hotelList,
  activeFilter,
  options = HOTEL_FILTER_DEFAULTS,
) {
  const { cheapPriceMax, highRatingMin } = options;

  return hotelList.filter((hotel) => {
    if (activeFilter === "5 sao") return hotel.rating === 5;
    if (activeFilter === "4 sao") return hotel.rating >= 4 && hotel.rating < 5;
    if (activeFilter === "3 sao") return hotel.rating >= 3 && hotel.rating < 4;
    if (activeFilter === "Giá thấp nhất") return hotel.price < cheapPriceMax;
    if (activeFilter === "Đánh giá cao") return hotel.rating >= highRatingMin;
    if (activeFilter === "Có hồ bơi") return containsPoolTag(hotel);

    return true;
  });
}

// Called by: useHotelListing.
// Params:
// - hotelList: hotel[]
// - sortBy: "promotion" | "price-asc" | "price-desc" | "rating"
// Output: mảng mới đã sắp xếp (không mutate mảng gốc).
// Does: áp chiến lược sort theo lựa chọn từ UI.
export function sortHotels(hotelList, sortBy) {
  if (sortBy === "promotion") {
    return [...hotelList].sort(
      (a, b) => getDiscountRate(b) - getDiscountRate(a),
    );
  }

  if (sortBy === "price-asc")
    return [...hotelList].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc")
    return [...hotelList].sort((a, b) => b.price - a.price);
  if (sortBy === "rating")
    return [...hotelList].sort((a, b) => b.rating - a.rating);

  return [...hotelList].sort((a, b) => getDiscountRate(b) - getDiscountRate(a));
}
