/**
 * Tạo Context Provider cho dữ liệu khách sạn (Hotel).
 *
 * @param {Object} props - Các props của component
 * @param {Object} props.hotel - Đối tượng khách sạn chứa thông tin chi tiết của khách sạn
 * @param {React.ReactNode} props.children - Các component con sẽ được bọc bởi Provider này.
 *                                           Children là các React component/element mà sẽ có quyền truy cập
 *                                           vào HotelContext thông qua useContext hook
 * @returns {React.ReactElement} Trả về HotelContext.Provider bọc toàn bộ children components
 *
 * @description
 * HotelProvider là một Context Provider component dùng để:
 * - Cung cấp dữ liệu hotel cho tất cả các component con (descendants) mà không cần prop drilling
 * - Sử dụng useMemo để đảm bảo object value ổn định, chỉ thay đổi khi prop 'hotel' thay đổi
 * - Giúp tránh re-render không cần thiết ở các component con
 *
 * @example
 * <HotelProvider hotel={hotelData}>
 *   <Router />
 * </HotelProvider>
 */
import { createContext, createElement, useContext, useMemo } from "react";
// Shared hotel context.
export const HotelContext = createContext(null);

// Called by: App để bọc toàn bộ router tree.
// Params:
// - hotel: Hotel.
// - children: ReactNode
// Output: Context Provider chứa toàn bộ hotel state.
// Does: gom dữ liệu khách sạn vào một nguồn dùng chung, tránh prop drilling.
export const HotelProvider = ({
  selectedHotel,
  startDay,
  endDay,
  location,
  onSelectHotel,
  onSetStartDay,
  onSetEndDay,
  onSetLocation,
  children,
}) => {
  // Does: giữ hotel ổn định giữa các lần render (trừ khi dependency đổi).
  const value = useMemo(
    () => ({
      selectedHotel,
      startDay,
      endDay,
      location,
      onSelectHotel,
      onSetStartDay,
      onSetEndDay,
      onSetLocation,
    }),
    [selectedHotel, startDay, endDay, location],
  );
  return createElement(HotelContext.Provider, { value }, children);
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotel must be used within a HotelProvider");
  }
  return context;
};
