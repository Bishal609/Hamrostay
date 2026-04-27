// server/src/middleware/cache.middleware.js
const { cache } = require("../utils/cache");

/**
 * Response caching middleware
 * @param {number} ttl - Time to live in seconds
 * @param {string} keyPrefix - Cache key prefix
 */
const cacheMiddleware = (ttl = 300, keyPrefix = "") => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    const key = `${keyPrefix}:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        cache.set(key, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Bust cache by prefix
 */
const bustCache = (keyPrefix) => {
  const keys = cache.keys();
  keys.forEach((key) => {
    if (key.startsWith(keyPrefix)) {
      cache.del(key);
    }
  });
};

module.exports = { cacheMiddleware, bustCache };
