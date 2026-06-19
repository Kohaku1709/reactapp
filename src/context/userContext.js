import { createContext, createElement, useContext, useMemo } from "react";

// Khởi tạo một React Context trống cho thông tin người dùng
export const UserContext = createContext(null);

// Component Provider bọc bên ngoài ứng dụng để chia sẻ State người dùng mà không cần truyền prop thủ công qua nhiều cấp (prop-drilling)
export const UserProvider = ({
  currentUser, // User đang đăng nhập hiện tại
  wishlistHotelIds, // Mảng chứa ID các khách sạn yêu thích
  wishlistHotels, // Mảng chứa toàn bộ dữ liệu các khách sạn yêu thích
  bookedHotelIds, // Mảng chứa ID các khách sạn đã đặt phòng
  setBookedHotelIds, // Hàm cập nhật danh sách đã đặt
  onLogin, // Callback xử lý đăng nhập thành công
  onLogout, // Callback xử lý đăng xuất
  onToggleWishlist, // Callback xử lý thêm/bớt yêu thích
  children, // Các Component con được bọc bên trong
}) => {
  // Gộp các giá trị và hàm callback vào một object duy nhất.
  // Sử dụng useMemo để tối ưu: chỉ khởi tạo lại object này khi một trong các dependencies thay đổi.
  const value = useMemo(
    () => ({
      currentUser,
      wishlistHotelIds,
      wishlistHotels,
      bookedHotelIds,
      setBookedHotelIds,
      onLogin,
      onLogout,
      onToggleWishlist,
    }),
    [
      currentUser,
      wishlistHotelIds,
      wishlistHotels,
      bookedHotelIds,
      setBookedHotelIds,
      onLogin,
      onLogout,
      onToggleWishlist,
    ],
  );

  // Trả về thẻ Provider truyền giá trị Context cho toàn bộ các Component con bên dưới
  return createElement(UserContext.Provider, { value }, children);
};

// Custom hook giúp các Component con nhanh chóng truy xuất dữ liệu từ UserContext mà không cần gọi useContext(UserContext)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
};
