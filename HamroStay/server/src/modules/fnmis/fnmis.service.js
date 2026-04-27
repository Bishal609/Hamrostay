// server/src/modules/fnmis/fnmis.service.js
const { prisma } = require("../../config/db");

// Revenue analytics
const getRevenue = async (period = "month") => {
  const now = new Date();
  let startDate;

  switch (period) {
    case "week":   startDate = new Date(now - 7 * 86400000); break;
    case "month":  startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
    case "quarter":startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); break;
    case "year":   startDate = new Date(now.getFullYear(), 0, 1); break;
    default:       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [payments, bookings, totalRooms] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "COMPLETED", paidAt: { gte: startDate } },
      include: { booking: { select: { checkIn: true, checkOut: true, nights: true, roomId: true } } },
      orderBy: { paidAt: "asc" },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    }),
    prisma.room.count(),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  // Group revenue by date
  const revenueByDate = {};
  payments.forEach((p) => {
    const date = p.paidAt.toISOString().split("T")[0];
    revenueByDate[date] = (revenueByDate[date] || 0) + p.amount;
  });

  const chartData = Object.entries(revenueByDate).map(([date, amount]) => ({ date, amount }));

  const bookingStats = {};
  bookings.forEach((b) => { bookingStats[b.status] = b._count.id; });

  return { totalRevenue, chartData, bookingStats, totalRooms, period, startDate };
};

// Occupancy analytics
const getOccupancy = async (period = "month") => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalRooms = await prisma.room.count();

  const checkedIn = await prisma.booking.count({
    where: { status: "CHECKED_IN" },
  });

  // Daily occupancy for chart
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const dateStr = date.toISOString().split("T")[0];
    const occupied = await prisma.booking.count({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { lte: date },
        checkOut: { gte: date },
      },
    });
    days.push({ date: dateStr, occupied, total: totalRooms, rate: totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(1) : 0 });
  }

  return {
    currentOccupancy: checkedIn,
    totalRooms,
    occupancyRate: totalRooms > 0 ? ((checkedIn / totalRooms) * 100).toFixed(1) : 0,
    dailyData: days,
  };
};

// KPI Dashboard summary
const getDashboardKPIs = async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalRevenue, lastMonthRevenue, totalBookings, pendingBookings,
    totalUsers, totalRooms, checkedIn, totalVendors, monthExpenses,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "COMPLETED", paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "COMPLETED", paidAt: { gte: lastMonthStart, lt: monthStart } }, _sum: { amount: true } }),
    prisma.booking.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.room.count(),
    prisma.booking.count({ where: { status: "CHECKED_IN" } }),
    prisma.vendor.count({ where: { isApproved: true } }),
    prisma.expense.aggregate({ where: { date: { gte: monthStart } }, _sum: { amount: true } }),
  ]);

  const revenue = totalRevenue._sum.amount || 0;
  const lastRevenue = lastMonthRevenue._sum.amount || 0;
  const revenueGrowth = lastRevenue > 0 ? (((revenue - lastRevenue) / lastRevenue) * 100).toFixed(1) : 0;

  return {
    revenue: { current: revenue, lastMonth: lastRevenue, growth: revenueGrowth },
    bookings: { thisMonth: totalBookings, pending: pendingBookings },
    occupancy: { checkedIn, total: totalRooms, rate: totalRooms > 0 ? ((checkedIn / totalRooms) * 100).toFixed(1) : 0 },
    customers: totalUsers,
    vendors: totalVendors,
    expenses: monthExpenses._sum.amount || 0,
    netProfit: revenue - (monthExpenses._sum.amount || 0),
  };
};

// Expenses
const getExpenses = async (query = {}) => {
  const { page = 1, limit = 20, category, startDate, endDate } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {
    ...(category && { category }),
    ...((startDate || endDate) && {
      date: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    }),
  };

  const [expenses, total, aggregate] = await Promise.all([
    prisma.expense.findMany({ where, skip, take: parseInt(limit), orderBy: { date: "desc" } }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ]);

  return {
    expenses, total: aggregate._sum.amount || 0,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
  };
};

const addExpense = async (data, adminId) => {
  return prisma.expense.create({ data: { ...data, addedBy: adminId, date: new Date(data.date) } });
};

// Room type revenue breakdown
const getRevenueByRoomType = async () => {
  const payments = await prisma.payment.findMany({
    where: { status: "COMPLETED" },
    include: { booking: { include: { room: { select: { type: true } } } } },
  });

  const byType = {};
  payments.forEach((p) => {
    const type = p.booking?.room?.type || "UNKNOWN";
    byType[type] = (byType[type] || 0) + p.amount;
  });

  return Object.entries(byType).map(([type, revenue]) => ({ type, revenue: parseFloat(revenue.toFixed(2)) }));
};

module.exports = { getRevenue, getOccupancy, getDashboardKPIs, getExpenses, addExpense, getRevenueByRoomType };
