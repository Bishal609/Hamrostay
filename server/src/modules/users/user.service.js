// server/src/modules/users/user.service.js
const bcrypt = require("bcryptjs");
const { prisma } = require("../../config/db");

const getAllUsers = async (query = {}) => {
  const { page = 1, limit = 20, role, search, isActive } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {
    ...(role && { role }),
    ...(isActive !== undefined && { isActive: isActive === "true" }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, avatar: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, avatar: true, address: true, createdAt: true,
      _count: { select: { bookings: true } } },
  });
  if (!user) throw Object.assign(new Error("User not found."), { status: 404 });
  return user;
};

const updateProfile = async (userId, data) => {
  const { name, phone, address, avatar } = data;
  return prisma.user.update({
    where: { id: userId },
    data: { name, phone, address, avatar },
    select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, address: true },
  });
};

const toggleUserStatus = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw Object.assign(new Error("User not found."), { status: 404 });
  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
};

const getNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
};

const markNotificationsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

module.exports = { getAllUsers, getUserById, updateProfile, toggleUserStatus, getNotifications, markNotificationsRead };
