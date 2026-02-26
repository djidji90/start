// src/audio/engine/AudioEngine.js - VERSIÓN OPTIMIZADA v2.0.0

/**
 * AudioEngine v2.0.0 - Responsable exclusivo de:
 * 1. Reproducción de audio HTML5
 * 2. Manejo de eventos del navegador
 * 3. Control de volumen y progreso
 * 4. Integración con StreamManager
 * 5. NO hace fetch, solo reproduce URLs dadas
 */
export class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata'; // Cambiado a 'metadata' para mejor performance
    this.audio.crossOrigin = 'anonymous';
    
    // Callbacks para notificar al contexto
    this.onPlay = null;
    this.onPause = null;
    this.onEnd = null;
    this.onError = null;
    this.onProgress = null;
    this.onDurationChange = null;
    this.onLoadStart = null;
    this.onCanPlay = null;
    this.onWaiting = null;
    this.onPlaying = null;
    this.onSeeking = null;
    this.onSeeked = null;
    this.onStalled = null;
    this.onSuspend = null;
    
    // Estado interno
    this._lastUrl = null;
    this._loadStartTime = null;
    this._errorCount = 0;
    this._maxRetries = 3;
    
    this._setupEventListeners();
    
    console.log('[AudioEngine] v2.0.0 Inicializado');
  }

  /**
   * Configurar todos los event listeners del audio element
   */
  _setupEventListeners() {
    // Eventos básicos de reproducción
    this.audio.addEventListener('play', () => {
      console.log('[AudioEngine] Evento: play');
      this.onPlay?.();
    });

    this.audio.addEventListener('pause', () => {
      console.log('[AudioEngine] Evento: pause');
      this.onPause?.();
    });

    this.audio.addEventListener('ended', () => {
      console.log('[AudioEngine] Evento: ended');
      this.onEnd?.();
    });

    // 🆕 Manejo de errores mejorado
    this.audio.addEventListener('error', (e) => {
      const error = this.audio.error;
      this._errorCount++;
      
      console.error('[AudioEngine] Error:', {
        code: error?.code,
        message: error?.message,
        networkState: this.audio.networkState,
        readyState: this.audio.readyState,
        src: this._lastUrl?.substring(0, 50)
      });

      // Mapear códigos de error a mensajes legibles
      let errorMessage = 'Error desconocido';
      switch (error?.code) {
        case 1:
          errorMessage = 'La carga del audio fue abortada';
          break;
        case 2:
          errorMessage = 'Error de red durante la carga';
          break;
        case 3:
          errorMessage = 'Error al decodificar el audio';
          break;
        case 4:
          errorMessage = 'Formato de audio no soportado';
          break;
      }
      
      this.onError?.(errorMessage, { code: error?.code, retry: this._errorCount < this._maxRetries });
    });

    // Progreso y metadatos
    this.audio.addEventListener('timeupdate', () => {
      this.onProgress?.(this.audio.currentTime, this.audio.duration);
    });

    this.audio.addEventListener('durationchange', () => {
      console.log(`[AudioEngine] Duración: ${this.formatTime(this.audio.duration)}`);
      this.onDurationChange?.(this.audio.duration);
    });

    // 🆕 Eventos de carga mejorados
    this.audio.addEventListener('loadstart', () => {
      this._loadStartTime = Date.now();
      console.log('[AudioEngine] Carga iniciada');
      this.onLoadStart?.();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      console.log('[AudioEngine] Metadata cargada');
    });

    this.audio.addEventListener('loadeddata', () => {
      const loadTime = this._loadStartTime ? Date.now() - this._loadStartTime : 0;
      console.log(`[AudioEngine] Datos cargados en ${loadTime}ms`);
    });

    this.audio.addEventListener('canplay', () => {
      console.log('[AudioEngine] Audio listo para reproducir');
      this.onCanPlay?.();
    });

    this.audio.addEventListener('canplaythrough', () => {
      console.log('[AudioEngine] Audio puede reproducirse sin interrupciones');
    });

    // Eventos de buffer y espera
    this.audio.addEventListener('waiting', () => {
      console.log('[AudioEngine] Esperando datos...');
      this.onWaiting?.();
    });

    this.audio.addEventListener('playing', () => {
      console.log('[AudioEngine] Reproduciendo...');
      this.onPlaying?.();
    });

    this.audio.addEventListener('stalled', () => {
      console.warn('[AudioEngine] Carga estancada');
      this.onStalled?.();
    });

    this.audio.addEventListener('suspend', () => {
      console.log('[AudioEngine] Carga suspendida');
      this.onSuspend?.();
    });

    // Eventos de búsqueda
    this.audio.addEventListener('seeking', () => {
      console.log(`[AudioEngine] Buscando a: ${this.formatTime(this.audio.currentTime)}`);
      this.onSeeking?.();
    });

    this.audio.addEventListener('seeked', () => {
      console.log(`[AudioEngine] Búsqueda completada`);
      this.onSeeked?.();
    });

    // Eventos de volumen
    this.audio.addEventListener('volumechange', () => {
      console.log(`[AudioEngine] Volumen: ${Math.round(this.audio.volume * 100)}%`);
    });

    // 🆕 Evento de tasa de bits (cuando está disponible)
    if ('audioTracks' in this.audio) {
      this.audio.audioTracks?.addEventListener('change', () => {
        console.log('[AudioEngine] Pista de audio cambiada');
      });
    }
  }

  /**
   * Cargar audio desde una URL (blob://, https:// o data:)
   * @param {string} url - URL del audio a reproducir
   * @param {boolean} autoplay - Si debe comenzar automáticamente
   */
  async load(url, autoplay = false) {
    if (!url) {
      throw new Error('URL no proporcionada');
    }

    console.log(`[AudioEngine] load: ${url.substring(0, 50)}...`);

    // Resetear contador de errores para nueva URL
    this._errorCount = 0;
    this._lastUrl = url;

    // Pausar audio actual si está reproduciendo
    if (!this.audio.paused) {
      this.audio.pause();
    }

    // Limpiar fuente anterior (importante para liberar memoria)
    const wasBlob = this.audio.src?.startsWith('blob:');
    if (wasBlob) {
      URL.revokeObjectURL(this.audio.src);
    }
    
    this.audio.removeAttribute('src');
    this.audio.load();

    // Asignar nueva fuente
    this.audio.src = url;
    
    // Cargar metadata
    this.audio.load();

    // Si autoplay está habilitado, intentar reproducir
    if (autoplay) {
      try {
        await this.play();
      } catch (error) {
        console.warn('[AudioEngine] Autoplay falló:', error.message);
        // No lanzamos error, el usuario puede iniciar manualmente
      }
    }

    return true;
  }

  /**
   * Iniciar reproducción
   */
  async play() {
    if (!this.audio.src) {
      throw new Error('No hay audio cargado para reproducir');
    }

    try {
      console.log('[AudioEngine] Intentando play()...');
      await this.audio.play();
      console.log('[AudioEngine] Play exitoso');
      return true;
    } catch (error) {
      console.error('[AudioEngine] Error en play():', error.name, error.message);
      
      // Mapeo de errores comunes
      const errorMap = {
        'NotAllowedError': 'El navegador bloqueó la reproducción automática. Haz clic para reproducir.',
        'NotSupportedError': 'El formato de audio no es compatible con este navegador.',
        'AbortError': 'La reproducción fue abortada.',
        'NetworkError': 'Error de red al cargar el audio.'
      };

      throw new Error(errorMap[error.name] || error.message);
    }
  }

  /**
   * Pausar reproducción
   */
  pause() {
    if (!this.audio.paused) {
      console.log('[AudioEngine] Pausando...');
      this.audio.pause();
    }
    return true;
  }

  /**
   * Alternar entre play/pause
   */
  async toggle() {
    if (this.audio.paused) {
      return this.play();
    } else {
      this.pause();
      return Promise.resolve();
    }
  }

  /**
   * Buscar a posición específica
   * @param {number} seconds - Segundos a donde buscar
   */
  seek(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      console.warn('[AudioEngine] seek: valor inválido', seconds);
      return;
    }

    const safeSeconds = Math.min(seconds, this.audio.duration || seconds);
    
    console.log(`[AudioEngine] Seek: ${this.formatTime(this.audio.currentTime)} → ${this.formatTime(safeSeconds)}`);
    
    this.audio.currentTime = safeSeconds;
  }

  /**
   * Establecer velocidad de reproducción
   * @param {number} rate - 0.5 a 2.0
   */
  setPlaybackRate(rate) {
    const clampedRate = Math.max(0.5, Math.min(2.0, rate));
    this.audio.playbackRate = clampedRate;
    console.log(`[AudioEngine] Velocidad: ${clampedRate}x`);
  }

  /**
   * Obtener velocidad actual
   */
  getPlaybackRate() {
    return this.audio.playbackRate;
  }

  /**
   * Establecer volumen
   * @param {number} volume - 0.0 a 1.0
   */
  setVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (this.audio.volume !== clampedVolume) {
      console.log(`[AudioEngine] Volumen: ${Math.round(this.audio.volume * 100)}% → ${Math.round(clampedVolume * 100)}%`);
      this.audio.volume = clampedVolume;
    }
    
    return clampedVolume;
  }

  /**
   * Obtener volumen actual
   */
  getVolume() {
    return this.audio.volume;
  }

  /**
   * Silenciar/activar sonido
   */
  setMuted(muted) {
    this.audio.muted = muted;
    console.log(`[AudioEngine] ${muted ? '🔇 Silenciado' : '🔊 Sonido activado'}`);
  }

  /**
   * Verificar si está silenciado
   */
  isMuted() {
    return this.audio.muted;
  }

  /**
   * Obtener progreso actual
   */
  getProgress() {
    return {
      current: this.audio.currentTime,
      duration: this.audio.duration || 0,
      progress: this.audio.duration ? (this.audio.currentTime / this.audio.duration) * 100 : 0,
      buffered: this._getBufferedProgress()
    };
  }

  /**
   * Obtener progreso de buffer
   * @private
   */
  _getBufferedProgress() {
    if (!this.audio.duration || this.audio.buffered.length === 0) {
      return 0;
    }
    
    const bufferedEnd = this.audio.buffered.end(this.audio.buffered.length - 1);
    return (bufferedEnd / this.audio.duration) * 100;
  }

  /**
   * Verificar si está reproduciendo
   */
  isPlaying() {
    return !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0;
  }

  /**
   * Verificar si está cargando
   */
  isLoading() {
    return this.audio.readyState < 3; // HAVE_FUTURE_DATA
  }

  /**
   * Verificar si puede reintentar después de un error
   */
  canRetry() {
    return this._errorCount < this._maxRetries;
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  getPerformanceStats() {
    return {
      errorCount: this._errorCount,
      readyState: this.audio.readyState,
      networkState: this.audio.networkState,
      buffered: this._getBufferedProgress(),
      playbackRate: this.audio.playbackRate,
      volume: this.audio.volume,
      muted: this.audio.muted,
      src: this._lastUrl?.substring(0, 50)
    };
  }

  /**
   * Destruir instancia y liberar recursos
   */
  destroy() {
    console.log('[AudioEngine] Destruyendo...');
    
    // Pausar audio
    this.pause();
    
    // Limpiar source (importante para liberar blob URLs)
    const wasBlob = this.audio.src?.startsWith('blob:');
    if (wasBlob) {
      URL.revokeObjectURL(this.audio.src);
    }
    
    this.audio.removeAttribute('src');
    this.audio.load();
    
    // Limpiar callbacks
    const events = [
      'onPlay', 'onPause', 'onEnd', 'onError', 'onProgress',
      'onDurationChange', 'onLoadStart', 'onCanPlay', 'onWaiting',
      'onPlaying', 'onSeeking', 'onSeeked', 'onStalled', 'onSuspend'
    ];
    events.forEach(event => this[event] = null);
    
    console.log('[AudioEngine] Destruido');
  }

  /**
   * Formatear tiempo para logs
   */
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Métodos de debug
   */
  debug() {
    console.group('[AudioEngine] Debug Info');
    console.log('Versión:', '2.0.0');
    console.log('src:', this._lastUrl?.substring(0, 100) || 'none');
    console.log('paused:', this.audio.paused);
    console.log('ended:', this.audio.ended);
    console.log('currentTime:', this.formatTime(this.audio.currentTime));
    console.log('duration:', this.formatTime(this.audio.duration));
    console.log('volume:', `${Math.round(this.audio.volume * 100)}%`);
    console.log('muted:', this.audio.muted);
    console.log('playbackRate:', `${this.audio.playbackRate}x`);
    console.log('readyState:', this.audio.readyState);
    console.log('networkState:', this.audio.networkState);
    console.log('buffered:', `${Math.round(this._getBufferedProgress())}%`);
    console.log('errorCount:', this._errorCount);
    console.log('canRetry:', this.canRetry());
    console.groupEnd();
  }
}

// Singleton export
export const audioEngine = new AudioEngine();