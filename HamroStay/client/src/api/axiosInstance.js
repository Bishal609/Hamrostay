// client/src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor: attach access token ──────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Dynamically read from store to always get latest token
    try {
      const stored = JSON.parse(localStorage.getItem("hamrostay-auth") || "{}");
      const token = stored?.state?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401, auto-refresh ────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axiosInstance.post("/auth/refresh");
        const { accessToken } = res.data.data;

        // Update store
        const stored = JSON.parse(localStorage.getItem("hamrostay-auth") || "{}");
        if (stored.state) {
          stored.state.accessToken = accessToken;
          localStorage.setItem("hamrostay-auth", JSON.stringify(stored));
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth and redirect to login
        localStorage.removeItem("hamrostay-auth");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
