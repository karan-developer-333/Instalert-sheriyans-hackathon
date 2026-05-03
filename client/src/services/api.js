import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data || {};
    const message =
      errorData.error ||
      errorData.message ||
      "Something went wrong";

    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname.startsWith("/auth");
      if (!isAuthPage) {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(errorData);
  }
);

export default api;
