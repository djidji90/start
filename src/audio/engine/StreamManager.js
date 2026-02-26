/**
 * StreamManager.js - VERSIÓN CORREGIDA
 * 
 * Problemas solucionados:
 * ✅ Pausar/Reanudar funciona correctamente
 * ✅ No permite múltiples streams simultáneos
 * ✅ Manejo correcto de stopStream
 * ✅ Limpieza de recursos mejorada
 */

class StreamManager {
  constructor() {
    this.API_BASE = "https://api.djidjimusic.com/api2";
    this.activeStreams = new Map();      // songId -> { audio, streamUrl, startedAt }
    this.currentlyPlaying = null;        // <-- NUEVO: Solo una canción a la vez
    this.abortControllers = new Map();
    
    this.metrics = {
      streamsStarted: 0,
      streamsEnded: 0,
      errors: 0
    };

    this._setupAuthListeners();
    console.log("[StreamManager] ✅ Inicializado (Producción)");
    console.log(`[StreamManager] 📡 API Base: ${this.API_BASE}`);
  }

  _setupAuthListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', () => {
        console.log('[StreamManager] Evento auth:logout recibido - limpiando streams');
        this.cleanup();
      });

      window.addEventListener('auth:expired', () => {
        console.log('[StreamManager] Evento auth:expired recibido');
        this.cleanup();
      });
    }
  }

  _getAuthToken() {
    return localStorage.getItem("accessToken") ||
           localStorage.getItem("access_token") ||
           localStorage.getItem("token") ||
           localStorage.getItem("auth_token") ||
           localStorage.getItem("jwt_token") ||
           localStorage.getItem("django_token");
  }

  async getStreamUrl(songId) {
    const token = this._getAuthToken();

    if (!token) {
      console.error('[StreamManager] No hay token en localStorage');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
      throw new Error("No autenticado - Token no encontrado");
    }

    if (!songId) {
      throw new Error("ID de canción inválido");
    }

    // Cancelar request anterior si existe
    if (this.abortControllers.has(songId)) {
      this.abortControllers.get(songId).abort();
      this.abortControllers.delete(songId);
    }

    const controller = new AbortController();
    this.abortControllers.set(songId, controller);

    const startTime = Date.now();

    try {
      const response = await fetch(
        `${this.API_BASE}/songs/${songId}/stream/`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          signal: controller.signal
        }
      );

      this.abortControllers.delete(songId);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        let errorMessage = `Error HTTP ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch (_) {}

        switch (response.status) {
          case 401:
            console.error("[StreamManager] 🔒 Sesión expirada o token inválido");
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:expired'));
            }
            break;
          case 403:
            console.error("[StreamManager] ⛔ Sin permisos para esta canción");
            break;
          case 404:
            console.error("[StreamManager] ❌ Canción no encontrada");
            break;
          case 429:
            console.error("[StreamManager] ⏳ Límite de streams excedido");
            break;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data?.data?.stream_url) {
        throw new Error("Respuesta inválida del servidor");
      }

      console.log(`[StreamManager] ✅ URL obtenida para canción ${songId}`, {
        expiresIn: data.data.expires_in,
        cacheStatus: data.meta?.cache || 'unknown',
        fileSize: data.data.file_size || 'desconocido',
        responseTime: `${responseTime}ms`
      });

      return data.data.stream_url;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`[StreamManager] Request cancelada para canción ${songId}`);
        return null;
      }
      this.metrics.errors++;
      throw error;
    }
  }

  // Detiene una canción específica
  stopStream(songId) {
    console.log(`[StreamManager] Deteniendo stream: ${songId}`);
    
    const stream = this.activeStreams.get(songId);

    if (stream?.audio) {
      // Limpiar todos los event listeners
      stream.audio.onplay = null;
      stream.audio.onpause = null;
      stream.audio.onended = null;
      stream.audio.onerror = null;
      stream.audio.onstalled = null;
      stream.audio.onwaiting = null;
      stream.audio.onloadedmetadata = null;

      // Detener reproducción
      stream.audio.pause();
      stream.audio.src = "";
      stream.audio.load(); // Liberar recursos

      this.activeStreams.delete(songId);
      this.metrics.streamsEnded++;
    }

    // Cancelar request pendiente si existe
    if (this.abortControllers.has(songId)) {
      this.abortControllers.get(songId).abort();
      this.abortControllers.delete(songId);
    }

    // Si era la canción actualmente reproduciendo, limpiar referencia
    if (this.currentlyPlaying === songId) {
      this.currentlyPlaying = null;
    }

    console.log(`[StreamManager] ✅ Stream limpiado: ${songId}`);
  }

  // Detiene TODAS las canciones
  stopAll() {
    console.log(`[StreamManager] Deteniendo ${this.activeStreams.size} streams activos`);
    const ids = Array.from(this.activeStreams.keys());
    ids.forEach((id) => this.stopStream(id));
    this.currentlyPlaying = null;
  }

  async playSong(songId, audioElement = null) {
    // 🔥 IMPORTANTE: Detener cualquier otra canción que esté sonando
    if (this.currentlyPlaying && this.currentlyPlaying !== songId) {
      console.log(`[StreamManager] Deteniendo canción anterior: ${this.currentlyPlaying}`);
      this.stopStream(this.currentlyPlaying);
    }

    // Si es la misma canción y está pausada, reanudar
    if (this.currentlyPlaying === songId) {
      const stream = this.activeStreams.get(songId);
      if (stream?.audio && stream.audio.paused) {
        await stream.audio.play();
        this.currentlyPlaying = songId;
        console.log(`[StreamManager] ▶️ Reanudando: ${songId}`);
        return stream.audio;
      }
    }

    // Limpiar stream anterior de esta canción si existe
    this.stopStream(songId);

    try {
      const streamUrl = await this.getStreamUrl(songId);
      if (!streamUrl) return null;

      // Usar elemento existente o crear nuevo
      const audio = audioElement || new Audio();
      
      audio.preload = "metadata";
      audio.crossOrigin = "anonymous";

      // Configurar event listeners
      audio.onplay = () => {
        console.log(`[StreamManager] ▶️ Reproduciendo: ${songId}`);
        this.currentlyPlaying = songId;
      };

      audio.onpause = () => {
        console.log(`[StreamManager] ⏸️ Pausado: ${songId}`);
        // No limpiar currentlyPlaying cuando se pausa
      };

      audio.onended = () => {
        console.log(`[StreamManager] ⏹️ Finalizado: ${songId}`);
        this.activeStreams.delete(songId);
        if (this.currentlyPlaying === songId) {
          this.currentlyPlaying = null;
        }
        this.metrics.streamsEnded++;
      };

      audio.onerror = (e) => {
        const errorInfo = {
          error: audio.error?.message || 'desconocido',
          code: audio.error?.code
        };
        console.error(`[StreamManager] ❌ Error en audio ${songId}:`, errorInfo);
        this.metrics.errors++;
        
        // Limpiar en caso de error
        if (this.currentlyPlaying === songId) {
          this.currentlyPlaying = null;
        }
        this.activeStreams.delete(songId);
      };

      audio.onloadedmetadata = () => {
        console.log(`[StreamManager] 📊 Duración: ${this._formatTime(audio.duration)}`);
      };

      audio.onstalled = () => {
        console.warn(`[StreamManager] ⚠️ Stalled - Red lenta? ${songId}`);
      };

      audio.onwaiting = () => {
        console.warn(`[StreamManager] ⏳ Esperando buffer: ${songId}`);
      };

      // Asignar fuente y cargar
      audio.src = streamUrl;
      audio.load();

      // Intentar reproducir
      try {
        await audio.play();
        this.currentlyPlaying = songId;
      } catch (playError) {
        console.warn("[StreamManager] ⚠️ Autoplay bloqueado:", playError.message);
        // Aún así guardamos el audio para que el usuario pueda reproducir manualmente
      }

      // Guardar referencia
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

  pauseSong(songId) {
    console.log(`[StreamManager] Pausando: ${songId}`);
    const stream = this.activeStreams.get(songId);
    if (stream?.audio && !stream.audio.paused) {
      stream.audio.pause();
      // No cambiamos currentlyPlaying, solo pausamos
    }
  }

  resumeSong(songId) {
    console.log(`[StreamManager] Reanudando: ${songId}`);
    const stream = this.activeStreams.get(songId);
    if (stream?.audio && stream.audio.paused) {
      stream.audio.play()
        .then(() => {
          this.currentlyPlaying = songId;
        })
        .catch(console.error);
    }
  }

  togglePlayPause(songId) {
    if (this.isPlaying(songId)) {
      this.pauseSong(songId);
    } else {
      this.resumeSong(songId);
    }
  }

  isPlaying(songId) {
    const stream = this.activeStreams.get(songId);
    return stream?.audio ? !stream.audio.paused : false;
  }

  getCurrentSong() {
    return this.currentlyPlaying;
  }

  seek(songId, seconds) {
    const stream = this.activeStreams.get(songId);
    if (stream?.audio && !isNaN(stream.audio.duration)) {
      const newTime = Math.max(0, Math.min(seconds, stream.audio.duration));
      stream.audio.currentTime = newTime;
      console.log(`[StreamManager] ⏩ Seek ${songId}: ${this._formatTime(newTime)}`);
    }
  }

  setVolume(songId, volume) {
    const stream = this.activeStreams.get(songId);
    if (stream?.audio) {
      stream.audio.volume = Math.max(0, Math.min(1, volume));
      console.log(`[StreamManager] 🔊 Volumen ${songId}: ${Math.round(volume * 100)}%`);
    }
  }

  getCurrentTime(songId) {
    return this.activeStreams.get(songId)?.audio?.currentTime || 0;
  }

  getDuration(songId) {
    return this.activeStreams.get(songId)?.audio?.duration || 0;
  }

  // Limpia todo (útil para logout)
  cleanup() {
    console.log("[StreamManager] 🧹 Limpiando todos los recursos");
    this.stopAll();
    this.metrics = {
      streamsStarted: 0,
      streamsEnded: 0,
      errors: 0
    };
  }

  // Obtener estadísticas
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
      currentlyPlaying: this.currentlyPlaying,
      activeStreamsList: activeList,
      timestamp: Date.now(),
      apiBase: this.API_BASE
    };
  }

  // Formatear tiempo para logs
  _formatTime(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Debug info
  debug() {
    console.group('[StreamManager] 🔍 DEBUG INFO');
    console.log('API Base:', this.API_BASE);
    console.log('Currently Playing:', this.currentlyPlaying);
    console.log('Métricas:', this.metrics);
    console.log('Streams activos:', this.activeStreams.size);
    
    for (const [songId, stream] of this.activeStreams.entries()) {
      console.log(`  📍 ${songId}:`, {
        currentTime: this._formatTime(stream.audio?.currentTime || 0),
        duration: this._formatTime(stream.audio?.duration || 0),
        paused: stream.audio?.paused,
        playing: !stream.audio?.paused,
        volume: Math.round((stream.audio?.volume || 0) * 100) + '%',
        url: stream.streamUrl?.substring(0, 60) + '...'
      });
    }
    console.groupEnd();
  }
}

// Exportar singleton
const streamManager = new StreamManager();
export default streamManager;
export { streamManager };