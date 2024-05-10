import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import randomStringGenerator from "./utils/randomStringGenerator.js";
import generateRoomId from "./utils/generateRoomId.js";

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_HOST || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const activeUsers = new Map();
const activeRooms = new Map();
const globalMessages = [];

app.get("/activeUsers", (req, res) => {
  try {
    const activeUsersArray = Array.from(activeUsers).map(
      ([userId, { username }]) => ({ userId, username })
    );
    return res.status(200).send(activeUsersArray);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

app.get("/messages", (req, res) => {
  try {
    return res.status(200).send(globalMessages);
  } catch (error) {
    return res.status(500).send(error);
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("registerUser", (data, callback) => {
    const userInformation = { ...data };

    if (!userInformation.username)
      userInformation.username = randomStringGenerator(10);

    if (!userInformation.userId)
      userInformation.userId = randomStringGenerator(20);

    if (!activeUsers.has(userInformation.userId))
      activeUsers.set(userInformation.userId, {
        username: userInformation.username,
        socketId: socket.id,
      });
    else {
      callback("alreadyRegistered");
      return;
    }

    socket.emit("getUserInformation", userInformation);
    socket.broadcast.emit("activeUsers", userInformation);
  });

  socket.on("joinGlobalChat", (username) => {
    socket.join("globalChat");
    socket.to("globalChat").emit("joinedGlobalChat", username);
  });

  socket.on("sendMessage", (data) => {
    const { roomId, ...restOfData } = data;

    if (roomId === "globalChat") globalMessages.push(restOfData);

    socket.to(roomId).emit("receiveMessage", restOfData);
  });

  socket.on("deleteActiveUser", (userId) => {
    if (activeUsers.get(userId).socketId !== socket.id) return;

    activeUsers.delete(userId);
    console.log("User has been removed from active users.");
    socket.broadcast.emit("disconnectedUser", userId);
  });

  socket.on("initiatePrivateChat", (data, callback) => {
    const { currentUserId, targetUserId } = data;

    const roomId = generateRoomId(currentUserId, targetUserId);

    if (!activeRooms.has(roomId))
      activeRooms.set(roomId, {
        [currentUserId]: { active: false },
        [targetUserId]: { active: false },
      });

    callback({
      roomId,
      targetUsername: activeUsers.get(targetUserId).username,
    });
  });

  socket.on("joinPrivateChat", (data, callback) => {
    const { currentUserId, roomId } = data;

    const roomData = activeRooms.get(roomId);

    if (!roomData) {
      callback("not_exist");
      return;
    }

    socket.leave("globalChat");
    socket.join(roomId);

    roomData[currentUserId].active = true;

    const allActiveUsers = Object.values(roomData).every((user) => user.active);

    if (allActiveUsers)
      io.to(roomId).emit(
        "privateChatJoined",
        "Both user have joined the chat room!"
      );
    else {
      const targetUserId = Object.keys(roomData).find(
        (userId) => userId !== currentUserId
      );

      socket
        .to(activeUsers.get(targetUserId).socketId)
        .emit("privateChatInitiated", activeUsers.get(currentUserId).username);
    }
  });

  socket.on("leavePrivateChat", (data) => {
    const { roomId, currentUserId, username } = data;

    const roomData = activeRooms.get(roomId);

    if (!roomData) return;

    const allActiveUsers = Object.values(roomData).every((user) => user.active);

    if (allActiveUsers) {
      roomData[currentUserId].active = false;

      socket
        .to(roomId)
        .emit("leftPrivateChat", `User-${username} has left the chat!`);
    } else {
      activeRooms.delete(roomId);
    }

    socket.leave(roomId);

    console.log("User left private chat!");
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("Server has been started");
});
