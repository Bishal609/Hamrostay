// server/src/modules/fnmis/fnmis.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const fnmisService = require("./fnmis.service");

const getDashboardKPIs = asyncHandler(async (req, res) => {
  const kpis = await fnmisService.getDashboardKPIs();
  res.json(apiResponse(true, "KPIs fetched.", kpis));
});

const getRevenue = asyncHandler(async (req, res) => {
  const data = await fnmisService.getRevenue(req.query.period);
  res.json(apiResponse(true, "Revenue fetched.", data));
});

const getOccupancy = asyncHandler(async (req, res) => {
  const data = await fnmisService.getOccupancy(req.query.period);
  res.json(apiResponse(true, "Occupancy fetched.", data));
});

const getExpenses = asyncHandler(async (req, res) => {
  const data = await fnmisService.getExpenses(req.query);
  res.json(apiResponse(true, "Expenses fetched.", data));
});

const addExpense = asyncHandler(async (req, res) => {
  const expense = await fnmisService.addExpense(req.body, req.user.id);
  res.status(201).json(apiResponse(true, "Expense added.", expense));
});

const getRevenueByRoomType = asyncHandler(async (req, res) => {
  const data = await fnmisService.getRevenueByRoomType();
  res.json(apiResponse(true, "Revenue by room type fetched.", data));
});

module.exports = { getDashboardKPIs, getRevenue, getOccupancy, getExpenses, addExpense, getRevenueByRoomType };
