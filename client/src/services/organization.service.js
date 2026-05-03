import api from "./api";

export const organizationService = {
  getMyOrg: async () => {
    const { data } = await api.get("/organization/get-my-org");
    return data;
  },

  getMyOwnOrg: async () => {
    const { data } = await api.get("/organization/get-my-own-org");
    return data;
  },

  getEmployees: async () => {
    const { data } = await api.get("/organization/get-employees");
    return data;
  },

  removeEmployee: async (userId) => {
    const { data } = await api.delete(`/organization/remove-employee/${userId}`);
    return data;
  },

  getLeaderboard: async () => {
    const { data } = await api.get("/organization/leaderboard");
    return data;
  },

  getIncidentStats: async () => {
    const { data } = await api.get("/organization/incident-stats");
    return data;
  },

  orgAIAssistant: async (message) => {
    const { data } = await api.post("/organization/ai-assistant", { message });
    return data;
  },

  executeOrgAIAction: async (actionType, params) => {
    const { data } = await api.post("/organization/ai-execute-action", { actionType, params });
    return data;
  },
};
