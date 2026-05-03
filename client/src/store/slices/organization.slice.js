import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  organization: null,
  employees: [],
  memberCount: 0,
  leaderboard: [],
  incidentStats: { chartData: [], recentIncidents: [] },
  loading: false,
  error: null,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    fetchOrgStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrgSuccess: (state, action) => {
      state.loading = false;
      state.organization = action.payload.organization;
      state.memberCount = action.payload.memberCount || 0;
      state.error = null;
    },
    fetchEmployeesSuccess: (state, action) => {
      state.loading = false;
      state.employees = action.payload.members || action.payload.employees || [];
      state.memberCount = action.payload.count || state.employees.length;
      state.error = null;
    },
    fetchOrgFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    removeEmployeeSuccess: (state, action) => {
      state.employees = state.employees.filter(
        (emp) => emp._id !== action.payload
      );
      state.memberCount = state.employees.length;
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    setIncidentStats: (state, action) => {
      state.incidentStats = action.payload;
    },
    clearOrg: (state) => {
      state.organization = null;
      state.employees = [];
      state.memberCount = 0;
      state.leaderboard = [];
      state.incidentStats = { chartData: [], recentIncidents: [] };
      state.error = null;
    },
  },
});

export const {
  fetchOrgStart,
  fetchOrgSuccess,
  fetchEmployeesSuccess,
  fetchOrgFailure,
  removeEmployeeSuccess,
  setLeaderboard,
  setIncidentStats,
  clearOrg,
} = organizationSlice.actions;
export default organizationSlice.reducer;
