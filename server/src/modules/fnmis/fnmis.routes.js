// server/src/modules/fnmis/fnmis.routes.js
const express = require("express");
const router = express.Router();
const fnmisController = require("./fnmis.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

router.use(authenticate, authorize("ADMIN"));

router.get("/kpis", fnmisController.getDashboardKPIs);
router.get("/revenue", fnmisController.getRevenue);
router.get("/revenue/by-room-type", fnmisController.getRevenueByRoomType);
router.get("/occupancy", fnmisController.getOccupancy);
router.get("/expenses", fnmisController.getExpenses);
router.post("/expenses", fnmisController.addExpense);

module.exports = router;
