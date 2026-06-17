import { createContext, createElement, useContext, useMemo } from "react";

// Khởi tạo một React Context trống cho thông tin đặt phòng khách sạn
export const HotelContext = createContext(null);

// Component Provider dùng để gom thông tin đặt phòng vào một nguồn dùng chung duy nhất
// Tránh việc phải truyền props thủ công xuống các component con sâu trong cấu trúc cây
export const HotelProvider = ({
  selectedHotel,    // Khách sạn đang được chọn để đặt phòng
  startDay,         // Ngày nhận phòng
  endDay,           // Ngày trả phòng
  location,         // Vị trí/Khu vực tìm kiếm hiện tại
  onSelectHotel,    // Callback khi chọn khách sạn
  onSetStartDay,    // Callback đặt ngày nhận phòng
  onSetEndDay,      // Callback đặt ngày trả phòng
  onSetLocation,    // Callback đặt vị trí/địa chỉ tìm kiếm
  children,         // Các React Component con được bọc
}) => {
  // Giữ object dữ liệu ổn định giữa các lần render để giảm thiểu việc re-render không cần thiết của component con
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
  
  // Trả về thẻ Provider truyền dữ liệu Context đặt phòng xuống dưới
  return createElement(HotelContext.Provider, { value }, children);
};

// Custom hook giúp truy xuất nhanh các state và hàm quản lý đặt phòng từ HotelContext
export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotel must be used within a HotelProvider");
  }
  return context;
};
