// src/services/ApiIntegrator.js
import { api } from './apiConfig'; // Tu axios configurado

class ApiIntegrator {
  constructor() {
    this.baseURL = '/api2/';
  }

  // =========== CANCIONES ===========
  songs = {
    getAll: (params = {}) => api.get(`${this.baseURL}songs/`, { params }),
    getById: (id) => api.get(`${this.baseURL}songs/${id}/`),
    create: (formData) => api.post(`${this.baseURL}songs/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.patch(`${this.baseURL}songs/${id}/`, data),
    delete: (id) => api.delete(`${this.baseURL}songs/${id}/`),
    like: (id) => api.post(`${this.baseURL}songs/${id}/like/`),
    stream: (id) => api.get(`${this.baseURL}songs/${id}/stream/`, {
      responseType: 'blob'
    }),
    download: (id) => api.get(`${this.baseURL}songs/${id}/download/`),
    random: () => api.get(`${this.baseURL}songs/random/`)
  };

  // =========== COMENTARIOS ===========
  comments = {
    getBySong: (songId) => api.get(`${this.baseURL}songs/${songId}/comments/`),
    create: (songId, content) => api.post(`${this.baseURL}songs/${songId}/comments/`, { content }),
    update: (commentId, data) => api.patch(`${this.baseURL}comments/${commentId}/`, data),
    delete: (commentId) => api.delete(`${this.baseURL}comments/${commentId}/`)
  };

  // =========== EVENTOS ===========
  events = {
    getAll: () => api.get(`${this.baseURL}events/`),
    getById: (id) => api.get(`${this.baseURL}events/${id}/`),
    create: (data) => api.post(`${this.baseURL}events/`, data),
    update: (id, data) => api.put(`${this.baseURL}events/${id}/`, data),
    delete: (id) => api.delete(`${this.baseURL}events/${id}/`)
  };

  // =========== UTILIDADES ===========
  utils = {
    suggestions: (query) => api.get(`${this.baseURL}suggestions/`, { params: { query } }),
    artists: () => api.get(`${this.baseURL}artists/`),
    health: () => api.get(`${this.baseURL}health/`)
  };

  // Método para probar todas las conexiones
  async testAllConnections() {
    const results = [];
    
    try {
      // Test Health
      const health = await this.utils.health();
      results.push({ endpoint: 'health', status: '✅', data: health.data });
      
      // Test Songs
      const songs = await this.songs.getAll();
      results.push({ endpoint: 'songs', status: '✅', count: songs.data.count });
      
      // Test Events
      const events = await this.events.getAll();
      results.push({ endpoint: 'events', status: '✅', count: events.data.count });
      
      // Test Artists
      const artists = await this.utils.artists();
      results.push({ endpoint: 'artists', status: '✅', count: artists.data.length });
      
      return { success: true, results };
      
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        results 
      };
    }
  }
}

export default new ApiIntegrator();