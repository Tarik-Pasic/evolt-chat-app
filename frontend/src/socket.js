import io from "socket.io-client";

const url = process.env.API_URL || "http://localhost:3001";

export default io(url, {
  autoConnect: false,
});
