// server/src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const { apiResponse } = require("../utils/apiResponse");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json(apiResponse(false, "Access denied. No token provided."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(401).json(apiResponse(false, "User not found."));
    }

    if (!user.isActive) {
      return res.status(403).json(apiResponse(false, "Account is deactivated."));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(apiResponse(false, "Token expired."));
    }
    return res.status(401).json(apiResponse(false, "Invalid token."));
  }
};

module.exports = { authenticate };
