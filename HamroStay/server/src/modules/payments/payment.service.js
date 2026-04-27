// server/src/modules/payments/payment.service.js
const stripe = require("../../config/stripe");
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

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: booking.user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${booking.room.name} — HamroStay`,
            description: `${booking.nights} night(s) | Check-in: ${booking.checkIn.toDateString()} | Ref: ${booking.bookingRef}`,
            images: booking.room.images?.length ? [booking.room.images[0]] : [],
          },
          unit_amount: Math.round(booking.finalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id, bookingRef: booking.bookingRef, userId },
    success_url: `${process.env.CLIENT_URL}/booking/${booking.id}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/booking/${booking.id}/cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
  });

  // Upsert payment record
  await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      stripeSessionId: session.id,
      amount: booking.finalAmount,
      currency: "usd",
      status: "PENDING",
    },
    update: { stripeSessionId: session.id, status: "PENDING" },
  });

  return { sessionId: session.id, url: session.url };
};

const handleWebhook = async (rawBody, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw Object.assign(new Error(`Webhook signature verification failed: ${err.message}`), { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { bookingId, userId } = session.metadata;

      await prisma.$transaction([
        prisma.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.payment_intent,
            paidAt: new Date(),
            receiptUrl: session.receipt_url,
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        }),
      ]);

      // Notify user and admins
      emitToUser(userId, "payment:success", { bookingId });
      emitToAdmins("payment:received", { bookingId });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      await prisma.payment.update({
        where: { stripeSessionId: session.id },
        data: { status: "FAILED" },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      await prisma.payment.updateMany({
        where: { stripePaymentId: charge.payment_intent },
        data: { status: "REFUNDED", refundedAt: new Date() },
      });
      break;
    }
  }

  return { received: true };
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

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentId,
    reason: "requested_by_customer",
  });

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { status: "REFUNDED", refundedAt: new Date(), refundReason: reason },
    }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: "REFUNDED" } }),
  ]);

  return refund;
};

module.exports = { createCheckoutSession, handleWebhook, getPaymentHistory, refundPayment };
