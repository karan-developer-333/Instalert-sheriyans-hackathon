import api from "./api";

const createOrganization = async (orgData) => {
  const { data } = await api.post("/organization/create-org", orgData);
  return data;
};

const getMyOrg = async () => {
  const { data } = await api.get("/organization/get-my-org");
  return data;
};

const getOrganization = async () => {
  const { data } = await api.get("/organization/get-my-own-org");
  return data;
};

const getEmployees = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await api.get("/organization/get-employees", { params: { page, limit } });
  return data;
};

const removeEmployee = async (userId) => {
  const { data } = await api.delete(`/organization/remove-employee/${userId}`);
  return data;
};

const getLeaderboard = async () => {
  const { data } = await api.get("/organization/leaderboard");
  return data;
};

const getIncidentStats = async () => {
  const { data } = await api.get("/organization/incident-stats");
  return data;
};

const askOrgAI = async (message) => {
  const { data } = await api.post("/organization/ai-assistant", { message });
  return data;
};

const executeOrgAIAction = async (actionType, params) => {
  const { data } = await api.post("/organization/ai-execute-action", { actionType, params });
  return data;
};

const getAIPrompt = async () => {
  const { data } = await api.get("/organization/ai-prompt");
  return data;
};

const saveAIPrompt = async (customPrompt) => {
  const { data } = await api.post("/organization/ai-prompt", { customPrompt });
  return data;
};

const getAISuggestions = async () => {
  const { data } = await api.get("/organization/ai-suggestions");
  return data;
};

const organizationService = {
  createOrganization,
  getMyOrg,
  getOrganization,
  getEmployees,
  removeEmployee,
  getLeaderboard,
  getIncidentStats,
  askOrgAI,
  executeOrgAIAction,
  getAIPrompt,
  saveAIPrompt,
  getAISuggestions,
};

export { organizationService };
export default organizationService;
