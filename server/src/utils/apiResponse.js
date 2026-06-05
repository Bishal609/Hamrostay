// server/src/utils/apiResponse.js
/**
 * Standardized API response format
 */
const apiResponse = (success, message, data = null, meta = {}) => ({
  success,
  message,
  data,
  ...meta,
  timestamp: new Date().toISOString(),
});

module.exports = { apiResponse };
