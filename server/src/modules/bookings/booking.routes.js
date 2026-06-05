// server/src/modules/bookings/booking.routes.js
const express = require("express");
const router = express.Router();
const bookingController = require("./booking.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/", bookingController.getBookings);
router.get("/:id", bookingController.getBookingById);
router.post("/", bookingController.createBooking);
router.put("/:id/status", authorize("ADMIN"), bookingController.updateBookingStatus);
router.delete("/:id", bookingController.cancelBooking);

module.exports = router;
