// server/src/modules/vendors/vendor.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const vendorService = require("./vendor.service");

const getVendors = asyncHandler(async (req, res) => {
  const result = await vendorService.getVendors(req.query);
  res.json(apiResponse(true, "Vendors fetched.", result));
});

const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorById(req.params.id);
  res.json(apiResponse(true, "Vendor fetched.", vendor));
});

const getMyVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorByUserId(req.user.id);
  res.json(apiResponse(true, "Vendor profile fetched.", vendor));
});

const createVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.createVendor({ ...req.body, userId: req.user.id });
  res.status(201).json(apiResponse(true, "Vendor registered. Awaiting approval.", vendor));
});

const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.updateVendor(req.params.id, req.body);
  res.json(apiResponse(true, "Vendor updated.", vendor));
});

const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.approveVendor(req.params.id);
  res.json(apiResponse(true, "Vendor approved.", vendor));
});

// Inventory
const getInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // VENDOR can only access their own inventory
  if (req.user.role === "VENDOR") {
    const myVendor = await vendorService.getVendorByUserId(req.user.id);
    if (myVendor.id !== id) {
      return res.status(403).json(apiResponse(false, "Access denied. You can only access your own inventory."));
    }
  }
  const items = await vendorService.getInventory(id);
  res.json(apiResponse(true, "Inventory fetched.", items));
});

const addInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // VENDOR can only add to their own inventory
  if (req.user.role === "VENDOR") {
    const myVendor = await vendorService.getVendorByUserId(req.user.id);
    if (myVendor.id !== id) {
      return res.status(403).json(apiResponse(false, "Access denied. You can only add to your own inventory."));
    }
  }
  const item = await vendorService.addInventoryItem(id, req.body);
  res.status(201).json(apiResponse(true, "Item added.", item));
});

const updateInventoryItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  // VENDOR can only update their own inventory
  if (req.user.role === "VENDOR") {
    const myVendor = await vendorService.getVendorByUserId(req.user.id);
    if (myVendor.id !== id) {
      return res.status(403).json(apiResponse(false, "Access denied. You can only update your own inventory."));
    }
  }
  const item = await vendorService.updateInventoryItem(itemId, req.body);
  res.json(apiResponse(true, "Item updated.", item));
});

// Orders
const createOrder = asyncHandler(async (req, res) => {
  const order = await vendorService.createOrder(req.params.id, req.body, req.user.name);
  res.status(201).json(apiResponse(true, "Order created.", order));
});

const getOrders = asyncHandler(async (req, res) => {
  const vendorId = req.user.role === "VENDOR" ? (await vendorService.getVendorByUserId(req.user.id)).id : req.params.id;
  const result = await vendorService.getOrders(vendorId, req.user.role, req.query);
  res.json(apiResponse(true, "Orders fetched.", result));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await vendorService.updateOrderStatus(req.params.orderId, req.body.status);
  res.json(apiResponse(true, "Order status updated.", order));
});

module.exports = {
  getVendors, getVendorById, getMyVendorProfile, createVendor, updateVendor, approveVendor,
  getInventory, addInventoryItem, updateInventoryItem,
  createOrder, getOrders, updateOrderStatus,
};
