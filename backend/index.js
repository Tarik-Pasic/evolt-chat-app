import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let activeUsers = [];

app.get("/activeUsers", async (req, res) => {
  try {
    return res.status(200).send(activeUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinGlobalChat", (data) => {
    const newUser = { username: data.username, id: socket.id };
    activeUsers.push(newUser);

    socket.broadcast.emit("joinedGlobalChat", data);
    socket.broadcast.emit("activeUsers", newUser);
  });

  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.id !== socket.id);
    socket.broadcast.emit("disconnectedUser", socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("Server has been started");
});
