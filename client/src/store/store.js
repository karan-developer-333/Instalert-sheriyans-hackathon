import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import organizationReducer from "./slices/organization.slice";
import incidentReducer from "./slices/incident.slice";
import socketReducer from "./slices/socket.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    incident: incidentReducer,
    socket: socketReducer,
  },
});

export default store;
