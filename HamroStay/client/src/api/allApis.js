// client/src/api/allApis.js
// Re-export all API modules from a single entry point
import axiosInstance from "./axiosInstance";

export const chatApi = {
  sendMessage:        (data)      => axiosInstance.post("/chat/message", data),
  getSessions:        ()          => axiosInstance.get("/chat/sessions"),
  getSessionMessages: (sessionId) => axiosInstance.get(`/chat/sessions/${sessionId}/messages`),
  deleteSession:      (sessionId) => axiosInstance.delete(`/chat/sessions/${sessionId}`),
};

export const paymentApi = {
  createSession:  (bookingId)      => axiosInstance.post("/payments/checkout", { bookingId }),
  getHistory:     ()               => axiosInstance.get("/payments/history"),
  refund:         (data)           => axiosInstance.post("/payments/refund", data),
  verifyPayment:  (sessionId)      => axiosInstance.get(`/payments/verify/${sessionId}`),
};

export const vendorApi = {
  getVendors:          (params)               => axiosInstance.get("/vendors", { params }),
  getVendorById:       (id)                   => axiosInstance.get(`/vendors/${id}`),
  getMyProfile:        ()                     => axiosInstance.get("/vendors/me"),
  createVendor:        (data)                 => axiosInstance.post("/vendors/register", data),
  updateVendor:        (id, data)             => axiosInstance.put(`/vendors/${id}`, data),
  approveVendor:       (id)                   => axiosInstance.patch(`/vendors/${id}/approve`),
  getInventory:        (vendorId)             => axiosInstance.get(`/vendors/${vendorId}/inventory`),
  addInventoryItem:    (vendorId, data)        => axiosInstance.post(`/vendors/${vendorId}/inventory`, data),
  updateInventoryItem: (vendorId, itemId, data)=> axiosInstance.put(`/vendors/${vendorId}/inventory/${itemId}`, data),
  getOrders:           (vendorId, params)      => axiosInstance.get(`/vendors/${vendorId}/orders`, { params }),
  createOrder:         (vendorId, data)        => axiosInstance.post(`/vendors/${vendorId}/orders`, data),
  updateOrderStatus:   (vendorId, orderId, status) => axiosInstance.patch(`/vendors/${vendorId}/orders/${orderId}/status`, { status }),
  getMyOrders:         (params)               => axiosInstance.get("/vendors/me/orders", { params }),
};

export const fnmisApi = {
  getKPIs:              ()       => axiosInstance.get("/fnmis/kpis"),
  getRevenue:           (period) => axiosInstance.get("/fnmis/revenue", { params: { period } }),
  getRevenueByRoomType: ()       => axiosInstance.get("/fnmis/revenue/by-room-type"),
  getOccupancy:         (period) => axiosInstance.get("/fnmis/occupancy", { params: { period } }),
  getExpenses:          (params) => axiosInstance.get("/fnmis/expenses", { params }),
  addExpense:           (data)   => axiosInstance.post("/fnmis/expenses", data),
};

export const userApi = {
  getAllUsers:           (params) => axiosInstance.get("/users", { params }),
  getUserById:           (id)     => axiosInstance.get(`/users/${id}`),
  updateProfile:         (data)   => axiosInstance.put("/users/profile", data),
  toggleUserStatus:      (id)     => axiosInstance.patch(`/users/${id}/toggle-status`),
  getNotifications:      ()       => axiosInstance.get("/users/notifications"),
  markNotificationsRead: ()       => axiosInstance.put("/users/notifications/read"),
};

export const bookingApi = {
  createBooking:       (data)         => axiosInstance.post("/bookings", data),
  getBookings:         (params)       => axiosInstance.get("/bookings", { params }),
  getBookingById:      (id)           => axiosInstance.get(`/bookings/${id}`),
  updateBookingStatus: (id, status)   => axiosInstance.put(`/bookings/${id}/status`, { status }),
  cancelBooking:       (id)           => axiosInstance.delete(`/bookings/${id}`),
};