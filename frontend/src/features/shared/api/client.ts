import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // CRITICAL: Enable cookies for HTTP-only auth
  headers: {
    "Content-Type": "application/json",
  },
});
