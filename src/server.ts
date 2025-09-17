import app from './app';
import { sequelize } from './config/db';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

/** Socket.io  init with all server */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

export { io };

/** connect client */
io.on("connection", (socket) => {
  console.log("--- connected Client:", socket.id);



  /** join roooms */
  socket.on("joinRoom", (roomName: string) => {
    socket.join(roomName);
    console.log(`--- ${roomName} joined room`);
    io.to(roomName).emit("message", `Welcome to ${roomName}!`);
  });

  /** share msg */
  socket.on("sendMessage", (data) => {
    console.log("--- Message received:", data);
    io.emit("receiveMessage", data);

  });

  /**  room msges events */
  socket.on("sendRoomMessage", ({ roomName, message }: { roomName: string; message: string }) => {
    io.to(roomName).emit("message", { user: socket.id, text: message });
  });

  /**  clinet Disconnect  */
  socket.on("disconnect", () => {
    console.log(" disconnected Client:", socket.id);
  });
});

/**  clinet Disconnect  */
sequelize.authenticate()
  .then(() => console.log('==== DB connected ====='))
  .catch((err) => console.error('******** DB connection failed: ********F', err));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
