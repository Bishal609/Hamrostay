import axiosInstance from "./axiosInstance";
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