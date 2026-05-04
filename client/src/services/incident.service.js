import api from "./api";

export const incidentService = {
  getIncidents: async ({ page = 1, limit = 10 } = {}) => {
    const { data } = await api.get("/incidents/", { params: { page, limit } });
    return data;
  },

  getIncident: async (id) => {
    const { data } = await api.get(`/incidents/${id}`);
    return data.incident;
  },

  getMessages: async (incidentId) => {
    const { data } = await api.get(`/incidents/${incidentId}/messages`);
    return data.messages || [];
  },

  aiSummarize: async (incidentId) => {
    const { data } = await api.post(`/incidents/${incidentId}/ai-summarize`);
    return data.summary;
  },

  aiAsk: async (incidentId, question) => {
    const { data } = await api.post(`/incidents/${incidentId}/ai-ask`, { question });
    return data.answer;
  },

  createIncident: async (incidentData) => {
    const { data } = await api.post("/incidents/", incidentData);
    return data;
  },

  updateIncident: async (id, updateData) => {
    const { data } = await api.put(`/incidents/${id}`, updateData);
    return data;
  },

  deleteIncident: async (id) => {
    const { data } = await api.delete(`/incidents/${id}`);
    return data;
  },

  closeIncident: async (id) => {
    const { data } = await api.post(`/incidents/${id}/close`);
    return data.incident;
  },

  toggleIncidentStatus: async (id) => {
    const { data } = await api.patch(`/incidents/${id}/toggle-status`);
    return data.incident;
  },

  updateMessage: async (incidentId, messageId, content) => {
    const { data } = await api.put(`/incidents/${incidentId}/messages/${messageId}`, { content });
    return data.message;
  },

  deleteMessage: async (incidentId, messageId) => {
    const { data } = await api.delete(`/incidents/${incidentId}/messages/${messageId}`);
    return data;
  },
};
