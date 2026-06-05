// server/src/modules/payments/payment.routes.js
const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

// Khalti verification callback (public - before authenticate)
router.get("/khalti/verify", paymentController.khaltiVerify);

router.use(authenticate);

// Payment endpoints
router.post("/checkout", paymentController.createCheckoutSession);
router.post("/create-session", paymentController.createCheckoutSession); // Alias for backward compatibility
router.get("/khalti/:sessionId", paymentController.getKhaltiSession);
router.get("/history", paymentController.getPaymentHistory);
router.post("/refund", authorize("ADMIN"), paymentController.refundPayment);
router.get("/verify/:sessionId", paymentController.verifyPayment);

module.exports = router;
