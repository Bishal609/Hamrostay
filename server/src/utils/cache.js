// server/src/utils/cache.js
const NodeCache = require("node-cache");

// stdTTL: default TTL in seconds, checkperiod: cleanup interval
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false, // Better performance for read-heavy workloads
});

cache.on("set", (key) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`📦 Cache SET: ${key}`);
  }
});

cache.on("del", (key) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`🗑️  Cache DEL: ${key}`);
  }
});

module.exports = { cache };
