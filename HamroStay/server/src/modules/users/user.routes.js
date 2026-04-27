// server/src/modules/users/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

router.use(authenticate);

router.get("/notifications", userController.getNotifications);
router.put("/notifications/read", userController.markNotificationsRead);
router.put("/profile", userController.updateProfile);

// Admin only
router.get("/", authorize("ADMIN"), userController.getAllUsers);
router.get("/:id", authorize("ADMIN"), userController.getUserById);
router.patch("/:id/toggle-status", authorize("ADMIN"), userController.toggleUserStatus);

module.exports = router;
