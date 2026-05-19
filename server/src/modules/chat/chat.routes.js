// server/src/modules/chat/chat.routes.js
const express = require("express");
const router = express.Router();
const chatController = require("./chat.controller");
const { authenticate } = require("../../middleware/auth.middleware");

router.use(authenticate);
router.post("/message", chatController.sendMessage);
router.get("/sessions", chatController.getSessions);
router.get("/sessions/:sessionId/messages", chatController.getSessionMessages);
router.delete("/sessions/:sessionId", chatController.deleteSession);

module.exports = router;
