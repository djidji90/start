import api from "./api";

class CommentService {
  // 💬 Obtener comentarios de una canción
  async getComments(songId, page = 1, pageSize = 10) {
    try {
      return await api.get(`/songs/${songId}/comments/?page=${page}&page_size=${pageSize}`);
    } catch (error) {
      console.error(`Error obteniendo comentarios para canción ${songId}:`, error);
      throw error;
    }
  }

  // ✍️ Crear comentario
  async createComment(songId, content) {
    try {
      return await api.post(`/songs/${songId}/comments/`, { content });
    } catch (error) {
      console.error(`Error creando comentario para canción ${songId}:`, error);
      throw error;
    }
  }

  // ✏️ Actualizar comentario
  async updateComment(commentId, content) {
    try {
      return await api.put(`/comments/${commentId}/`, { content });
    } catch (error) {
      console.error(`Error actualizando comentario ${commentId}:`, error);
      throw error;
    }
  }

  // 🗑️ Eliminar comentario
  async deleteComment(commentId) {
    try {
      return await api.delete(`/comments/${commentId}/`);
    } catch (error) {
      console.error(`Error eliminando comentario ${commentId}:`, error);
      throw error;
    }
  }

  // 🔄 Obtener respuestas a comentarios
  async getReplies(commentId) {
    try {
      return await api.get(`/comments/${commentId}/replies/`);
    } catch (error) {
      console.error(`Error obteniendo respuestas para comentario ${commentId}:`, error);
      throw error;
    }
  }
}

export default new CommentService();