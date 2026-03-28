// src/components/hook/services/commentService.js
import api from '../../../components/hook/services/apia';

class CommentService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutos
    this.pendingRequests = new Map();
    // 🔥 NUEVO: Versión de caché para invalidación atómica
    this.cacheVersion = 1;
    this.cacheVersionKey = 'comment_cache_version';
    
    // Cargar versión guardada
    const savedVersion = localStorage.getItem(this.cacheVersionKey);
    if (savedVersion) {
      this.cacheVersion = parseInt(savedVersion, 10);
    }
  }

  /**
   * Obtener clave de caché con versión
   */
  _getCacheKey(songId, page, pageSize) {
    return `comments:v${this.cacheVersion}:${songId}:${page}:${pageSize}`;
  }

  /**
   * Obtener comentarios con paginación
   */
  async getComments(songId, params = {}) {
    const { page = 1, pageSize = 10, forceRefresh = false } = params;
    const cacheKey = this._getCacheKey(songId, page, pageSize);

    // Verificar caché
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    // Evitar requests duplicados
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
   */
  async createComment(songId, content) {
    this._validateContent(content);

    const response = await api.post(
      `/api2/songs/${songId}/comments/`,
      { content: content.trim() }
    );
    
    // 🔥 NUEVO: Incrementar versión de caché para invalidar todo
    this._incrementCacheVersion();
    
    return this._normalizeComment(response.data);
  }

  /**
   * Actualizar un comentario existente
   */
  async updateComment(commentId, content) {
    this._validateContent(content);

    const response = await api.patch(
      `/api2/songs/comments/${commentId}/`,
      { content: content.trim() }
    );
    
    // 🔥 NUEVO: Incrementar versión de caché
    this._incrementCacheVersion();
    
    return this._normalizeComment(response.data);
  }

  /**
   * Eliminar un comentario
   */
  async deleteComment(commentId) {
    await api.delete(`/api2/songs/comments/${commentId}/`);
    
    // 🔥 NUEVO: Incrementar versión de caché
    this._incrementCacheVersion();
    
    return true;
  }

  /**
   * 🔥 NUEVO: Incrementar versión de caché
   * Esto invalida toda la caché de comentarios atómicamente
   */
  _incrementCacheVersion() {
    this.cacheVersion++;
    // Guardar en localStorage para persistir entre recargas
    localStorage.setItem(this.cacheVersionKey, this.cacheVersion.toString());
    
    // Limpiar caché antigua
    this.cache.clear();
    this.pendingRequests.clear();
    
    console.log(`🔄 Cache version actualizada a v${this.cacheVersion}`);
  }

  /**
   * Invalidar caché de una canción específica
   */
  _invalidateSongCache(songId) {
    for (const key of this.cache.keys()) {
      if (key.includes(`:${songId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Normalizar un comentario individual
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
    this.pendingRequests.clear();
  }
  
  /**
   * 🔥 NUEVO: Resetear versión de caché (útil para debugging)
   */
  resetCacheVersion() {
    this.cacheVersion = 1;
    localStorage.setItem(this.cacheVersionKey, '1');
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('🔄 Cache version reset a v1');
  }
}

export default new CommentService();