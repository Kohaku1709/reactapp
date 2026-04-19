export const getDiscountRate = (hotel) => {
  if (!hotel.originalPrice || hotel.originalPrice <= 0) return 0;
  return 1 - hotel.price / hotel.originalPrice;
};

export const getDiscountPercent = (hotel) =>
  Math.round(getDiscountRate(hotel) * 100);
