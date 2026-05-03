import api from "./api";

export const adminService = {
  createOrganization: async (orgData) => {
    const { data } = await api.post("/admin/create-organization", orgData);
    return data;
  },
};
