// server/src/config/socket.js
const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
  });

  // Track online users: userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on("user:join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);
      socket.userId = userId;
      console.log(`👤 User ${userId} joined`);

      // Notify admin rooms of online count
      io.emit("users:online", onlineUsers.size);
    });

    // Admin joins admin room
    socket.on("admin:join", () => {
      socket.join("admin");
      console.log("🔐 Admin joined admin room");
    });

    // Chat message (for live support chat between customer and admin)
    socket.on("chat:message", (data) => {
      // data: { roomId, senderId, senderName, message, timestamp }
      socket.to(data.roomId).emit("chat:message", data);
    });

    // Typing indicator
    socket.on("chat:typing", (data) => {
      socket.to(data.roomId).emit("chat:typing", data);
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("users:online", onlineUsers.size);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Emit to a specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit to all admins
const emitToAdmins = (event, data) => {
  if (io) {
    io.to("admin").emit(event, data);
  }
};

// Emit to all connected clients
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const getIO = () => io;

module.exports = { initSocket, emitToUser, emitToAdmins, emitToAll, getIO };
