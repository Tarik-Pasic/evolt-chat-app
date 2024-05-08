import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import randomStringGenerator from "./utils/randomStringGenerator.js";

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let activeUsers = new Map();

app.get("/activeUsers", (req, res) => {
  try {
    const activeUsersArray = Array.from(activeUsers).map(
      ([userId, username]) => ({ userId, username })
    );
    return res.status(200).send(activeUsersArray);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("registerUser", (data) => {
    const userInformation = { ...data };

    if (!userInformation.username)
      userInformation.username = randomStringGenerator(10);

    if (!userInformation.userId)
      userInformation.userId = randomStringGenerator(20);

    if (!activeUsers.has(userInformation.userId))
      activeUsers.set(userInformation.userId, userInformation.username);

    socket.emit("getUserInformation", userInformation);
    socket.broadcast.emit("activeUsers", userInformation);
  });

  //socket.broadcast.emit("joinedGlobalChat", data);

  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("deleteActiveUser", (userId) => {
    activeUsers.delete(userId);
    console.log("User has been removed from active users.");
    socket.broadcast.emit("disconnectedUser", userId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("Server has been started");
});
