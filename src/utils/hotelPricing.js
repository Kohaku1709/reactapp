// Called by: hotelQuery.sortHotels() và HotelCard.
// Params: hotel object có field price, originalPrice.
// Accepted values: originalPrice > 0 để tính giảm giá; thiếu/<=0 thì coi như 0%.
// Output: số thực trong khoảng [0,1] đại diện tỷ lệ giảm.
// Does: chuẩn hóa công thức giảm giá dùng chung toàn app.
export const getDiscountRate = (hotel) => {
  if (!hotel.originalPrice || hotel.originalPrice <= 0) return 0;
  return 1 - hotel.price / hotel.originalPrice;
};

// Called by: HotelCard khi render badge "-x%".
// Params: hotel (cùng schema với getDiscountRate).
// Output: phần trăm giảm giá dạng số nguyên.
// Does: chuyển discount rate từ số thực sang phần trăm dễ đọc.
export const getDiscountPercent = (hotel) =>
  Math.round(getDiscountRate(hotel) * 100);
