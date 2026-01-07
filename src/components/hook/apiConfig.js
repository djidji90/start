import axios from "axios"; // Import normal, no uses la ruta directa de node_modules

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.example.com/",
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