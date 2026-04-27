import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

let socket = null;

export function useSocket() {
  const { user } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (!socket) {
      socket = io(import.meta.env.VITE_SOCKET_URL || "/", { withCredentials: true, transports: ["websocket"] });
    }
    socketRef.current = socket;
    socket.emit("user:join", user.id);
    if (user.role === "ADMIN") socket.emit("admin:join");
    return () => {};
  }, [user]);

  return socketRef.current;
}