import api from "./api";

export const generateApiKey = async () => {
  const res = await api.post("/apikey/generate");
  return res.data;
};

export const getApiKey = async () => {
  const res = await api.get("/apikey/list");
  return res.data;
};

export const revokeApiKey = async () => {
  const res = await api.delete("/apikey/revoke");
  return res.data;
};
