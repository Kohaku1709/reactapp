import { createContext, createElement, useContext, useMemo } from "react";

// Shared auth/wishlist context.
export const UserContext = createContext(null);

// Called by: App để bọc toàn bộ router tree.
// Params:
// - currentUser: null hoặc { email: string, name: string }
// - wishlistHotelIds: number[] (id khách sạn)
// - onLogin/onLogout/onToggleWishlist: function callback
// - children: ReactNode
// Output: Context Provider chứa toàn bộ user state/action.
// Does: gom dữ liệu user vào một nguồn dùng chung, tránh prop drilling.
export const UserProvider = ({
  currentUser,
  wishlistHotelIds,
  onLogin,
  onLogout,
  onToggleWishlist,
  children,
}) => {
  // Does: giữ object value ổn định giữa các lần render (trừ khi dependency đổi).
  const value = useMemo(
    () => ({
      // null là chưa đăng nhập; object là đã đăng nhập.
      currentUser,
      wishlistHotelIds,
      onLogin,
      onLogout,
      onToggleWishlist,
    }),
    [currentUser, wishlistHotelIds, onLogin, onLogout, onToggleWishlist],
  );

  return createElement(UserContext.Provider, { value }, children);
};

// Called by: component con (Navbar, pages...) cần user state/action.
// Params: không có.
// Output: object context { currentUser, wishlistHotelIds, onLogin, onLogout, onToggleWishlist }.
// Does: đọc context và fail-fast bằng error nếu quên bọc UserProvider.
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};
