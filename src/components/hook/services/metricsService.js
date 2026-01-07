import api from "./api";

class MetricsService {
  // 📊 Métricas de administrador (solo para staff)
  async getAdminMetrics() {
    try {
      return await api.get('/admin/metrics/');
    } catch (error) {
      console.error("Error obteniendo métricas de administrador:", error);
      throw error;
    }
  }

  // 👤 Métricas personales del usuario
  async getPersonalMetrics() {
    try {
      return await api.get('/user/metrics/');
    } catch (error) {
      console.error("Error obteniendo métricas personales:", error);
      throw error;
    }
  }

  // 🎵 Estadísticas de canciones
  async getSongStats(songId) {
    try {
      return await api.get(`/songs/${songId}/stats/`);
    } catch (error) {
      console.error(`Error obteniendo estadísticas para canción ${songId}:`, error);
      throw error;
    }
  }

  // 📈 Trends y popularidad
  async getTrendingSongs(timeframe = 'week') {
    try {
      return await api.get(`/trending/?timeframe=${timeframe}`);
    } catch (error) {
      console.error("Error obteniendo canciones trending:", error);
      throw error;
    }
  }
}

export default new MetricsService();