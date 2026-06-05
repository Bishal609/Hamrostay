// client/src/api/bookingApi.js
import axiosInstance from "./axiosInstance";

export const bookingApi = {
  createBooking:       (data)         => axiosInstance.post("/bookings", data),
  getBookings:         (params)       => axiosInstance.get("/bookings", { params }),
  getBookingById:      (id)           => axiosInstance.get(`/bookings/${id}`),
  updateBookingStatus: (id, status)   => axiosInstance.put(`/bookings/${id}/status`, { status }),
  cancelBooking:       (id)           => axiosInstance.delete(`/bookings/${id}`),
};
