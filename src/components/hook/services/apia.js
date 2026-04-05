// src/components/hook/services/apia.js - INTERCEPTOR CORREGIDO

import axios from "axios";
import { generateIdempotencyKey, markKeyAsUsed } from "../../../utils/idempotency";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.djidjimusic.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable para evitar múltiples renovaciones simultáneas
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const getAuthToken = () => {
  return localStorage.getItem("accessToken") ||
         localStorage.getItem("access_token") ||
         localStorage.getItem("token") ||
         localStorage.getItem("auth_token") ||
         localStorage.getItem("jwt_token") ||
         localStorage.getItem("django_token");
};

// Obtener refresh token
const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

// Función para renovar token (necesita importación dinámica para evitar circular)
const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token available');
  
  const response = await axios.post('https://api.djidjimusic.com/musica/api/token/refresh/', {
    refresh
  });
  
  const { access } = response.data;
  localStorage.setItem('accessToken', access);
  return access;
};

// ============================================
// INTERCEPTOR DE REQUEST
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch'].includes(method)) {
      if (!config.headers['X-Idempotency-Key']) {
        const idempotencyKey = generateIdempotencyKey();
        config.headers['X-Idempotency-Key'] = idempotencyKey;
        config.metadata = { ...config.metadata, idempotencyKey };
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// INTERCEPTOR DE RESPONSE - CON REFRESH TOKEN
// ============================================
api.interceptors.response.use(
  (response) => {
    if (response.config?.metadata?.idempotencyKey) {
      markKeyAsUsed(response.config.metadata.idempotencyKey);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si es error 401 y no es un intento de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (isRefreshing) {
        // Si ya hay una renovación en curso, esperar
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }
      
      isRefreshing = true;
      
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Manejo de otros errores
    if (error.response?.status === 402) {
      window.dispatchEvent(new CustomEvent('wallet:insufficient_funds', {
        detail: error.response?.data
      }));
    }
    
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'] || 60;
      window.dispatchEvent(new CustomEvent('wallet:rate_limited', {
        detail: { retryAfter }
      }));
    }
    
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      "Error de conexión";
    
    error.message = errorMessage;
    return Promise.reject(error);
  }
);

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