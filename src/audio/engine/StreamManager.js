/**
 * StreamManager.js - PRODUCCIÓN (API DOMINIO EXPLÍCITO)
 *
 * 🎵 ARQUITECTURA PROFESIONAL PARA DJIDJIMUSIC
 * 
 * Frontend (https://djidjimusic.com) 
 *   → API explícita (https://api.djidjimusic.com/api2) 
 *   → Django valida 
 *   → Devuelve URL firmada de R2 (5 min)
 *   → Navegador reproduce directo desde Cloudflare
 *
 * BENEFICIOS:
 * - Workers Gunicorn SIEMPRE libres
 * - Sin Range requests, sin chunks
 * - Cache en Redis (30 min)
 * - CDN global (Cloudflare)
 * - Ideal para usuarios en África Central
 *
 * @version 3.0.0 - Producción
 */

class StreamManager {
  constructor() {
    // 🔐 DOMINIO EXPLÍCITO - PRODUCCIÓN
    // Frontend: https://djidjimusic.com
    // Backend:  https://api.djidjimusic.com
    this.API_BASE = "https://api.djidjimusic.com/api2";

    // Control de streams activos
    this.activeStreams = new Map();      // songId -> { audio, streamUrl, startedAt }
    this.abortControllers = new Map();   // songId -> AbortController

    // Métricas para monitoreo
    this.metrics = {
      streamsStarted: 0,
      streamsEnded: 0,
      errors: 0
    };

    console.log("[StreamManager] ✅ Inicializado (Producción)");
    console.log(`[StreamManager] 📡 API Base: ${this.API_BASE}`);
  }

  // =========================================================================
  // 🔐 OBTENER URL FIRMADA DEL BACKEND
  // =========================================================================

  /**
   * Obtiene URL firmada de R2 desde el backend
   * @param {string|number} songId - ID de la canción
   * @returns {Promise<string>} URL firmada (válida 5 min)
   * @throws {Error} Si hay error de autenticación o red
   */
  async getStreamUrl(songId) {
    // 1. Verificar token
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No autenticado - Token no encontrado");
    }

    // 2. Cancelar request anterior si existe
    if (this.abortControllers.has(songId)) {
      console.log(`[StreamManager] Cancelando request anterior para canción ${songId}`);
      this.abortControllers.get(songId).abort();
    }

    // 3. Crear nuevo controller para esta request
    const controller = new AbortController();
    this.abortControllers.set(songId, controller);

    try {
      // 4. Hacer fetch al backend
      const response = await fetch(
        `${this.API_BASE}/songs/${songId}/stream/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          },
          signal: controller.signal
        }
      );

      // 5. Limpiar controller
      this.abortControllers.delete(songId);

      // 6. Manejar errores HTTP
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (_) {}

        const errorMessage = errorData?.message || `Error HTTP ${response.status}`;
        
        // Logs específicos por código de error
        switch (response.status) {
          case 401:
            console.error("[StreamManager] 🔒 Sesión expirada");
            break;
          case 403:
            console.error("[StreamManager] ⛔ Sin permisos");
            break;
          case 404:
            console.error("[StreamManager] ❌ Canción no encontrada");
            break;
          case 429:
            console.error("[StreamManager] ⏳ Límite de streams excedido");
            break;
          default:
            console.error(`[StreamManager] Error ${response.status}:`, errorMessage);
        }

        throw new Error(errorMessage);
      }

      // 7. Parsear respuesta JSON
      const data = await response.json();

      // 8. Validar estructura de la respuesta
      if (!data?.data?.stream_url) {
        console.error("[StreamManager] Respuesta inválida:", data);
        throw new Error("Respuesta inválida del servidor");
      }

      // 9. Logging exitoso
      console.log(`[StreamManager] ✅ URL obtenida para canción ${songId}`, {
        expiresIn: data.data.expires_in,
        cacheStatus: data.meta?.cache || 'unknown',
        fileSize: data.data.file_size || 'desconocido'
      });

      return data.data.stream_url;

    } catch (error) {
      // Manejar abortos (no son errores reales)
      if (error.name === 'AbortError') {
        console.log(`[StreamManager] Request cancelada para canción ${songId}`);
        return null;
      }

      // Registrar otros errores
      this.metrics.errors++;
      console.error(`[StreamManager] Error obteniendo URL para ${songId}:`, error.message);
      throw error;
    }
  }

  // =========================================================================
  // ▶️ REPRODUCIR CANCIÓN
  // =========================================================================

  /**
   * Reproduce una canción usando URL firmada
   * @param {string|number} songId - ID de la canción
   * @param {HTMLAudioElement} [audioElement] - Elemento audio existente (opcional)
   * @returns {Promise<HTMLAudioElement>} Elemento audio reproduciendo
   */
  async playSong(songId, audioElement = null) {
    // 1. Limpiar cualquier stream activo
    this.stopAll();

    try {
      // 2. Obtener URL firmada
      const streamUrl = await this.getStreamUrl(songId);
      
      // Si la request fue cancelada, salir
      if (!streamUrl) return null;

      // 3. Usar elemento existente o crear nuevo
      const audio = audioElement || new Audio();
      
      // 4. Configurar audio element
      audio.preload = "metadata";
      audio.crossOrigin = "anonymous"; // Importante para CORS con R2/Cloudflare

      // 5. Configurar eventos
      audio.onplay = () => {
        console.log(`[StreamManager] ▶️ Reproduciendo: ${songId}`);
      };

      audio.onpause = () => {
        console.log(`[StreamManager] ⏸️ Pausado: ${songId}`);
      };

      audio.onended = () => {
        console.log(`[StreamManager] ⏹️ Finalizado: ${songId}`);
        this.metrics.streamsEnded++;
        this.activeStreams.delete(songId);
      };

      audio.onerror = (e) => {
        console.error(`[StreamManager] ❌ Error en audio ${songId}:`, {
          error: audio.error?.message || 'desconocido',
          networkState: audio.networkState,
          readyState: audio.readyState
        });
        this.metrics.errors++;
      };

      audio.onloadedmetadata = () => {
        console.log(`[StreamManager] 📊 Duración: ${this._formatTime(audio.duration)}`);
      };

      // 6. Asignar fuente y cargar
      audio.src = streamUrl;
      audio.load();

      // 7. Intentar reproducir
      try {
        await audio.play();
      } catch (playError) {
        // El navegador puede bloquear autoplay (políticas de navegadores)
        console.warn("[StreamManager] ⚠️ Autoplay bloqueado:", playError.message);
        // No lanzamos error, el usuario puede iniciar manualmente
      }

      // 8. Guardar referencia del stream activo
      this.activeStreams.set(songId, {
        audio,
        streamUrl,
        startedAt: Date.now()
      });

      // 9. Actualizar métricas
      this.metrics.streamsStarted++;

      return audio;

    } catch (error) {
      this.metrics.errors++;
      console.error(`[StreamManager] Error reproduciendo canción ${songId}:`, error);
      throw error;
    }
  }

  // =========================================================================
  // ⏸️ CONTROL DE REPRODUCCIÓN
  // =========================================================================

  /**
   * Pausa reproducción
   * @param {string|number} songId - ID de la canción
   */
  pauseSong(songId) {
    const stream = this.activeStreams.get(songId);
    if (stream?.audio && !stream.audio.paused) {
      stream.audio.pause();
      console.log(`[StreamManager] ⏸️ Pausado manual: ${songId}`);
    }
  }

  /**
   * Reanuda reproducción
   * @param {string|number} songId - ID de la canción
   */
  resumeSong(songId) {
    const stream = this.activeStreams.get(songId);
    if (stream?.audio && stream.audio.paused) {
      stream.audio.play().catch(console.error);
      console.log(`[StreamManager] ▶️ Reanudado: ${songId}`);
    }
  }

  /**
   * Detiene y limpia un stream específico
   * @param {string|number} songId - ID de la canción
   */
  stopStream(songId) {
    const stream = this.activeStreams.get(songId);

    if (stream?.audio) {
      // Limpiar eventos
      stream.audio.onplay = null;
      stream.audio.onpause = null;
      stream.audio.onended = null;
      stream.audio.onerror = null;
      
      // Detener y limpiar
      stream.audio.pause();
      stream.audio.src = "";
      stream.audio.load(); // Liberar recursos

      this.activeStreams.delete(songId);
      this.metrics.streamsEnded++;
      
      console.log(`[StreamManager] 🧹 Stream limpiado: ${songId}`);
    }

    // Cancelar request pendiente si existe
    if (this.abortControllers.has(songId)) {
      this.abortControllers.get(songId).abort();
      this.abortControllers.delete(songId);
    }
  }

  /**
   * Detiene TODOS los streams activos
   */
  stopAll() {
    const ids = Array.from(this.activeStreams.keys());
    console.log(`[StreamManager] Deteniendo ${ids.length} streams activos`);
    ids.forEach((id) => this.stopStream(id));
  }

  // =========================================================================
  // 🎚 CONTROLES DE AUDIO
  // =========================================================================

  /**
   * Adelanta a posición específica
   * @param {string|number} songId - ID de la canción
   * @param {number} seconds - Posición en segundos
   */
  seek(songId, seconds) {
    const stream = this.activeStreams.get(songId);
    if (stream?.audio && !isNaN(stream.audio.duration)) {
      const newTime = Math.max(0, Math.min(seconds, stream.audio.duration));
      stream.audio.currentTime = newTime;
      console.log(`[StreamManager] ⏩ Seek ${songId}: ${this._formatTime(newTime)}`);
    }
  }

  /**
   * Cambia volumen
   * @param {string|number} songId - ID de la canción
   * @param {number} volume - Volumen (0.0 a 1.0)
   */
  setVolume(songId, volume) {
    const stream = this.activeStreams.get(songId);
    if (stream?.audio) {
      const validVolume = Math.max(0, Math.min(1, volume));
      stream.audio.volume = validVolume;
      console.log(`[StreamManager] 🔊 Volumen ${songId}: ${Math.round(validVolume * 100)}%`);
    }
  }

  /**
   * Verifica si una canción está reproduciéndose
   * @param {string|number} songId - ID de la canción
   * @returns {boolean}
   */
  isPlaying(songId) {
    const stream = this.activeStreams.get(songId);
    return stream?.audio ? !stream.audio.paused : false;
  }

  /**
   * Obtiene tiempo actual
   * @param {string|number} songId - ID de la canción
   * @returns {number}
   */
  getCurrentTime(songId) {
    return this.activeStreams.get(songId)?.audio?.currentTime || 0;
  }

  /**
   * Obtiene duración total
   * @param {string|number} songId - ID de la canción
   * @returns {number}
   */
  getDuration(songId) {
    return this.activeStreams.get(songId)?.audio?.duration || 0;
  }

  // =========================================================================
  // 📊 MÉTRICAS Y UTILIDADES
  // =========================================================================

  /**
   * Obtiene estadísticas de uso
   * @returns {Object} Métricas detalladas
   */
  getMetrics() {
    const activeList = [];
    for (const [songId, stream] of this.activeStreams.entries()) {
      activeList.push({
        songId,
        currentTime: stream.audio?.currentTime || 0,
        duration: stream.audio?.duration || 0,
        playing: !stream.audio?.paused,
        startedAt: new Date(stream.startedAt).toISOString()
      });
    }

    return {
      ...this.metrics,
      activeStreams: this.activeStreams.size,
      activeStreamsList: activeList,
      timestamp: Date.now(),
      apiBase: this.API_BASE
    };
  }

  /**
   * Limpia todos los recursos (útil al cerrar sesión)
   */
  cleanup() {
    console.log("[StreamManager] 🧹 Limpiando todos los recursos");
    this.stopAll();
    this.metrics = {
      streamsStarted: 0,
      streamsEnded: 0,
      errors: 0
    };
  }

  /**
   * Debug info completo
   */
  debug() {
    console.group('[StreamManager] 🔍 DEBUG INFO');
    console.log('API Base:', this.API_BASE);
    console.log('Métricas:', this.metrics);
    console.log('Streams activos:', this.activeStreams.size);
    
    for (const [songId, stream] of this.activeStreams.entries()) {
      console.log(`  📍 ${songId}:`, {
        currentTime: this._formatTime(stream.audio?.currentTime || 0),
        duration: this._formatTime(stream.audio?.duration || 0),
        paused: stream.audio?.paused,
        volume: Math.round((stream.audio?.volume || 0) * 100) + '%',
        url: stream.streamUrl?.substring(0, 60) + '...'
      });
    }
    console.groupEnd();
  }

  // =========================================================================
  // 🆘 MÉTODOS DE COMPATIBILIDAD (para migración gradual)
  // =========================================================================

  /**
   * @deprecated Usar playSong() en su lugar
   */
  async getAudio(songId) {
    console.warn('[StreamManager] ⚠️ getAudio() está deprecado. Usa playSong()');
    return this.getStreamUrl(songId);
  }

  /**
   * @deprecated Usar playSong() en su lugar
   */
  async getFullAudio(songId) {
    console.warn('[StreamManager] ⚠️ getFullAudio() está deprecado. Usa playSong()');
    return this.getStreamUrl(songId);
  }

  /**
   * @deprecated El backend ahora maneja el cache
   */
  clearCache() {
    console.warn('[StreamManager] ⚠️ clearCache() ya no es necesario');
  }

  // =========================================================================
  // 🆘 PRIVADOS
  // =========================================================================

  /**
   * Formatea tiempo para logs
   * @private
   */
  _formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// =========================================================================
// 📦 EXPORTAR SINGLETON
// =========================================================================

// Crear única instancia
const streamManager = new StreamManager();

// Exportar como default y nombrado (para compatibilidad)
export default streamManager;
export { streamManager };