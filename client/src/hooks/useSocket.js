import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

let socket = null;

export function useSocket() {
  const { user, accessToken } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !accessToken) return;
    
    if (!socket) {
      socket = io(import.meta.env.VITE_SOCKET_URL || "/", {
        withCredentials: true,
        transports: ["websocket"],
        auth: {
          token: accessToken,
        },
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    }

    socketRef.current = socket;
    return () => {};
  }, [user, accessToken]);

  return socketRef.current;
}