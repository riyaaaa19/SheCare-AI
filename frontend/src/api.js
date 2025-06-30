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

export const getRecommendations = async () => {
  try {
    console.log("Trying public recommendations endpoint...");
    // First try the public endpoint
    const response = await api.get("/recommendations/public");
    console.log("Public recommendations response:", response.data);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Public endpoint failed:", error);
    // If public endpoint fails, try authenticated endpoint
    try {
      const token = localStorage.getItem("shecare_token");
      console.log("Token found:", !!token);
      if (token) {
        console.log("Trying authenticated recommendations endpoint...");
        const authResponse = await api.get("/recommendations");
        console.log("Authenticated recommendations response:", authResponse.data);
        if (authResponse.data && Array.isArray(authResponse.data)) {
          return authResponse.data;
        }
      }
    } catch (authError) {
      console.error("Both public and authenticated recommendations failed:", authError);
    }
    // If both fail, throw error to trigger fallback
    throw new Error("Failed to fetch recommendations from API");
  }
};

export default api;