// services/apia.js
import axios from "axios";

// VITE_API_URL viene del archivo .env de Vite
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor global para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Error de conexión";
    return Promise.reject(new Error(errorMessage));
  }
);
