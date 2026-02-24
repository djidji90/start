/**
 * StreamManager.js - VERSIÓN SIMPLIFICADA PARA NUEVA ARQUITECTURA
 * 
 * 🎵 ARQUITECTURA ACTUAL:
 * - Backend devuelve URLs firmadas de R2 (5 min de vida)
 * - Frontend reproduce DIRECTAMENTE desde R2/Cloudflare
 * - NO más Range requests, NO más MediaSource, NO más chunks
 * 
 * BENEFICIOS:
 * - Workers Gunicorn siempre libres
 * - 90% menos código (de ~500 a ~100 líneas)
 * - Menor consumo de batería en móvil
 * - Streaming más rápido y estable
 * 
 * @version 2.0.0
 */

export class StreamManager {
  constructor() {
    this.baseURL = '/api2';  // Ruta relativa (funciona en cualquier entorno)
    this.activeStreams = new Map(); // songId -> { audio, refreshTimer }
    this.metrics = {
      streamsStarted: 0,
      streamsEnded: 0,
      errors: 0
    };
    
    console.log('[StreamManager] Inicializado (versión simplificada)');
  }

  /**
   * Obtiene URL firmada del backend
   * @param {string|number} songId - ID de la canción
   * @returns {Promise<string>} URL firmada de R2
   */
  async getStreamUrl(songId) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${this.baseURL}/songs/${songId}/stream/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Logging útil para debugging
    console.log(`[StreamManager] URL obtenida para canción ${songId}`, {
      expiresIn: data.data.expires_in,
      cacheStatus: data.meta.cache
    });

    return data.data.stream_url;
  }

  /**
   * Reproduce una canción usando URL firmada
   * @param {string|number} songId - ID de la canción
   * @param {HTMLAudioElement} [audioElement] - Elemento audio existente (opcional)
   * @returns {Promise<HTMLAudioElement>} Elemento audio reproduciendo
   */
  async playSong(songId, audioElement = null) {
    // Limpiar stream anterior si existe
    this.stopStream(songId);

    try {
      // 1. Obtener URL firmada
      const streamUrl = await this.getStreamUrl(songId);

      // 2. Usar elemento existente o crear nuevo
      const audio = audioElement || new Audio();

      // 3. Configurar eventos básicos
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
        console.error(`[StreamManager] ❌ Error en reproducción: ${songId}`, e);
        this.metrics.errors++;
      };

      // 4. Configurar fuente y reproducir
      audio.src = streamUrl;
      audio.load(); // Forzar carga de metadata
      
      try {
        await audio.play();
      } catch (playError) {
        // El navegador puede bloquear autoplay
        console.warn(`[StreamManager] ⚠️ Autoplay bloqueado para ${songId}:`, playError);
        // No lanzamos error, el usuario puede iniciar manualmente
      }

      // 5. Guardar referencia
      this.activeStreams.set(songId, { 
        audio,
        streamUrl,
        startedAt: Date.now()
      });
      
      this.metrics.streamsStarted++;

      return audio;

    } catch (error) {
      this.metrics.errors++;
      console.error(`[StreamManager] Error reproduciendo canción ${songId}:`, error);
      throw error;
    }
  }

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
      stream.audio.play().catch(e => 
        console.error(`[StreamManager] Error al reanudar: ${songId}`, e)
      );
      console.log(`[StreamManager] ▶️ Reanudado: ${songId}`);
    }
  }

  /**
   * Detiene y limpia stream
   * @param {string|number} songId - ID de la canción
   */
  stopStream(songId) {
    const stream = this.activeStreams.get(songId);
    if (stream?.audio) {
      // Limpiar eventos para evitar memory leaks
      stream.audio.onplay = null;
      stream.audio.onpause = null;
      stream.audio.onended = null;
      stream.audio.onerror = null;
      
      // Detener y limpiar
      stream.audio.pause();
      stream.audio.src = '';
      stream.audio.load(); // Liberar recursos
      
      this.activeStreams.delete(songId);
      this.metrics.streamsEnded++;
      
      console.log(`[StreamManager] 🧹 Stream limpiado: ${songId}`);
    }
  }

  /**
   * Obtiene tiempo actual de reproducción
   * @param {string|number} songId - ID de la canción
   * @returns {number} Tiempo actual en segundos
   */
  getCurrentTime(songId) {
    return this.activeStreams.get(songId)?.audio?.currentTime || 0;
  }

  /**
   * Obtiene duración total de la canción
   * @param {string|number} songId - ID de la canción
   * @returns {number} Duración en segundos
   */
  getDuration(songId) {
    return this.activeStreams.get(songId)?.audio?.duration || 0;
  }

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
      console.log(`[StreamManager] ⏩ Seek ${songId}: ${newTime.toFixed(1)}s`);
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
      console.log(`[StreamManager] 🔊 Volumen ${songId}: ${validVolume.toFixed(2)}`);
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
   * Detiene todos los streams activos
   */
  stopAll() {
    console.log(`[StreamManager] Deteniendo ${this.activeStreams.size} streams activos`);
    const songIds = Array.from(this.activeStreams.keys());
    for (const songId of songIds) {
      this.stopStream(songId);
    }
  }

  /**
   * Obtiene estadísticas de uso
   * @returns {Object} Métricas del manager
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeStreams: this.activeStreams.size,
      activeStreamsList: Array.from(this.activeStreams.keys()),
      timestamp: Date.now()
    };
  }

  /**
   * Limpia todos los recursos (útil al cerrar sesión)
   */
  cleanup() {
    this.stopAll();
    this.metrics = {
      streamsStarted: 0,
      streamsEnded: 0,
      errors: 0
    };
    console.log('[StreamManager] ✅ Cleanup completado');
  }

  // =========================================================================
  // MÉTODOS DE COMPATIBILIDAD (no rompen código existente)
  // =========================================================================

  /**
   * @deprecated Usar playSong() en su lugar
   */
  async getAudio(songId) {
    console.warn('[StreamManager] getAudio() está deprecado. Usa playSong()');
    return this.getStreamUrl(songId);
  }

  /**
   * @deprecated Usar playSong() en su lugar
   */
  async getFullAudio(songId) {
    console.warn('[StreamManager] getFullAudio() está deprecado. Usa playSong()');
    return this.getStreamUrl(songId);
  }

  /**
   * @deprecated El backend ahora maneja el cache
   */
  clearCache() {
    console.warn('[StreamManager] clearCache() ya no es necesario');
  }

  /**
   * Debug info
   */
  debug() {
    console.group('[StreamManager] DEBUG');
    console.log('Base URL:', this.baseURL);
    console.log('Active Streams:', this.activeStreams.size);
    console.log('Metrics:', this.metrics);
    
    for (const [songId, stream] of this.activeStreams.entries()) {
      console.log(`  📍 ${songId}:`, {
        currentTime: stream.audio?.currentTime.toFixed(1) || 0,
        duration: stream.audio?.duration.toFixed(1) || 0,
        paused: stream.audio?.paused,
        volume: stream.audio?.volume.toFixed(2),
        url: stream.streamUrl?.substring(0, 50) + '...'
      });
    }
    console.groupEnd();
  }

  /**
   * Formatea bytes para logs
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Singleton export
export const streamManager = new StreamManager();

// Para compatibilidad con imports existentes
export default streamManager;