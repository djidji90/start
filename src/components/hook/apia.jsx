import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || 'Error de conexión';
    return Promise.reject(new Error(errorMessage));
  }
);  