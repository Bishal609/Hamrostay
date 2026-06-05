// server/src/utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET;
if (!refreshTokenSecret) {
  throw new Error("Missing refresh token secret. Set REFRESH_TOKEN_SECRET or JWT_REFRESH_SECRET.");
}

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, refreshTokenSecret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });
};

const generateTokenPair = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

module.exports = { generateAccessToken, generateRefreshToken, generateTokenPair };
