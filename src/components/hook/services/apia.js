// src/components/hook/services/apia.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.djidjimusic.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función para obtener token
export const getAuthToken = () => {
  return localStorage.getItem("accessToken") ||
         localStorage.getItem("access_token") ||
         localStorage.getItem("token") ||
         localStorage.getItem("auth_token") ||
         localStorage.getItem("jwt_token") ||
         localStorage.getItem("django_token");
};

// Interceptor de token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Error de conexión";
    
    error.message = errorMessage;
    return Promise.reject(error);
  }
);

// Servicios de upload
export const uploadService = {
  async requestUploadUrl(fileData) {
    const response = await api.post('/api2/upload/direct/request/', fileData);
    return response.data;
  },
  async confirmUpload(uploadId) {
    const response = await api.post(`/api2/upload/direct/confirm/${uploadId}/`);
    return response.data;
  },
  async getQuota() {
    const response = await api.get('/api2/upload/quota/');
    return response.data;
  }
};

export default api;