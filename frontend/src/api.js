import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  // You can add headers here if needed (e.g., Authorization)
});

export default api; 