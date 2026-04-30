// src/components/hook/services/apia.js

import axios from "axios";
import { generateIdempotencyKey, markKeyAsUsed } from "../../../utils/idempotency";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.djidjimusic.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// 🔐 VARIABLES DE CONTROL
// ============================================
let isRefreshing = false;
let failedQueue = [];

// Procesar cola de requests en espera
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

// ============================================
// 🔑 HELPERS DE TOKENS
// ============================================
export const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

// ============================================
// 🔄 REFRESH TOKEN (CORREGIDO)
// ============================================
const refreshToken = async () => {
  const refresh = getRefreshToken();

  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    "https://api.djidjimusic.com/musica/api/token/refresh/",
    { refresh }
  );

  const { access, refresh: newRefresh } = response.data;

  if (access) {
    localStorage.setItem("accessToken", access);
  }

  // 🔥 CRÍTICO: guardar refresh rotado
  if (newRefresh) {
    localStorage.setItem("refreshToken", newRefresh);
  }

  return access;
};

// ============================================
// 📤 INTERCEPTOR REQUEST
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toLowerCase();

    if (["post", "put", "patch"].includes(method)) {
      if (!config.headers["X-Idempotency-Key"]) {
        const idempotencyKey = generateIdempotencyKey();
        config.headers["X-Idempotency-Key"] = idempotencyKey;
        config.metadata = { ...config.metadata, idempotencyKey };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// 📥 INTERCEPTOR RESPONSE
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

    // ============================================
    // 🔴 MANEJO 401 (JWT EXPIRED)
    // ============================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Si ya hay refresh en curso → cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newToken = await refreshToken();

        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Liberar cola
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // 🔥 Logout global limpio
        window.dispatchEvent(new CustomEvent("auth:expired"));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ============================================
    // ⚠️ RATE LIMIT
    // ============================================
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.["retry-after"] || 60;

      console.warn(`[Rate Limit] Espera ${retryAfter}s`);
      error.message = `Demasiadas peticiones. Espera ${retryAfter} segundos.`;
      error.retryAfter = parseInt(retryAfter, 10);
    }

    // ============================================
    // 💰 WALLET
    // ============================================
    if (error.response?.status === 402) {
      console.warn("[Wallet] Saldo insuficiente");
      error.message =
        error.response?.data?.message || "Saldo insuficiente";
    }

    // ============================================
    // 🧠 MENSAJE GENERAL
    // ============================================
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

// ============================================
// 📦 SERVICIOS
// ============================================
export const uploadService = {
  async requestUploadUrl(fileData) {
    const response = await api.post("/api2/upload/direct/request/", fileData);
    return response.data;
  },
  async confirmUpload(uploadId) {
    const response = await api.post(`/api2/upload/direct/confirm/${uploadId}/`);
    return response.data;
  },
  async getQuota() {
    const response = await api.get("/api2/upload/quota/");
    return response.data;
  },
};

export default api;