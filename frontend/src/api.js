import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Add a request interceptor to include the JWT token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("shecare_token"); // <-- match this to your Login.js
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;