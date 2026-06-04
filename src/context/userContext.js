import { createContext, createElement, useContext, useMemo } from "react";

export const UserContext = createContext(null);

export const UserProvider = ({
  currentUser,
  wishlistHotelIds,
  wishlistHotels,
  onLogin,
  onLogout,
  onToggleWishlist,
  children,
}) => {
  const value = useMemo(
    () => ({ currentUser, wishlistHotelIds, wishlistHotels, onLogin, onLogout, onToggleWishlist }),
    [currentUser, wishlistHotelIds, wishlistHotels, onLogin, onLogout, onToggleWishlist]
  );
  return createElement(UserContext.Provider, { value }, children);
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
};
