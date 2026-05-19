// server/src/modules/chat/chat.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const chatService = require("./chat.service");

const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message?.trim()) return res.status(400).json(apiResponse(false, "Message is required."));
  const result = await chatService.sendMessage(req.user.id, { message, sessionId });
  res.json(apiResponse(true, "Message sent.", result));
});

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await chatService.getSessions(req.user.id);
  res.json(apiResponse(true, "Sessions fetched.", sessions));
});

const getSessionMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getSessionMessages(req.params.sessionId, req.user.id);
  res.json(apiResponse(true, "Messages fetched.", messages));
});

const deleteSession = asyncHandler(async (req, res) => {
  await chatService.deleteSession(req.params.sessionId, req.user.id);
  res.json(apiResponse(true, "Session deleted."));
});

module.exports = { sendMessage, getSessions, getSessionMessages, deleteSession };
