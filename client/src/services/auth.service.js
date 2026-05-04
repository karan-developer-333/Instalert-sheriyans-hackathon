import api from "./api";

const authService = {
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

  forgotPassword: async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const { data } = await api.post("/auth/reset-password", { email, otp, newPassword });
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },

  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

export default authService;
