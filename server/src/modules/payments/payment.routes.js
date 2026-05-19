// server/src/modules/payments/payment.routes.js
const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

// Stripe webhook — raw body, no auth
router.post("/webhook", paymentController.webhook);

router.use(authenticate);

// Payment endpoints
router.post("/checkout", paymentController.createCheckoutSession);
router.post("/create-session", paymentController.createCheckoutSession); // Alias for backward compatibility
router.get("/history", paymentController.getPaymentHistory);
router.post("/refund", authorize("ADMIN"), paymentController.refundPayment);
router.get("/verify/:sessionId", paymentController.verifyPayment);

module.exports = router;
