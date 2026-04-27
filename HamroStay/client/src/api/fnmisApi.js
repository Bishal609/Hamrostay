import axiosInstance from "./axiosInstance";
export const fnmisApi = {
  getKPIs:              ()       => axiosInstance.get("/fnmis/kpis"),
  getRevenue:           (period) => axiosInstance.get("/fnmis/revenue", { params: { period } }),
  getRevenueByRoomType: ()       => axiosInstance.get("/fnmis/revenue/by-room-type"),
  getOccupancy:         (period) => axiosInstance.get("/fnmis/occupancy", { params: { period } }),
  getExpenses:          (params) => axiosInstance.get("/fnmis/expenses", { params }),
  addExpense:           (data)   => axiosInstance.post("/fnmis/expenses", data),
};