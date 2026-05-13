import axios from "axios";

const apiUrl = import.meta.env.VITE_SERVER_URL;

const api = axios.create({
  baseURL: apiUrl+"/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data || {};

    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname.startsWith("/auth");
      if (!isAuthPage) {
        // Use history API to avoid full page reload
        window.history.pushState({}, '', "/auth/login");
        // Dispatch a custom event to trigger re-render
        window.dispatchEvent(new Event('locationchange'));
      }
    }

    return Promise.reject(errorData);
  }
);

export default api;
