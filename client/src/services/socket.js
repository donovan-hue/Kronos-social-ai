import { io } from "socket.io-client";
import { API_URL } from "./apiClient";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");
let socket = null; let connectedToken = "";
export function connectSocket(token) { if (!token) return null; if (socket && connectedToken === token) return socket; if (socket) socket.disconnect(); connectedToken = token; socket = io(SOCKET_URL, { auth: { token }, reconnection: true, reconnectionAttempts: Infinity }); return socket; }
export function getSocket() { return socket; }
export function disconnectSocket() { if (socket) socket.disconnect(); socket = null; connectedToken = ""; }
