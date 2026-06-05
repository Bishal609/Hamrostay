// server/src/modules/rooms/room.service.js
const { prisma } = require("../../config/db");
const { bustCache } = require("../../middleware/cache.middleware");

const getRooms = async (query) => {
  const {
    page = 1, limit = 12, type, status, minPrice, maxPrice,
    capacity, search, sortBy = "createdAt", sortOrder = "desc", featured,
  } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(type && { type }),
    // status="" (empty string) means return all statuses; undefined defaults to AVAILABLE
    ...(status !== undefined
      ? (status ? { status } : {})
      : { status: "AVAILABLE" }),
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
  // ─── Input Validation ──────────────────────────────────────
  const required = ['roomNumber', 'name', 'type', 'floor', 'capacity', 'pricePerNight', 'description', 'bedType'];
  for (const field of required) {
    if (!data[field]) throw Object.assign(new Error(`${field} is required.`), { status: 400 });
  }

  // Validate numeric fields
  const capacity = parseInt(data.capacity);
  const floor = parseInt(data.floor);
  const price = parseFloat(data.pricePerNight);
  const discount = parseFloat(data.discount || 0);

  if (isNaN(capacity) || capacity < 1) throw Object.assign(new Error("Capacity must be at least 1."), { status: 400 });
  if (isNaN(floor) || floor < 0) throw Object.assign(new Error("Floor must be non-negative."), { status: 400 });
  if (isNaN(price) || price <= 0) throw Object.assign(new Error("Price must be greater than 0."), { status: 400 });
  if (isNaN(discount) || discount < 0 || discount > 100) 
    throw Object.assign(new Error("Discount must be between 0 and 100."), { status: 400 });

  // Check room number uniqueness
  const existing = await prisma.room.findUnique({ where: { roomNumber: data.roomNumber } });
  if (existing) throw Object.assign(new Error("Room number already exists."), { status: 409 });

  const room = await prisma.room.create({
    data: {
      ...data,
      capacity,
      floor,
      pricePerNight: price,
      discount,
      status: data.status || "AVAILABLE",
    },
  });
  bustCache("rooms");
  return room;
};

const updateRoom = async (id, data) => {
  // ─── Input Validation ──────────────────────────────────────
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw Object.assign(new Error("Room not found."), { status: 404 });

  // Validate numeric fields if provided
  if (data.capacity !== undefined) {
    const capacity = parseInt(data.capacity);
    if (isNaN(capacity) || capacity < 1) throw Object.assign(new Error("Capacity must be at least 1."), { status: 400 });
    data.capacity = capacity;
  }

  if (data.floor !== undefined) {
    const floor = parseInt(data.floor);
    if (isNaN(floor) || floor < 0) throw Object.assign(new Error("Floor must be non-negative."), { status: 400 });
    data.floor = floor;
  }

  if (data.pricePerNight !== undefined) {
    const price = parseFloat(data.pricePerNight);
    if (isNaN(price) || price <= 0) throw Object.assign(new Error("Price must be greater than 0."), { status: 400 });
    data.pricePerNight = price;
  }

  if (data.discount !== undefined) {
    const discount = parseFloat(data.discount);
    if (isNaN(discount) || discount < 0 || discount > 100) 
      throw Object.assign(new Error("Discount must be between 0 and 100."), { status: 400 });
    data.discount = discount;
  }

  const updated = await prisma.room.update({ where: { id }, data });
  bustCache("rooms");
  return updated;
};

const deleteRoom = async (id) => {
  // Check for active bookings
  const activeBooking = await prisma.booking.findFirst({
    where: { roomId: id, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
  });
  if (activeBooking) throw Object.assign(new Error("Cannot delete room with active bookings."), { status: 400 });

  await prisma.room.delete({ where: { id } });
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
