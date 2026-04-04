// src/components/hook/services/apia.js
// ✅ MODIFICADO: Añadir idempotency headers automáticos
// ✅ Listo para producción

import axios from "axios";
import { generateIdempotencyKey, markKeyAsUsed } from "../../../utils/idempotency";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.djidjimusic.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función para obtener token (soporta múltiples nombres)
export const getAuthToken = () => {
  return localStorage.getItem("accessToken") ||
         localStorage.getItem("access_token") ||
         localStorage.getItem("token") ||
         localStorage.getItem("auth_token") ||
         localStorage.getItem("jwt_token") ||
         localStorage.getItem("django_token");
};

// ============================================
// 🆕 INTERCEPTOR: Añadir idempotency key automáticamente
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ NUEVO: Añadir idempotency key a operaciones mutantes (POST, PUT, PATCH)
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch'].includes(method)) {
      // No sobrescribir si ya existe
      if (!config.headers['X-Idempotency-Key']) {
        const idempotencyKey = generateIdempotencyKey();
        config.headers['X-Idempotency-Key'] = idempotencyKey;
        
        // Guardar en metadata para marcar como usado después
        config.metadata = { ...config.metadata, idempotencyKey };
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// 🆕 INTERCEPTOR: Marcar idempotency key como usada en respuestas exitosas
// ============================================
api.interceptors.response.use(
  (response) => {
    // Marcar la clave como usada si existe en metadata
    if (response.config?.metadata?.idempotencyKey) {
      markKeyAsUsed(response.config.metadata.idempotencyKey);
    }
    return response;
  },
  (error) => {
    // Manejo de errores
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    
    // ✅ NUEVO: Manejo específico de errores del wallet
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

// Servicios de upload (mantener existentes)
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