// server/src/modules/payments/payment.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const paymentService = require("./payment.service");

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json(apiResponse(false, "bookingId is required."));
  const session = await paymentService.createCheckoutSession(bookingId, req.user.id);
  res.json(apiResponse(true, "Khalti payment session created.", session));
});

const getKhaltiSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await paymentService.getKhaltiSession(sessionId, req.user.id);
  res.json(apiResponse(true, "Khalti session fetched.", session));
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

const khaltiVerify = asyncHandler(async (req, res) => {
  const { pidx, transactionId } = req.query;
  if (!pidx) return res.status(400).json(apiResponse(false, "Missing Khalti payment ID."));

  try {
    // Verify with Khalti API
    const response = await fetch(process.env.KHALTI_VERIFY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    const data = await response.json();
    
    if (data.state === "Completed") {
      const payment = await paymentService.completeKhaltiPayment(pidx);
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/booking/${payment.bookingId}/success?pidx=${encodeURIComponent(pidx)}`);
    } else {
      const payment = await paymentService.failKhaltiPayment(pidx);
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/booking/${payment.bookingId}?payment_failed=true`);
    }
  } catch (error) {
    const payment = await paymentService.failKhaltiPayment(pidx).catch(() => null);
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/booking/${payment?.bookingId}?payment_failed=true`);
  }
});

module.exports = { createCheckoutSession, getKhaltiSession, getPaymentHistory, refundPayment, verifyPayment, khaltiVerify };
