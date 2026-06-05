// server/src/middleware/role.middleware.js
const { apiResponse } = require("../utils/apiResponse");

/**
 * Role-based access control middleware
 * Usage: authorize("ADMIN") or authorize("ADMIN", "VENDOR")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(apiResponse(false, "Authentication required."));
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        apiResponse(false, `Access denied. Required role: ${roles.join(" or ")}`)
      );
    }
    next();
  };
};

module.exports = { authorize };
