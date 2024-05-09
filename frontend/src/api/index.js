import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
});

export const getActiveUsers = async () => {
  const { data } = await instance.get("/activeUsers");
  return data;
};

export const getGlobalMessages = async () => {
  const { data } = await instance.get("/messages");
  return data;
};