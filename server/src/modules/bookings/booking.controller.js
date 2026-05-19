// server/src/modules/bookings/booking.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const bookingService = require("./booking.service");

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  res.status(201).json(apiResponse(true, "Booking created.", booking));
});

const getBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookings(req.user.id, req.user.role, req.query);
  res.json(apiResponse(true, "Bookings fetched.", result));
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
  res.json(apiResponse(true, "Booking fetched.", booking));
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json(apiResponse(false, "Status is required."));
  const booking = await bookingService.updateBookingStatus(req.params.id, status, req.user.id);
  res.json(apiResponse(true, "Booking status updated.", booking));
});

const cancelBooking = asyncHandler(async (req, res) => {
  await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role);
  res.json(apiResponse(true, "Booking cancelled."));
});

module.exports = { createBooking, getBookings, getBookingById, updateBookingStatus, cancelBooking };
