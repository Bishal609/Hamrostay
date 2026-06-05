// server/src/modules/vendors/vendor.routes.js
const express = require("express");
const router = express.Router();
const v = require("./vendor.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/", authorize("ADMIN"), v.getVendors);
router.get("/me", authorize("VENDOR"), v.getMyVendorProfile);
router.get("/me/orders", authorize("VENDOR"), v.getOrders);
router.post("/register", authorize("VENDOR", "ADMIN"), v.createVendor);

router.get("/:id", authorize("ADMIN", "VENDOR"), v.getVendorById);
router.put("/:id", authorize("ADMIN", "VENDOR"), v.updateVendor);
router.patch("/:id/approve", authorize("ADMIN"), v.approveVendor);

// Inventory
router.get("/:id/inventory", authorize("ADMIN", "VENDOR"), v.getInventory);
router.post("/:id/inventory", authorize("ADMIN", "VENDOR"), v.addInventoryItem);
router.put("/:id/inventory/:itemId", authorize("ADMIN", "VENDOR"), v.updateInventoryItem);

// Orders
router.get("/:id/orders", authorize("ADMIN"), v.getOrders);
router.post("/:id/orders", authorize("ADMIN"), v.createOrder);
router.patch("/:id/orders/:orderId/status", authorize("ADMIN", "VENDOR"), v.updateOrderStatus);

module.exports = router;
