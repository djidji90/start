// src/components/hook/services/commentService.js
import api from '../../../components/hook/services/apia';

/**
 * Servicio de comentarios
 * Utiliza el mismo cliente API que funciona para download y like
 */
class CommentService {
  constructor() {
    // Caché para optimizar lecturas
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutos
    this.pendingRequests = new Map(); // Para evitar requests duplicados
  }

  /**
   * Obtener comentarios con paginación
   * @param {string|number} songId - ID de la canción
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise} - Datos paginados de comentarios
   */
  async getComments(songId, params = {}) {
    const { page = 1, pageSize = 10, forceRefresh = false } = params;
    const cacheKey = `comments:${songId}:${page}:${pageSize}`;

    // Verificar caché
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    // Evitar requests duplicados en vuelo
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const request = (async () => {
      try {
        const response = await api.get(`/api2/songs/${songId}/comments/`, {
          params: { page, page_size: pageSize }
        });

        const normalizedData = this._normalizeResponse(response.data);
        
        this.cache.set(cacheKey, {
          data: normalizedData,
          timestamp: Date.now()
        });

        return normalizedData;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, request);
    return request;
  }

  /**
   * Crear un nuevo comentario
   * @param {string|number} songId - ID de la canción
   * @param {string} content - Contenido del comentario
   * @returns {Promise} - Comentario creado
   */
  async createComment(songId, content) {
    this._validateContent(content);

    const response = await api.post(
      `/api2/songs/${songId}/comments/`,
      { content: content.trim() }
    );
    
    // Invalidar caché de esta canción
    this._invalidateSongCache(songId);
    
    return this._normalizeComment(response.data);
  }

  /**
   * Actualizar un comentario existente
   * @param {string|number} commentId - ID del comentario
   * @param {string} content - Nuevo contenido
   * @returns {Promise} - Comentario actualizado
   */
  async updateComment(commentId, content) {
    this._validateContent(content);

    const response = await api.patch(
      `/api2/songs/comments/${commentId}/`,
      { content: content.trim() }
    );
    
    // Limpiar toda la caché porque no sabemos a qué canción pertenece
    this.cache.clear();
    
    return this._normalizeComment(response.data);
  }

  /**
   * Eliminar un comentario
   * @param {string|number} commentId - ID del comentario
   * @returns {Promise} - true si se eliminó correctamente
   */
  async deleteComment(commentId) {
    await api.delete(`/api2/songs/comments/${commentId}/`);
    
    // Limpiar toda la caché
    this.cache.clear();
    
    return true;
  }

  /**
   * Obtener un comentario específico
   * @param {string|number} commentId - ID del comentario
   * @returns {Promise} - Comentario
   */
  async getComment(commentId) {
    const response = await api.get(`/api2/songs/comments/${commentId}/`);
    return this._normalizeComment(response.data);
  }

  /**
   * Invalidar caché de una canción específica
   * @private
   */
  _invalidateSongCache(songId) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`comments:${songId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Normalizar un comentario individual
   * @private
   */
  _normalizeComment(comment) {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      isEdited: comment.is_edited || false,
      user: {
        id: comment.user?.id,
        username: comment.user?.username || 'Usuario',
        email: comment.user?.email,
        avatar: comment.user?.avatar || null,
      },
      songId: comment.song,
    };
  }

  /**
   * Normalizar respuesta de lista
   * @private
   */
  _normalizeResponse(data) {
    return {
      count: data.count || 0,
      totalPages: data.total_pages || Math.ceil((data.count || 0) / 10),
      currentPage: data.current_page || 1,
      next: data.next,
      previous: data.previous,
      results: (data.results || []).map(c => this._normalizeComment(c)),
    };
  }

  /**
   * Validar contenido del comentario
   * @private
   */
  _validateContent(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('El comentario no puede estar vacío');
    }
    
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new Error('El comentario no puede estar vacío');
    }
    
    if (trimmed.length > 1000) {
      throw new Error('El comentario no puede exceder los 1000 caracteres');
    }
  }

  /**
   * Limpiar toda la caché
   */
  clearCache() {
    this.cache.clear();
  }
}

// Exportar una única instancia (Singleton)
export default new CommentService();