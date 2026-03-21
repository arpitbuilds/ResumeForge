import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    // When a logged-in user hits their dashboard, they join a private room using their userID
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room for live alerts.`);
    });
  });
  
  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
