// server/src/modules/payments/payment.routes.js
const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

// Stripe webhook — raw body, no auth
router.post("/webhook", paymentController.webhook);

router.use(authenticate);
router.post("/create-session", paymentController.createCheckoutSession);
router.get("/history", paymentController.getPaymentHistory);
router.post("/refund", authorize("ADMIN"), paymentController.refundPayment);

module.exports = router;
