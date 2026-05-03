import api from "./api";

export const userService = {
  createMyOrganization: async (organizationName) => {
    const { data } = await api.post("/user/create-organization", { organizationName });
    return data;
  },

  checkHasOrganization: async () => {
    const { data } = await api.get("/user/has-organization");
    return data;
  },

  joinOrganization: async (joinCode) => {
    const { data } = await api.post("/user/join-organization", { joinCode });
    return data;
  },
};
