// server/src/modules/bookings/booking.service.js
const { prisma } = require("../../config/db");
const { checkAvailability } = require("../rooms/room.service");
const { sendEmail, emailTemplates } = require("../../utils/email");
const { emitToUser, emitToAdmins } = require("../../config/socket");

const TAX_RATE = parseFloat(process.env.TAX_RATE || "0.13");

const calculateBookingCost = (room, checkIn, checkOut, guests) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / msPerDay);
  if (nights < 1) throw Object.assign(new Error("Check-out must be after check-in."), { status: 400 });

  const baseAmount = room.pricePerNight * nights;
  const discountAmount = room.discount > 0 ? (baseAmount * room.discount) / 100 : 0;
  const afterDiscount = baseAmount - discountAmount;
  const taxAmount = afterDiscount * TAX_RATE;
  const finalAmount = afterDiscount + taxAmount;

  return { nights, totalAmount: baseAmount, discountAmount, taxAmount, finalAmount };
};

const createBooking = async (userId, data) => {
  const { roomId, checkIn, checkOut, guests, specialRequests, guestDetails } = data;

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw Object.assign(new Error("Room not found."), { status: 404 });
  if (room.status !== "AVAILABLE") throw Object.assign(new Error("Room is not available."), { status: 400 });

  const isAvailable = await checkAvailability(roomId, checkIn, checkOut);
  if (!isAvailable) throw Object.assign(new Error("Room is not available for selected dates."), { status: 409 });

  const cost = calculateBookingCost(room, checkIn, checkOut, guests);

  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights: cost.nights,
      guests: parseInt(guests),
      totalAmount: cost.totalAmount,
      discountAmount: cost.discountAmount,
      taxAmount: cost.taxAmount,
      finalAmount: cost.finalAmount,
      specialRequests,
      guestDetails: guestDetails || {},
    },
    include: { room: true, user: { select: { name: true, email: true } } },
  });

  // Notify admin via socket
  emitToAdmins("booking:new", { bookingId: booking.id, bookingRef: booking.bookingRef });

  return booking;
};

const getBookings = async (userId, role, query) => {
  const { page = 1, limit = 10, status, search } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(role !== "ADMIN" && { userId }), // Customers see only their bookings
    ...(status && { status }),
    ...(search && {
      OR: [
        { bookingRef: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        room: { select: { name: true, roomNumber: true, images: true, type: true } },
        user: { select: { name: true, email: true, phone: true } },
        payment: { select: { status: true, amount: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } };
};

const getBookingById = async (id, userId, role) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      room: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      payment: true,
    },
  });
  if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });
  if (role !== "ADMIN" && booking.userId !== userId)
    throw Object.assign(new Error("Access denied."), { status: 403 });
  return booking;
};

const updateBookingStatus = async (id, status, adminId) => {
  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { user: { select: { email: true, name: true } }, room: { select: { name: true } } },
  });

  // Notify guest via socket
  emitToUser(booking.userId, "booking:updated", { bookingId: id, status });

  // Send email for key status changes
  if (status === "CONFIRMED") {
    sendEmail({
      to: booking.user.email,
      subject: "Booking Confirmed — HamroStay",
      html: emailTemplates.bookingConfirmation({
        guestName: booking.user.name,
        bookingRef: booking.bookingRef,
        roomName: booking.room.name,
        checkIn: booking.checkIn.toDateString(),
        checkOut: booking.checkOut.toDateString(),
        guests: booking.guests,
        finalAmount: booking.finalAmount,
      }),
    }).catch(console.error);
  }

  if (status === "CANCELLED") {
    sendEmail({
      to: booking.user.email,
      subject: "Booking Cancelled — HamroStay",
      html: emailTemplates.bookingCancellation({ guestName: booking.user.name, bookingRef: booking.bookingRef }),
    }).catch(console.error);
  }

  return booking;
};

const cancelBooking = async (id, userId, role) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });
  if (role !== "ADMIN" && booking.userId !== userId)
    throw Object.assign(new Error("Access denied."), { status: 403 });
  if (["CHECKED_IN", "CHECKED_OUT"].includes(booking.status))
    throw Object.assign(new Error("Cannot cancel an active/completed booking."), { status: 400 });

  return prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
};

module.exports = { createBooking, getBookings, getBookingById, updateBookingStatus, cancelBooking };
