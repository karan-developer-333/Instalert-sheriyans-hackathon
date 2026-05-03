import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  incidents: [],
  selectedIncident: null,
  loading: false,
  error: null,
};

const incidentSlice = createSlice({
  name: "incident",
  initialState,
  reducers: {
    fetchIncidentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchIncidentsSuccess: (state, action) => {
      state.loading = false;
      state.incidents = action.payload.incidents || action.payload || [];
      state.error = null;
    },
    fetchIncidentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedIncident: (state, action) => {
      state.selectedIncident = action.payload;
    },
    addIncident: (state, action) => {
      const exists = state.incidents.some((i) => i._id === action.payload._id);
      if (!exists) {
        state.incidents.unshift(action.payload);
      }
    },
    updateIncident: (state, action) => {
      const idx = state.incidents.findIndex((i) => i._id === action.payload._id);
      if (idx !== -1) {
        state.incidents[idx] = action.payload;
      }
      if (state.selectedIncident?._id === action.payload._id) {
        state.selectedIncident = action.payload;
      }
    },
    removeIncident: (state, action) => {
      state.incidents = state.incidents.filter((i) => i._id !== action.payload);
      if (state.selectedIncident?._id === action.payload) {
        state.selectedIncident = null;
      }
    },
    clearIncidents: (state) => {
      state.incidents = [];
      state.selectedIncident = null;
      state.error = null;
    },
  },
});

export const {
  fetchIncidentsStart,
  fetchIncidentsSuccess,
  fetchIncidentsFailure,
  setSelectedIncident,
  addIncident,
  updateIncident,
  removeIncident,
  clearIncidents,
} = incidentSlice.actions;
export default incidentSlice.reducer;
