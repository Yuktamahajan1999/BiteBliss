import { io } from "socket.io-client";

let socketInstance = null;
let connectionPromise = null;

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

export const getSocket = (token) => {
  if (!socketInstance && token) {
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    connectionPromise = new Promise((resolve) => {
      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance.id);
        resolve(socketInstance);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    });
  }

  return connectionPromise || Promise.resolve(socketInstance);
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    connectionPromise = null;
  }
};
