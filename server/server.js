// server/server.js
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const http = require("http");
const app = require("./src/app");
const { initSocket } = require("./src/config/socket");
const { connectDB } = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║     🏨  HamroStay Server Running      ║
║     Port: ${PORT}                        ║
║     Env:  ${process.env.NODE_ENV}          ║
╚═══════════════════════════════════════╝
    `);
  });
};

startServer();

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});
