const BASE = "http://localhost:3001/api";

export const getToken = () => localStorage.getItem("stayhtm_token");
export const setToken = (t) => localStorage.setItem("stayhtm_token", t);
export const removeToken = () => localStorage.removeItem("stayhtm_token");

// Helper fetch dùng chung — tự gắn Authorization header nếu có token
export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  return res.json();
};

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email, password, name) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  getMe: () => apiFetch("/auth/me"),

  updateMe: (name) =>
    apiFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
};

// ─── Hotels ───────────────────────────────────────────────────────────────────
export const hotelAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.sort)        qs.set("sort",      params.sort);
    if (params.filter && params.filter !== "Tất cả") qs.set("filter", params.filter);
    if (params.search)      qs.set("search",    params.search);
    if (params.min_price)   qs.set("min_price", params.min_price);
    if (params.max_price)   qs.set("max_price", params.max_price);
    if (params.page)        qs.set("page",      params.page);
    qs.set("limit", params.limit || 100);
    return apiFetch(`/hotels?${qs}`);
  },

  getById: (id) => apiFetch(`/hotels/${id}`),

  getFeatured: () => apiFetch("/hotels/featured"),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  getAll: () => apiFetch("/wishlist"),

  toggle: (hotelId) =>
    apiFetch(`/wishlist/${hotelId}/toggle`, { method: "POST" }),

  add: (hotelId) =>
    apiFetch(`/wishlist/${hotelId}`, { method: "POST" }),

  remove: (hotelId) =>
    apiFetch(`/wishlist/${hotelId}`, { method: "DELETE" }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingAPI = {
  getAll: () => apiFetch("/bookings"),

  create: (payload) =>
    apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getById: (id) => apiFetch(`/bookings/${id}`),

  cancel: (id) =>
    apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" }),
};

// ─── Contact ──────────────────────────────────────────────────────────────────
export const contactAPI = {
  send: (payload) =>
    apiFetch("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationAPI = {
  getAll: () => apiFetch("/locations"),
};
