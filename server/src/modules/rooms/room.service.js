// server/src/modules/rooms/room.service.js
const { prisma } = require("../../config/db");
const { bustCache } = require("../../middleware/cache.middleware");

const getRooms = async (query) => {
  const {
    page = 1, limit = 12, type, status, minPrice, maxPrice,
    capacity, search, sortBy = "createdAt", sortOrder = "desc", featured, showAll,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const isShowAll = showAll === "true" || showAll === true;

  const where = {
    ...(type && { type }),
    ...(!isShowAll && (status ? { status } : { status: "AVAILABLE" })),
    ...(capacity && { capacity: { gte: parseInt(capacity) } }),
    ...(featured === "true" && { isFeatured: true }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { roomNumber: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...((minPrice || maxPrice) && {
      pricePerNight: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      },
    }),
  };

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        reviews: { select: { rating: true }, take: 100 },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.room.count({ where }),
  ]);

  // Compute average rating
  const roomsWithRating = rooms.map((room) => {
    const avg = room.reviews.length
      ? room.reviews.reduce((s, r) => s + r.rating, 0) / room.reviews.length
      : 0;
    return { ...room, averageRating: parseFloat(avg.toFixed(1)), reviewCount: room.reviews.length };
  });

  return {
    rooms: roomsWithRating,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getRoomById = async (id) => {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { bookings: true } },
    },
  });
  if (!room) throw Object.assign(new Error("Room not found."), { status: 404 });
  return room;
};

const createRoom = async (data) => {
  const room = await prisma.room.create({ data });
  bustCache("rooms");
  return room;
};

const updateRoom = async (id, data) => {
  const room = await prisma.room.update({ where: { id }, data });
  bustCache("rooms");
  return room;
};

const deleteRoom = async (id) => {
  const roomId = String(id);

  // Prevent deleting rooms with active bookings
  const activeBooking = await prisma.booking.findFirst({
    where: { roomId, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
  });
  if (activeBooking) throw Object.assign(new Error("Cannot delete room with active bookings."), { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { roomId } });
    await tx.booking.deleteMany({ where: { roomId } });
    await tx.room.delete({ where: { id: roomId } });
  });

  bustCache("rooms");
};

const checkAvailability = async (roomId, checkIn, checkOut) => {
  const conflict = await prisma.booking.findFirst({
    where: {
      roomId,
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
      OR: [
        { checkIn: { lte: new Date(checkOut) }, checkOut: { gte: new Date(checkIn) } },
      ],
    },
  });
  return !conflict;
};

const getAvailableRooms = async (checkIn, checkOut, capacity) => {
  const bookedRoomIds = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
      OR: [{ checkIn: { lte: new Date(checkOut) }, checkOut: { gte: new Date(checkIn) } }],
    },
    select: { roomId: true },
  });

  const excludedIds = bookedRoomIds.map((b) => b.roomId);

  return prisma.room.findMany({
    where: {
      id: { notIn: excludedIds },
      status: "AVAILABLE",
      ...(capacity && { capacity: { gte: parseInt(capacity) } }),
    },
    orderBy: { pricePerNight: "asc" },
  });
};

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, checkAvailability, getAvailableRooms };
