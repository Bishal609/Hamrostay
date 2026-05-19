import axiosInstance from "./axiosInstance";
export const userApi = {
  getAllUsers:           (params) => axiosInstance.get("/users", { params }),
  getUserById:           (id)     => axiosInstance.get(`/users/${id}`),
  updateProfile:         (data)   => axiosInstance.put("/users/profile", data),
  toggleUserStatus:      (id)     => axiosInstance.patch(`/users/${id}/toggle-status`),
  getNotifications:      ()       => axiosInstance.get("/users/notifications"),
  markNotificationsRead: ()       => axiosInstance.put("/users/notifications/read"),
};