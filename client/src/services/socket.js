import { io } from "socket.io-client";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SOCKET_URL = API.replace(/\/api\/?$/, "");

let socket = null;
let connectedToken = "";

export function connectSocket(token) {
  if (!token) {
    return null;
  }

  if (socket && connectedToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  connectedToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  connectedToken = "";
}