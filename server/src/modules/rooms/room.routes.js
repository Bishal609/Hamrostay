// server/src/modules/rooms/room.routes.js
const express = require("express");
const router = express.Router();
const roomController = require("./room.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");
const { cacheMiddleware } = require("../../middleware/cache.middleware");

// Public routes
router.get("/", cacheMiddleware(300, "rooms"), roomController.getRooms);
router.get("/available", roomController.getAvailableRooms);
router.get("/:id", cacheMiddleware(300, "rooms"), roomController.getRoomById);
router.get("/:id/availability", roomController.checkAvailability);

// Admin only
router.post("/", authenticate, authorize("ADMIN"), roomController.createRoom);
router.put("/:id", authenticate, authorize("ADMIN"), roomController.updateRoom);
router.delete("/:id", authenticate, authorize("ADMIN"), roomController.deleteRoom);

module.exports = router;
