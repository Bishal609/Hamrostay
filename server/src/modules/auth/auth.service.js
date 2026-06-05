// server/src/modules/auth/auth.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../../config/db");
const { generateTokenPair } = require("../../utils/generateToken");
const { sendEmail, emailTemplates } = require("../../utils/email");

// ─── Password Strength Validation ──────────────────────────
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    throw Object.assign(new Error("Password must be at least 8 characters long."), { status: 400 });
  }
  if (!/[A-Z]/.test(password)) {
    throw Object.assign(new Error("Password must contain at least one uppercase letter."), { status: 400 });
  }
  if (!/[a-z]/.test(password)) {
    throw Object.assign(new Error("Password must contain at least one lowercase letter."), { status: 400 });
  }
  if (!/[0-9]/.test(password)) {
    throw Object.assign(new Error("Password must contain at least one digit."), { status: 400 });
  }
  if (!/[!@#$%^&*]/.test(password)) {
    throw Object.assign(new Error("Password must contain at least one special character (!@#$%^&*)."), { status: 400 });
  }
};

const register = async ({ name, email, password, phone, role }) => {
  // ─── Input Validation ──────────────────────────────────────
  if (!name || !email || !password) {
    throw Object.assign(new Error("Name, email, and password are required."), { status: 400 });
  }

  // Validate password strength
  validatePasswordStrength(password);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error("Email already in use."), { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone, role: role || "CUSTOMER" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Send welcome email (non-blocking)
  sendEmail({
    to: email,
    subject: "Welcome to HamroStay!",
    html: emailTemplates.welcomeEmail(user),
  }).catch(console.error);

  const { accessToken, refreshToken } = generateTokenPair(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw Object.assign(new Error("Email and password are required."), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error("Invalid email or password."), { status: 401 });
  if (!user.isActive) throw Object.assign(new Error("Account is deactivated."), { status: 403 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw Object.assign(new Error("Invalid email or password."), { status: 401 });

  const { accessToken, refreshToken } = generateTokenPair(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  const { password: _, refreshToken: __, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

const refreshTokens = async (token) => {
  if (!token) throw Object.assign(new Error("Refresh token required."), { status: 401 });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET);
  } catch {
    throw Object.assign(new Error("Invalid refresh token."), { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: { id: decoded.id, refreshToken: token },
  });
  if (!user) throw Object.assign(new Error("Refresh token revoked."), { status: 401 });

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (userId) => {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
};

const getMe = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, address: true, createdAt: true },
  });
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw Object.assign(new Error("Current and new passwords are required."), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error("User not found."), { status: 404 });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw Object.assign(new Error("Current password is incorrect."), { status: 400 });

  // Validate new password strength
  validatePasswordStrength(newPassword);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { message: "Password changed successfully." };
};

module.exports = { register, login, refreshTokens, logout, getMe, changePassword };
