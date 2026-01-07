import api from "./api";

class EventService {
  // 🎪 Obtener todos los eventos
  async getEvents(page = 1, pageSize = 10) {
    try {
      return await api.get(`/events/?page=${page}&page_size=${pageSize}`);
    } catch (error) {
      console.error("Error obteniendo eventos:", error);
      throw error;
    }
  }

  // 🔍 Obtener evento por ID
  async getEventById(eventId) {
    try {
      return await api.get(`/events/${eventId}/`);
    } catch (error) {
      console.error(`Error obteniendo evento ${eventId}:`, error);
      throw error;
    }
  }

  // ➕ Crear evento
  async createEvent(eventData) {
    try {
      return await api.post('/events/', eventData);
    } catch (error) {
      console.error("Error creando evento:", error);
      throw error;
    }
  }

  // ✏️ Actualizar evento
  async updateEvent(eventId, eventData) {
    try {
      return await api.put(`/events/${eventId}/`, eventData);
    } catch (error) {
      console.error(`Error actualizando evento ${eventId}:`, error);
      throw error;
    }
  }

  // 🗑️ Eliminar evento
  async deleteEvent(eventId) {
    try {
      return await api.delete(`/events/${eventId}/`);
    } catch (error) {
      console.error(`Error eliminando evento ${eventId}:`, error);
      throw error;
    }
  }

  // 📅 Obtener eventos próximos
  async getUpcomingEvents(limit = 5) {
    try {
      return await api.get(`/events/upcoming/?limit=${limit}`);
    } catch (error) {
      console.error("Error obteniendo eventos próximos:", error);
      throw error;
    }
  }
}

export default new EventService();