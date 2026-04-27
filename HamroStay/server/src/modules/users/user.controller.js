// server/src/modules/users/user.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const userService = require("./user.service");

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  res.json(apiResponse(true, "Users fetched.", result));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(apiResponse(true, "User fetched.", user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.json(apiResponse(true, "Profile updated.", user));
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id);
  res.json(apiResponse(true, `User ${user.isActive ? "activated" : "deactivated"}.`, user));
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await userService.getNotifications(req.user.id);
  res.json(apiResponse(true, "Notifications fetched.", notifications));
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  await userService.markNotificationsRead(req.user.id);
  res.json(apiResponse(true, "Notifications marked as read."));
});

module.exports = { getAllUsers, getUserById, updateProfile, toggleUserStatus, getNotifications, markNotificationsRead };
