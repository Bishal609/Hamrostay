// server/src/config/socket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { prisma } = require("./db");

let io;

// Authenticate socket connection
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, role: true, isActive: true },
    });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    if (!user.isActive) {
      return next(new Error("Authentication error: User account deactivated"));
    }

    socket.user = user;
    socket.userId = user.id;
    next();
  } catch (error) {
    next(new Error(`Authentication error: ${error.message}`));
  }
};

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

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Track online users: userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const userRole = socket.user.role;
    
    console.log(`🔌 Socket connected: ${socket.id} (User: ${userId}, Role: ${userRole})`);

    // Track online user
    onlineUsers.set(userId, { socketId: socket.id, role: userRole });
    socket.join(`user:${userId}`);

    // Admin joins admin room
    if (userRole === "ADMIN") {
      socket.join("admin");
      console.log(`🔐 Admin ${userId} joined admin room`);
    }

    // Vendor joins vendor room
    if (userRole === "VENDOR") {
      socket.join("vendor");
      console.log(`🏪 Vendor ${userId} joined vendor room`);
    }

    // Notify about online count
    io.emit("users:online", onlineUsers.size);

    // Chat message (for live support chat between customer and admin)
    socket.on("chat:message", (data) => {
      if (!data.roomId || !data.senderId || data.senderId !== userId) {
        console.warn(`⚠️ Invalid chat message from ${userId}`);
        return;
      }
      // Verify sender is the authenticated user
      socket.to(data.roomId).emit("chat:message", { ...data, verified: true });
    });

    // Typing indicator
    socket.on("chat:typing", (data) => {
      if (!data.roomId || !data.senderId || data.senderId !== userId) {
        console.warn(`⚠️ Invalid typing indicator from ${userId}`);
        return;
      }
      socket.to(data.roomId).emit("chat:typing", data);
    });

    // Notify admin of user activity
    socket.on("admin:message", (data) => {
      if (userRole !== "ADMIN") {
        console.warn(`⚠️ Non-admin ${userId} tried to send admin message`);
        return;
      }
      io.to("admin").emit("admin:message", data);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("users:online", onlineUsers.size);
      console.log(`🔌 Socket disconnected: ${socket.id} (User: ${userId})`);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error from ${userId}:`, error);
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
