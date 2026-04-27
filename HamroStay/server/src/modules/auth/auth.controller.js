// server/src/modules/auth/auth.controller.js
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const authService = require("./auth.service");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json(apiResponse(false, "Name, email and password are required."));

  const { user, accessToken, refreshToken } = await authService.register({ name, email, password, phone });
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.status(201).json(apiResponse(true, "Account created successfully.", { user, accessToken }));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json(apiResponse(false, "Email and password are required."));

  const { user, accessToken, refreshToken } = await authService.login({ email, password });
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.json(apiResponse(true, "Login successful.", { user, accessToken }));
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshTokens(token);
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.json(apiResponse(true, "Token refreshed.", { accessToken }));
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  res.json(apiResponse(true, "Logged out successfully."));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json(apiResponse(true, "Profile fetched.", user));
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  res.json(apiResponse(true, "Password changed successfully."));
});

module.exports = { register, login, refresh, logout, getMe, changePassword };
