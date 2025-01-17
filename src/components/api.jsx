import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/register/';

// Configuración de Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las solicitudes
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Funciones para la API
export const registerUser = (data) => apiClient.post('/register/', data);
export const loginUser = (data) => apiClient.post('/token/', data);
export const fetchProtectedData = () => apiClient.get('/protected/');