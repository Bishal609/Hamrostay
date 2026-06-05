import axiosInstance from "./axiosInstance";
export const chatApi = {
  sendMessage:        (data)      => axiosInstance.post("/chat/message", data),
  getSessions:        ()          => axiosInstance.get("/chat/sessions"),
  getSessionMessages: (sessionId) => axiosInstance.get(`/chat/sessions/${sessionId}/messages`),
  deleteSession:      (sessionId) => axiosInstance.delete(`/chat/sessions/${sessionId}`),
};