// server/src/modules/payments/payment.service.js
const { prisma } = require("../../config/db");
const { emitToUser, emitToAdmins } = require("../../config/socket");

const createCheckoutSession = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { room: true, user: { select: { email: true, name: true } } },
  });

  if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });
  if (booking.userId !== userId) throw Object.assign(new Error("Access denied."), { status: 403 });
  if (booking.status !== "PENDING") throw Object.assign(new Error("Booking is not pending."), { status: 400 });

  const existingPayment = await prisma.payment.findUnique({ where: { bookingId } });
  if (existingPayment && existingPayment.status === "COMPLETED")
    throw Object.assign(new Error("Booking already paid."), { status: 400 });

  const sessionId = `KHALTI-${booking.id}-${Date.now()}`;

  await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      stripeSessionId: sessionId,
      amount: booking.finalAmount,
      currency: "npr",
      status: "PENDING",
    },
    update: { stripeSessionId: sessionId, status: "PENDING", amount: booking.finalAmount },
  });

  return {
    sessionId,
    url: `${process.env.CLIENT_URL}/khalti/${encodeURIComponent(sessionId)}`,
  };
};

const getKhaltiSession = async (sessionId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
    include: { booking: { select: { id: true, bookingRef: true, userId: true } } },
  });

  if (!payment) throw Object.assign(new Error("Payment session not found."), { status: 404 });
  if (payment.booking.userId !== userId) throw Object.assign(new Error("Access denied."), { status: 403 });

  return {
    sessionId,
    bookingId: payment.bookingId,
    bookingRef: payment.booking.bookingRef,
    amount: payment.amount,
    currency: payment.currency || "npr",
    publicKey: process.env.NEXT_PUBLIC_KHALTI_PUBLIC_KEY,
    successUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/booking/${payment.bookingId}/success`,
    failureUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/booking/${payment.bookingId}?payment_failed=true`,
    return_url: `${process.env.SERVER_URL || "http://localhost:5000"}/api/payments/khalti/verify`,
  };
};

const getPaymentHistory = async (userId, role) => {
  const where = role !== "ADMIN" ? { booking: { userId } } : {};
  return prisma.payment.findMany({
    where,
    include: {
      booking: {
        include: {
          room: { select: { name: true, roomNumber: true } },
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

const refundPayment = async (bookingId, reason) => {
  const payment = await prisma.payment.findUnique({ where: { bookingId } });
  if (!payment || payment.status !== "COMPLETED")
    throw Object.assign(new Error("No completed payment found."), { status: 400 });

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { status: "REFUNDED", refundedAt: new Date(), refundReason: reason },
    }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: "REFUNDED" } }),
  ]);

  return { message: "Refund processed in system.", bookingId };
};

const verifyPayment = async (sessionId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
    include: { booking: { select: { userId: true } } },
  });

  if (!payment) throw Object.assign(new Error("Payment not found."), { status: 404 });
  if (payment.booking.userId !== userId) throw Object.assign(new Error("Access denied."), { status: 403 });

  return {
    bookingId: payment.bookingId,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
  };
};

const completeKhaltiPayment = async (sessionId) => {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
    include: { booking: true },
  });

  if (!payment) throw Object.assign(new Error("Payment session not found."), { status: 404 });
  if (payment.status === "COMPLETED") return payment;

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const paymentUpdate = await tx.payment.update({
      where: { stripeSessionId: sessionId },
      data: { status: "COMPLETED", paidAt: new Date() },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });

    return paymentUpdate;
  });

  emitToUser(payment.booking.userId, "payment:completed", { bookingId: payment.bookingId, amount: payment.amount });
  emitToAdmins("payment:completed", { bookingId: payment.bookingId, amount: payment.amount });

  return updatedPayment;
};

const failKhaltiPayment = async (sessionId) => {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
  });

  if (!payment) throw Object.assign(new Error("Payment session not found."), { status: 404 });
  if (payment.status === "COMPLETED") return payment;

  return prisma.payment.update({
    where: { stripeSessionId: sessionId },
    data: { status: "FAILED" },
  });
};

module.exports = { createCheckoutSession, getKhaltiSession, getPaymentHistory, refundPayment, verifyPayment, completeKhaltiPayment, failKhaltiPayment };
