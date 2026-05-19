// client/src/api/roomApi.js
import axiosInstance from "./axiosInstance";

export const roomApi = {
  getRooms:          (params)       => axiosInstance.get("/rooms", { params }),
  getRoomById:       (id)           => axiosInstance.get(`/rooms/${id}`),
  getAvailableRooms: (params)       => axiosInstance.get("/rooms/available", { params }),
  checkAvailability: (id, params)   => axiosInstance.get(`/rooms/${id}/availability`, { params }),
  createRoom:        (data)         => axiosInstance.post("/rooms", data),
  updateRoom:        (id, data)     => axiosInstance.put(`/rooms/${id}`, data),
  deleteRoom:        (id)           => axiosInstance.delete(`/rooms/${id}`),
};
