import axiosInstance from "./axiosInstance";
export const paymentApi = {
  createSession: (bookingId) => axiosInstance.post("/payments/create-session", { bookingId }),
  getHistory:    ()          => axiosInstance.get("/payments/history"),
  refund:        (data)      => axiosInstance.post("/payments/refund", data),
};