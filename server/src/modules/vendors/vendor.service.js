// server/src/modules/vendors/vendor.service.js
const { prisma } = require("../../config/db");

const getVendors = async (query = {}) => {
  const { page = 1, limit = 10, category, isApproved, search } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {
    ...(category && { category }),
    ...(isApproved !== undefined && { isApproved: isApproved === "true" }),
    ...(search && {
      OR: [
        { businessName: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where, skip, take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    }),
    prisma.vendor.count({ where }),
  ]);
  return { vendors, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } };
};

const getVendorById = async (id) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { inventory: true, orders: { take: 10, orderBy: { createdAt: "desc" } } },
  });
  if (!vendor) throw Object.assign(new Error("Vendor not found."), { status: 404 });
  return vendor;
};

const getVendorByUserId = async (userId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: { inventory: true },
  });
  if (!vendor) throw Object.assign(new Error("Vendor profile not found."), { status: 404 });
  return vendor;
};

const createVendor = async (data) => {
  return prisma.vendor.create({ data });
};

const updateVendor = async (id, data) => {
  return prisma.vendor.update({ where: { id }, data });
};

const approveVendor = async (id) => {
  return prisma.vendor.update({ where: { id }, data: { isApproved: true } });
};

// Inventory
const addInventoryItem = async (vendorId, data) => {
  return prisma.vendorInventory.create({ data: { ...data, vendorId } });
};

const getInventoryItemById = async (id) => {
  const item = await prisma.vendorInventory.findUnique({ where: { id } });
  if (!item) throw Object.assign(new Error("Inventory item not found."), { status: 404 });
  return item;
};

const updateInventoryItem = async (id, data) => {
  return prisma.vendorInventory.update({ where: { id }, data });
};

const updateInventoryItemForVendor = async (vendorId, itemId, data) => {
  const item = await getInventoryItemById(itemId);
  if (item.vendorId !== vendorId) throw Object.assign(new Error("Access denied."), { status: 403 });
  return prisma.vendorInventory.update({ where: { id: itemId }, data });
};

const getInventory = async (vendorId) => {
  return prisma.vendorInventory.findMany({ where: { vendorId }, orderBy: { itemName: "asc" } });
};

// Orders
const createOrder = async (vendorId, data, requestedBy) => {
  const { items, notes } = data;
  let totalAmount = 0;

  // Validate items and calculate total
  const orderItems = await Promise.all(
    items.map(async (item) => {
      const inv = await prisma.vendorInventory.findUnique({ where: { id: item.inventoryId } });
      if (!inv) throw Object.assign(new Error(`Inventory item ${item.inventoryId} not found.`), { status: 404 });
      const subtotal = inv.unitPrice * item.quantity;
      totalAmount += subtotal;
      return { inventoryId: item.inventoryId, quantity: item.quantity, unitPrice: inv.unitPrice, subtotal };
    })
  );

  const order = await prisma.vendorOrder.create({
    data: {
      vendorId, notes, totalAmount, requestedBy,
      items: { create: orderItems },
    },
    include: { items: { include: { inventory: true } }, vendor: { select: { businessName: true } } },
  });

  await prisma.vendor.update({ where: { id: vendorId }, data: { totalOrders: { increment: 1 } } });
  return order;
};

const getOrders = async (vendorId, role, query = {}) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = { ...(vendorId && { vendorId }), ...(status && { status }) };
  const [orders, total] = await Promise.all([
    prisma.vendorOrder.findMany({
      where, skip, take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: { items: { include: { inventory: { select: { itemName: true, unit: true } } } }, vendor: { select: { businessName: true } } },
    }),
    prisma.vendorOrder.count({ where }),
  ]);
  return { orders, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } };
};

const updateOrderStatus = async (orderId, status) => {
  return prisma.vendorOrder.update({
    where: { id: orderId },
    data: { status, ...(status === "DELIVERED" && { deliveredAt: new Date() }) },
  });
};

module.exports = {
  getVendors, getVendorById, getVendorByUserId, createVendor, updateVendor, approveVendor,
  addInventoryItem, updateInventoryItem, getInventory,
  createOrder, getOrders, updateOrderStatus,
};
