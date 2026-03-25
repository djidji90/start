// src/api/endpoints.js
export const API_ENDPOINTS = {
  // Comentarios
  COMMENTS: {
    LIST: (songId) => `/api2/songs/${songId}/comments/`,
    DETAIL: (commentId) => `/api2/songs/comments/${commentId}/`,
  },
  
  // Otros endpoints (para referencia)
  SONGS: {
    DETAIL: (songId) => `/api2/songs/${songId}/`,
    LIKE: (songId) => `/api2/songs/${songId}/like/`,
    DOWNLOAD: (songId) => `/api2/songs/${songId}/download/`,
    DOWNLOAD_COUNT: (songId) => `/api2/songs/${songId}/download-count/`,
  },
  
  // Auth
  AUTH: {
    TOKEN: '/musica/api/token/',
    REFRESH: '/musica/api/token/refresh/',
    VERIFY: '/musica/api/token/verify/',
    REGISTER: '/musica/register/',
  }
};