// server/src/modules/payments/payment.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const paymentService = require("./payment.service");

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json(apiResponse(false, "bookingId is required."));
  const session = await paymentService.createCheckoutSession(bookingId, req.user.id);
  res.json(apiResponse(true, "Checkout session created.", session));
});

const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const result = await paymentService.handleWebhook(req.body, signature);
  res.json(result);
});

const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPaymentHistory(req.user.id, req.user.role);
  res.json(apiResponse(true, "Payment history fetched.", payments));
});

const refundPayment = asyncHandler(async (req, res) => {
  const { bookingId, reason } = req.body;
  const refund = await paymentService.refundPayment(bookingId, reason);
  res.json(apiResponse(true, "Refund initiated.", refund));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const verification = await paymentService.verifyPayment(sessionId, req.user.id);
  res.json(apiResponse(true, "Payment verified.", verification));
});

module.exports = { createCheckoutSession, webhook, getPaymentHistory, refundPayment, verifyPayment };
