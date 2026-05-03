import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

let socket = null;

export const initSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinOrganization = (joinCode) => {
  const s = getSocket();
  s.emit("join-org", JSON.stringify({ joinCode }));
};

export const createIncident = (incidentData) => {
  const s = getSocket();
  s.emit("create-incident", JSON.stringify(incidentData));
};

export const sendMessage = ({ message, tempId, joinCode, userId, senderName, incidentId }) => {
  const s = getSocket();
  s.emit("send-message", JSON.stringify({
    message,
    joinCode,
    tempId,
    incidentId: incidentId || tempId,
    userId,
    senderName,
  }));
};

export const toggleIncidentStatus = ({ incidentId, joinCode }) => {
  const s = getSocket();
  s.emit("toggle-incident-status", JSON.stringify({ incidentId, joinCode }));
};

export const updateMessage = ({ messageId, content, incidentId, joinCode, userId }) => {
  const s = getSocket();
  s.emit("update-message", JSON.stringify({ messageId, content, incidentId, joinCode, userId }));
};

export const deleteMessage = ({ messageId, incidentId, joinCode, userId }) => {
  const s = getSocket();
  s.emit("delete-message", JSON.stringify({ messageId, incidentId, joinCode, userId }));
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;
