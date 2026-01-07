// src/audio/engine/AudioEngine.js

/**
 * AudioEngine - Responsable exclusivo de:
 * 1. Reproducción de audio HTML5
 * 2. Manejo de eventos del navegador
 * 3. Control de volumen y progreso
 * 4. NO hace fetch, solo reproduce URLs dadas
 */
export class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'none';
    this.audio.crossOrigin = 'anonymous'; // Importante para CORS
    
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
    
    this._setupEventListeners();
    
    console.log('[AudioEngine] Inicializado');
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

    this.audio.addEventListener('error', (e) => {
      console.error('[AudioEngine] Error:', {
        error: this.audio.error,
        code: this.audio.error?.code,
        message: this.audio.error?.message,
        nativeEvent: e
      });
      this.onError?.(this.audio.error?.message || 'Error desconocido');
    });

    // Progreso y metadatos
    this.audio.addEventListener('timeupdate', () => {
      this.onProgress?.(this.audio.currentTime, this.audio.duration);
    });

    this.audio.addEventListener('durationchange', () => {
      console.log(`[AudioEngine] Duración: ${this.formatTime(this.audio.duration)}`);
      this.onDurationChange?.(this.audio.duration);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      console.log('[AudioEngine] Metadata cargada');
    });

    this.audio.addEventListener('loadstart', () => {
      console.log('[AudioEngine] Carga iniciada');
      this.onLoadStart?.();
    });

    this.audio.addEventListener('canplay', () => {
      console.log('[AudioEngine] Audio listo para reproducir');
      this.onCanPlay?.();
    });

    this.audio.addEventListener('waiting', () => {
      console.log('[AudioEngine] Esperando datos...');
      this.onWaiting?.();
    });

    this.audio.addEventListener('playing', () => {
      console.log('[AudioEngine] Reproduciendo...');
      this.onPlaying?.();
    });

    // Eventos de volumen
    this.audio.addEventListener('volumechange', () => {
      console.log(`[AudioEngine] Volumen: ${this.audio.volume}`);
    });
  }

  /**
   * Cargar audio desde una URL (blob:// o https://)
   * @param {string} url - URL del audio a reproducir
   * @param {boolean} autoplay - Si debe comenzar automáticamente
   */
  async load(url, autoplay = false) {
    if (!url) {
      throw new Error('URL no proporcionada');
    }

    console.log(`[AudioEngine] load: ${url.substring(0, 50)}...`);

    // Pausar audio actual si está reproduciendo
    if (!this.audio.paused) {
      this.audio.pause();
    }

    // Limpiar fuente anterior
    this.audio.src = '';
    
    // Asignar nueva fuente
    this.audio.src = url;
    
    // Cargar metadata (no descarga el audio completo)
    this.audio.load();

    // Si autoplay está habilitado, intentar reproducir
    if (autoplay) {
      try {
        await this.play();
      } catch (error) {
        console.warn('[AudioEngine] Autoplay falló:', error);
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
      console.error('[AudioEngine] Error en play():', error);
      
      // Manejo específico de errores de autoplay
      if (error.name === 'NotAllowedError') {
        throw new Error('El navegador bloqueó la reproducción automática. Haz clic para reproducir.');
      }
      
      throw error;
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
  toggle() {
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

    // Validar que no exceda la duración
    const safeSeconds = Math.min(seconds, this.audio.duration || seconds);
    
    console.log(`[AudioEngine] Seek: ${this.formatTime(this.audio.currentTime)} → ${this.formatTime(safeSeconds)}`);
    
    this.audio.currentTime = safeSeconds;
  }

  /**
   * Establecer volumen
   * @param {number} volume - 0.0 a 1.0
   */
  setVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (this.audio.volume !== clampedVolume) {
      console.log(`[AudioEngine] Volumen: ${this.audio.volume.toFixed(2)} → ${clampedVolume.toFixed(2)}`);
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
   * Obtener progreso actual
   */
  getProgress() {
    return {
      current: this.audio.currentTime,
      duration: this.audio.duration,
      progress: this.audio.duration ? (this.audio.currentTime / this.audio.duration) * 100 : 0
    };
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
   * Destruir instancia y liberar recursos
   */
  destroy() {
    console.log('[AudioEngine] Destruyendo...');
    
    // Pausar audio
    this.pause();
    
    // Limpiar source
    this.audio.src = '';
    
    // Remover event listeners (opcional, pero limpio)
    const audio = this.audio;
    const clone = audio.cloneNode();
    audio.parentNode?.replaceChild(clone, audio);
    
    // Limpiar callbacks
    this.onPlay = null;
    this.onPause = null;
    this.onEnd = null;
    this.onError = null;
    this.onProgress = null;
    this.onDurationChange = null;
    
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
    console.log('src:', this.audio.src?.substring(0, 100) || 'none');
    console.log('paused:', this.audio.paused);
    console.log('ended:', this.audio.ended);
    console.log('currentTime:', this.audio.currentTime);
    console.log('duration:', this.audio.duration);
    console.log('volume:', this.audio.volume);
    console.log('readyState:', this.audio.readyState);
    console.log('error:', this.audio.error);
    console.groupEnd();
  }
}

// Singleton export
export const audioEngine = new AudioEngine();