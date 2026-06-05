import axiosInstance from "./axiosInstance";

export const paymentApi = {
  createSession:    (bookingId)      => axiosInstance.post("/payments/checkout", { bookingId }),
  getKhaltiSession: (sessionId)      => axiosInstance.get(`/payments/khalti/${sessionId}`),
  getHistory:       ()               => axiosInstance.get("/payments/history"),
  refund:           (data)           => axiosInstance.post("/payments/refund", data),
  verifyPayment:    (sessionId)      => axiosInstance.get(`/payments/verify/${sessionId}`),
};