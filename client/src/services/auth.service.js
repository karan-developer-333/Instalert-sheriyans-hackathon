import api from "./api";

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  },

  verifyEmail: async (email, otp) => {
    const { data } = await api.post("/auth/verify-email", { email, otp });
    return data;
  },

  resendOTP: async (email) => {
    const { data } = await api.post("/auth/resend-otp", { email });
    return data;
  },

  githubLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/auth/github`;
  },

  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      window.location.href = "/auth/login";
    }
  },

  getRepos: async () => {
    const { data } = await api.get("/auth/repos");
    return data;
  },

  getCommits: async () => {
    const { data } = await api.get("/auth/commits");
    return data;
  },
};
