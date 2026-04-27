// client/src/api/authApi.js
import axiosInstance from "./axiosInstance";

export const authApi = {
  register:       (data)  => axiosInstance.post("/auth/register", data),
  login:          (data)  => axiosInstance.post("/auth/login", data),
  logout:         ()      => axiosInstance.post("/auth/logout"),
  refresh:        ()      => axiosInstance.post("/auth/refresh"),
  getMe:          ()      => axiosInstance.get("/auth/me"),
  changePassword: (data)  => axiosInstance.put("/auth/change-password", data),
};
