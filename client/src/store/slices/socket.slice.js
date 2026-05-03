import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connected: false,
  messages: {},
  error: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    addMessage: (state, action) => {
      const { incidentId, message } = action.payload;
      if (!state.messages[incidentId]) {
        state.messages[incidentId] = [];
      }
      const exists = state.messages[incidentId].some((m) => m._id === message._id);
      if (!exists) {
        state.messages[incidentId].push(message);
      }
    },
    clearMessages: (state, action) => {
      if (action.payload) {
        delete state.messages[action.payload];
      } else {
        state.messages = {};
      }
    },
    updateMessage: (state, action) => {
      const { incidentId, messageId, content, updatedAt } = action.payload;
      if (!state.messages[incidentId]) return;
      const msg = state.messages[incidentId].find((m) => m._id === messageId);
      if (msg) {
        msg.content = content;
        msg.updatedAt = updatedAt;
      }
    },
    deleteMessage: (state, action) => {
      const { incidentId, messageId } = action.payload;
      if (!state.messages[incidentId]) return;
      state.messages[incidentId] = state.messages[incidentId].filter((m) => m._id !== messageId);
    },
    setSocketError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setConnected, addMessage, clearMessages, updateMessage, deleteMessage, setSocketError } = socketSlice.actions;
export default socketSlice.reducer;
