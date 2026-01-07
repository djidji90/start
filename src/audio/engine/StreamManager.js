// src/audio/engine/StreamManager.js - VERSIÓN COMPLETA Y DEFINITIVA

export class StreamManager {
  constructor() {
    this.blobCache = new Map(); // songId -> { url: string, timestamp: number }
    this.baseURL = 'https://api.djidjimusic.com/api2';
    this.retryAttempts = 2;
    this.requestQueue = new Map(); // Para manejar rate limiting
    this.activeRequests = new Map(); // songId -> AbortController
    this.cleanupInterval = null;
    
    // Iniciar limpieza automática
    this.startAutoCleanup();
  }

  /**
   * Método PRINCIPAL - Obtiene audio de forma robusta
   */
  async getAudio(songId) {
    // Validaciones
    const validatedId = this.validateSongId(songId);
    if (!validatedId) {
      throw new Error(`ID de canción inválido: ${songId}`);
    }

    // Cancelar request anterior para esta canción
    this.cancelRequest(validatedId);

    // Verificar cache
    const cached = this.getFromCache(validatedId);
    if (cached) {
      console.log(`[StreamManager] Cache hit para canción ${validatedId}`);
      return cached;
    }

    // Crear controller para cancelación
    const controller = new AbortController();
    this.activeRequests.set(validatedId, controller);

    try {
      // Obtener token fresco
      const token = await this.getFreshToken();
      
      // Intentar con retries
      for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
        try {
          console.log(`[StreamManager] Intento ${attempt + 1} para canción ${validatedId}`);
          
          // USAR ENDPOINT DE DOWNLOAD (que SÍ funciona)
          const audioUrl = await this.fetchDownload(validatedId, token, attempt, controller.signal);
          
          if (audioUrl) {
            // Cachear resultado
            this.cacheResult(validatedId, audioUrl);
            return audioUrl;
          }
          
        } catch (error) {
          console.warn(`[StreamManager] Intento ${attempt + 1} falló:`, error.message);
          
          // Si fue cancelado, salir
          if (error.name === 'AbortError') {
            console.log(`[StreamManager] Request cancelado para ${validatedId}`);
            return null;
          }
          
          // Si es error de rate limiting, esperar
          if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            const waitTime = (attempt + 1) * 2000; // Backoff exponencial
            console.log(`[StreamManager] Rate limited, esperando ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // Si es error de token, intentar refrescar
          if (error.message.includes('401') || error.message.includes('token')) {
            console.log('[StreamManager] Token inválido, intentando refrescar...');
            try {
              await this.attemptTokenRefresh();
              continue;
            } catch (refreshError) {
              // Si no se puede refrescar, propagar error
              if (attempt === this.retryAttempts) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
              }
              continue;
            }
          }
          
          // Otros errores, propagar después de últimos intentos
          if (attempt === this.retryAttempts) {
            throw error;
          }
        }
      }
      
      throw new Error(`No se pudo obtener audio para canción ${validatedId} después de ${this.retryAttempts + 1} intentos`);
      
    } finally {
      this.activeRequests.delete(validatedId);
    }
  }

  /**
   * Fetch desde endpoint de download con señal de cancelación
   */
  async fetchDownload(songId, token, attempt = 0, signal = null) {
    const url = `${this.baseURL}/songs/${songId}/stream/`;
    
    console.log(`[StreamManager] Fetching: ${url} (attempt ${attempt})`);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      // Sin Accept header para evitar problemas
    };

    const fetchOptions = {
      headers,
      signal,
    };

    const response = await fetch(url, fetchOptions);

    console.log(`[StreamManager] Response: ${response.status} ${response.statusText}`);

    // Manejar errores HTTP
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        // Ignorar si no podemos leer el cuerpo
      }
      
      const errorMessage = `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText.substring(0, 100)}` : ''}`;
      
      if (response.status === 429) {
        throw new Error(`Rate limited (429). Intento: ${attempt}`);
      }
      if (response.status === 401) {
        throw new Error('Token inválido o expirado (401)');
      }
      if (response.status === 404) {
        throw new Error(`Canción ${songId} no encontrada (404)`);
      }
      if (response.status === 406) {
        throw new Error(`Endpoint no acepta el formato solicitado (406)`);
      }
      
      throw new Error(errorMessage);
    }

    // Verificar que sea audio
    const contentType = response.headers.get('content-type') || '';
    const isAudio = this.isAudioContent(contentType);
    
    if (!isAudio) {
      console.warn(`[StreamManager] Content-Type inesperado: ${contentType}. Continuando...`);
    }

    // Verificar tamaño
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      throw new Error('Archivo vacío recibido (0 bytes)');
    }

    // Crear blob
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Blob vacío recibido (0 bytes)');
    }

    console.log(`[StreamManager] Audio recibido: ${this.formatBytes(blob.size)} (${blob.type})`);
    
    // Crear URL para el blob
    return URL.createObjectURL(blob);
  }

  /**
   * Validar ID de canción
   */
  validateSongId(songId) {
    if (!songId) return null;
    
    const id = parseInt(songId);
    if (isNaN(id) || id <= 0) return null;
    
    return id;
  }

  /**
   * Verificar si el content-type es audio
   */
  isAudioContent(contentType) {
    if (!contentType) return false;
    
    const audioTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/ogg',
      'audio/wav',
      'audio/webm',
      'audio/x-m4a',
      'audio/x-aac',
      'audio/x-wav',
      'application/octet-stream', // Algunos servidores usan este para binarios
    ];
    
    return audioTypes.some(type => contentType.includes(type));
  }

  /**
   * Obtener token fresco (con validación)
   */
  async getFreshToken() {
    let token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor inicia sesión.');
    }

    // Verificar si el token es válido
    const isValid = await this.validateToken(token);
    
    if (!isValid) {
      console.log('[StreamManager] Token inválido, intentando refrescar...');
      token = await this.attemptTokenRefresh();
    }
    
    return token;
  }

  /**
   * Validar token con el servidor
   */
  async validateToken(token) {
    try {
      // Usar un endpoint ligero para validar
      const response = await fetch(`${this.baseURL}/songs/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        method: 'GET',
      });
      
      return response.ok;
    } catch (error) {
      console.warn('[StreamManager] Error validando token:', error.message);
      return false;
    }
  }

  /**
   * Intentar refrescar token
   */
  async attemptTokenRefresh() {
    try {
      // Intentar usar refresh token si existe
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        console.log('[StreamManager] Intentando refresh token...');
        
        const response = await fetch('https://api.djidjimusic.com/musica/api/token/refresh/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.access);
          console.log('[StreamManager] Token refrescado exitosamente');
          return data.access;
        }
      }
      
      // Si no hay refresh token o falla, limpiar y pedir login
      console.log('[StreamManager] No se pudo refrescar token, limpiando...');
      this.clearAuthTokens();
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      
    } catch (error) {
      console.error('[StreamManager] Error refrescando token:', error);
      this.clearAuthTokens();
      throw error;
    }
  }

  /**
   * Limpiar tokens de autenticación
   */
  clearAuthTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('[StreamManager] Tokens de autenticación limpiados');
  }

  /**
   * Manejo de cache
   */
  getFromCache(songId) {
    const cached = this.blobCache.get(songId);
    
    if (!cached) return null;
    
    // Verificar si el cache ha expirado
    const now = Date.now();
    if (now - cached.timestamp > 10 * 60 * 1000) { // 10 minutos
      this.removeFromCache(songId);
      return null;
    }
    
    return cached.url;
  }

  cacheResult(songId, blobUrl) {
    this.blobCache.set(songId, {
      url: blobUrl,
      timestamp: Date.now()
    });
    
    console.log(`[StreamManager] Cacheado canción ${songId}`);
  }

  removeFromCache(songId) {
    const cached = this.blobCache.get(songId);
    
    if (cached) {
      try {
        URL.revokeObjectURL(cached.url);
        console.log(`[StreamManager] Blob URL revocada de cache: ${songId}`);
      } catch (e) {
        console.warn(`[StreamManager] Error revocando URL de cache ${songId}:`, e);
      }
    }
    
    this.blobCache.delete(songId);
  }

  /**
   * Limpieza automática de cache expirado
   */
  startAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCache();
    }, 60 * 1000); // Cada minuto
  }

  cleanupExpiredCache() {
    const now = Date.now();
    const expired = [];
    
    for (const [songId, cached] of this.blobCache.entries()) {
      if (now - cached.timestamp > 10 * 60 * 1000) { // 10 minutos
        expired.push(songId);
      }
    }
    
    if (expired.length > 0) {
      console.log(`[StreamManager] Limpiando ${expired.length} items expirados del cache`);
      expired.forEach(songId => this.removeFromCache(songId));
    }
  }

  /**
   * Cancelar request activo
   */
  cancelRequest(songId) {
    if (this.activeRequests.has(songId)) {
      const controller = this.activeRequests.get(songId);
      controller.abort();
      this.activeRequests.delete(songId);
      console.log(`[StreamManager] Request cancelado: ${songId}`);
    }
  }

  /**
   * Pre-cargar canción para mejor UX
   */
  async prefetch(songId) {
    if (!songId) return null;
    
    try {
      // Verificar si ya está en cache
      const cached = this.getFromCache(songId);
      if (cached) {
        console.log(`[StreamManager] Prefetch: ya en cache ${songId}`);
        return cached;
      }
      
      // Obtener stream normalmente
      const blobUrl = await this.getAudio(songId);
      
      if (blobUrl) {
        console.log(`[StreamManager] Prefetch completado: ${songId}`);
      }
      
      return blobUrl;
      
    } catch (error) {
      console.warn(`[StreamManager] Prefetch falló para ${songId}:`, error.message);
      return null;
    }
  }

  /**
   * Verificar si una canción está cacheada
   */
  isCached(songId) {
    return this.getFromCache(songId) !== null;
  }

  /**
   * Obtener información del cache
   */
  getCacheInfo() {
    return {
      size: this.blobCache.size,
      items: Array.from(this.blobCache.keys()),
    };
  }

  /**
   * Utilidades
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Limpiar todos los recursos
   */
  cleanup() {
    console.log('[StreamManager] Iniciando cleanup completo...');
    
    // Cancelar todos los requests activos
    for (const [songId, controller] of this.activeRequests.entries()) {
      controller.abort();
      console.log(`[StreamManager] Request cancelado en cleanup: ${songId}`);
    }
    this.activeRequests.clear();
    
    // Limpiar cache completo
    this.clearCache();
    
    // Detener intervalo de limpieza
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    console.log('[StreamManager] Cleanup completado');
  }

  /**
   * Limpiar todo el cache
   */
  clearCache() {
    console.log(`[StreamManager] Limpiando cache completo (${this.blobCache.size} items)`);
    
    for (const [songId, cached] of this.blobCache.entries()) {
      try {
        URL.revokeObjectURL(cached.url);
      } catch (e) {
        // Ignorar errores al revocar
      }
    }
    
    this.blobCache.clear();
  }

  /**
   * Método de prueba rápido
   */
  async quickTest(songId = 1) {
    try {
      console.log('🧪 Probando StreamManager...');
      const audioUrl = await this.getAudio(songId);
      console.log('✅ Éxito! URL obtenida:', audioUrl.substring(0, 50) + '...');
      
      // Probar reproducción
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve) => {
        audio.oncanplay = () => {
          console.log('🎵 Audio listo para reproducir! Duración:', audio.duration);
          resolve({ success: true, url: audioUrl, audio });
        };
        
        audio.onerror = (e) => {
          console.error('❌ Error de audio:', audio.error);
          resolve({ success: false, error: audio.error?.message });
        };
        
        audio.load();
      });
      
    } catch (error) {
      console.error('❌ Error en prueba:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Depuración: información del estado actual
   */
  debug() {
    console.group('[StreamManager] Debug Info');
    console.log('Base URL:', this.baseURL);
    console.log('Active Requests:', this.activeRequests.size);
    console.log('Cache Size:', this.blobCache.size);
    console.log('Cache Items:', Array.from(this.blobCache.keys()));
    console.log('Cleanup Interval:', this.cleanupInterval ? 'Activo' : 'Inactivo');
    console.groupEnd();
  }
}

// Singleton export
export const streamManager = new StreamManager();