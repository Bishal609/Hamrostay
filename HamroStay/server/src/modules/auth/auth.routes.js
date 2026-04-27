// server/src/modules/auth/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authenticate } = require("../../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);
router.put("/change-password", authenticate, authController.changePassword);

module.exports = router;
