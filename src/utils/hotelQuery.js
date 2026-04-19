import { getDiscountRate } from "./hotelPricing";

export const HOTEL_FILTERS = [
  "Tất cả",
  "5 sao",
  "4 sao",
  "3 sao",
  "Giá thấp nhất",
  "Đánh giá cao",
  "Có hồ bơi",
];

export const HOTEL_FILTER_DEFAULTS = {
  cheapPriceMax: 1604000,
  highRatingMin: 4.6,
};

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

const getCanonicalDestination = (text) => {
  const normalizedText = normalizeText(text);
  return ALIAS_TO_CANONICAL_DESTINATION.get(normalizedText) ?? null;
};

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

  // Fallback theo "điểm đến chuẩn" để tránh mismatch kiểu TP.HCM vs TP. Hồ Chí Minh.
  const locationKey = getCanonicalDestination(location);
  const destinationKey = getCanonicalDestination(destination);

  return Boolean(
    locationKey && destinationKey && locationKey === destinationKey,
  );
};

const containsPoolTag = (hotel) =>
  hotel.tags.some((tag) => tag.toLowerCase().includes("hồ bơi"));

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

  // Fallback: giữ hành vi mặc định an toàn nếu nhận sortBy lạ từ UI/query params.
  return [...hotelList].sort((a, b) => getDiscountRate(b) - getDiscountRate(a));
}
