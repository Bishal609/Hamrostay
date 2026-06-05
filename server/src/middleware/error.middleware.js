// server/src/middleware/error.middleware.js
const { apiResponse } = require("../utils/apiResponse");

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Prisma errors
  if (err.code === "P2002") {
    statusCode = 409;
    message = `Duplicate value for: ${err.meta?.target?.join(", ")}`;
  }
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found.";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    statusCode = 422;
    message = err.errors.map((e) => e.message).join(", ");
  }

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  return res.status(statusCode).json(
    apiResponse(false, message, null, {
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
  );
};

module.exports = { notFound, errorHandler };
