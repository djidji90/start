// src/components/PlayerContext.jsx - VERSIÓN EXACTA CON STREAM MANAGER
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { audioEngine } from "../audio/engine/AudioEngine";
import { streamManager } from "../audio/engine/StreamManager";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [volume, setVolume] = useState(audioEngine?.getVolume?.() || 0.7);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastValidUrl, setLastValidUrl] = useState(null);
  
  // Refs para prevenir memory leaks
  const isMountedRef = useRef(true);
  const cleanupPerformedRef = useRef(false);
  const audioEngineAvailableRef = useRef(!!audioEngine);

  // Inicializamos callbacks de AudioEngine solo si existe
  useEffect(() => {
    isMountedRef.current = true;
    cleanupPerformedRef.current = false;

    // Verificar disponibilidad de audioEngine
    if (!audioEngineAvailableRef.current) {
      console.warn('[PlayerContext] audioEngine no está disponible');
      if (isMountedRef.current) {
        setError('Reproductor de audio no disponible en este momento');
      }
      return;
    }

    try {
      // Configurar callbacks solo si las funciones existen
      if (typeof audioEngine.onPlay === 'function') {
        audioEngine.onPlay = () => {
          if (isMountedRef.current) setIsPlaying(true);
        };
      }

      if (typeof audioEngine.onPause === 'function') {
        audioEngine.onPause = () => {
          if (isMountedRef.current) setIsPlaying(false);
        };
      }

      if (typeof audioEngine.onEnd === 'function') {
        audioEngine.onEnd = () => {
          if (isMountedRef.current) setIsPlaying(false);
        };
      }

      if (typeof audioEngine.onProgress === 'function') {
        audioEngine.onProgress = (current, duration) => {
          if (isMountedRef.current) setProgress({ current, duration });
        };
      }

      if (typeof audioEngine.onError === 'function') {
        audioEngine.onError = (msg) => {
          console.error("[PlayerContext] Audio error:", msg);
          if (isMountedRef.current) {
            setError(msg || 'Error desconocido en el reproductor');
            setIsLoading(false);
          }
        };
      }

      // Cargar volumen inicial si está disponible
      if (typeof audioEngine.getVolume === 'function') {
        const initialVolume = audioEngine.getVolume();
        if (isMountedRef.current && initialVolume !== null && initialVolume !== undefined) {
          setVolume(initialVolume);
        }
      }

    } catch (err) {
      console.error('[PlayerContext] Error configurando audioEngine:', err);
      if (isMountedRef.current) {
        setError('Error configurando el reproductor de audio');
      }
    }

    // Cleanup cuando el componente se desmonta
    return () => {
      isMountedRef.current = false;
      performCleanup();
    };
  }, []);

  // Función de cleanup seguro
  const performCleanup = () => {
    if (!cleanupPerformedRef.current) {
      console.log("[PlayerContext] Realizando cleanup...");
      cleanupPerformedRef.current = true;
      
      try {
        if (audioEngineAvailableRef.current) {
          if (typeof audioEngine.destroy === 'function') {
            audioEngine.destroy();
          } else if (typeof audioEngine.pause === 'function') {
            audioEngine.pause();
          }
        }
      } catch (err) {
        console.error("[PlayerContext] Error en cleanup:", err);
      }
    }
  };

  /**
   * Validar URL de audio de forma segura
   */
  const validateAudioUrl = (url) => {
    if (!url || typeof url !== 'string') {
      console.error("[PlayerContext] URL de audio no proporcionada o inválida");
      return false;
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl === '') {
      console.error("[PlayerContext] URL de audio vacía");
      return false;
    }

    // Validar formato de URL básico
    const isValidUrl = trimmedUrl.startsWith('http://') || 
                      trimmedUrl.startsWith('https://') || 
                      trimmedUrl.startsWith('blob:') ||
                      trimmedUrl.startsWith('data:') ||
                      trimmedUrl.startsWith('/');
    
    if (!isValidUrl) {
      console.error("[PlayerContext] URL con formato inválido:", trimmedUrl.substring(0, 50));
      return false;
    }

    // Guardar última URL válida para referencia
    setLastValidUrl(trimmedUrl);
    return true;
  };

  /**
   * Obtener URL segura para reproducción USANDO STREAM MANAGER
   */
  const getSecureAudioUrl = async (songId) => {
    console.log(`[PlayerContext] Obteniendo URL para canción: ${songId}`);
    
    if (!songId) {
      throw new Error("ID de canción no proporcionado");
    }

    try {
      // Verificar disponibilidad de streamManager
      if (!streamManager || typeof streamManager.getAudio !== 'function') {
        console.warn('[PlayerContext] streamManager no disponible, usando fallback');
        
        // Fallback: usar URL de prueba o estructura mock
        // Esto evita el error "Empty src attribute"
        const fallbackUrl = `https://api.djidjimusic.com/api2/stream/${songId}/`;
        console.log(`[PlayerContext] Usando URL fallback: ${fallbackUrl.substring(0, 50)}...`);
        return fallbackUrl;
      }

      // USAR EL STREAM MANAGER - MÉTODO PRINCIPAL getAudio
      console.log(`[PlayerContext] Solicitando audio a StreamManager para: ${songId}`);
      const audioUrl = await streamManager.getAudio(songId);
      
      if (!audioUrl) {
        console.warn('[PlayerContext] StreamManager devolvió URL vacía');
        throw new Error("No se pudo obtener URL de audio");
      }

      // Validar que sea una URL válida
      if (!validateAudioUrl(audioUrl)) {
        throw new Error("URL de audio inválida obtenida del StreamManager");
      }

      console.log(`[PlayerContext] URL obtenida exitosamente: ${audioUrl.substring(0, 50)}...`);
      return audioUrl;

    } catch (err) {
      console.error('[PlayerContext] Error obteniendo URL de audio:', {
        songId,
        error: err.message,
        stack: err.stack
      });
      
      // Mensajes de error más amigables
      let userMessage = err.message;
      
      if (err.message.includes('406')) {
        userMessage = 'Error del servidor (406). El formato de audio no es compatible.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        userMessage = 'No tienes permisos para acceder a esta canción. Verifica tu sesión.';
      } else if (err.message.includes('fetch') || err.message.includes('network')) {
        userMessage = 'Error de conexión. Verifica tu internet.';
      } else if (err.message.includes('CORS')) {
        userMessage = 'Error de seguridad del navegador. Intenta recargar la página.';
      } else if (err.message.includes('No se pudo obtener')) {
        userMessage = 'Esta canción no está disponible para reproducción en este momento.';
      }
      
      throw new Error(userMessage);
    }
  };

  /**
   * Reproducir canción de forma segura USANDO STREAM MANAGER
   */
  const playSong = async (song) => {
    if (!song || !song.id) {
      console.warn("[PlayerContext] No se proporcionó canción válida");
      setError("Canción no válida");
      return;
    }

    // Validar que audioEngine esté disponible
    if (!audioEngineAvailableRef.current) {
      console.warn("[PlayerContext] audioEngine no disponible para reproducir");
      setError("Reproductor no disponible. Recarga la página.");
      return;
    }

    // Si ya está reproduciendo la misma canción, solo toggle
    if (currentSong?.id === song.id && isPlaying) {
      togglePlay();
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      // Obtener URL segura usando StreamManager
      const audioUrl = await getSecureAudioUrl(song.id);
      
      if (!validateAudioUrl(audioUrl)) {
        throw new Error("URL de audio inválida obtenida");
      }

      // Actualizar estado antes de cargar
      setCurrentSong(song);
      
      // Cargar audio - NO auto-play para evitar bloqueos del navegador
      console.log(`[PlayerContext] Cargando audio: ${audioUrl.substring(0, 50)}...`);
      await audioEngine.load(audioUrl, false); // false = no auto-play
      
      // Reproducir manualmente después de cargar
      // Esto respeta las políticas de auto-play del navegador
      if (typeof audioEngine.play === 'function') {
        audioEngine.play().catch(playError => {
          console.warn('[PlayerContext] Auto-play bloqueado por el navegador:', playError);
          // El usuario necesitará interactuar manualmente
          if (isMountedRef.current) {
            setError('Haz clic en el botón de reproducir para iniciar la canción');
          }
        });
      }
      
      if (isMountedRef.current) {
        setIsLoading(false);
      }

    } catch (err) {
      console.error("[PlayerContext] Error reproduciendo canción:", err);
      
      // Mensajes de error amigables
      let userMessage = err.message;
      
      if (err.message.includes('Sesión expirada') || err.message.includes('token')) {
        userMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
        // Limpiar tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else if (err.message.includes('429')) {
        userMessage = 'Demasiadas solicitudes. Por favor espera un momento.';
      } else if (err.message.includes('404')) {
        userMessage = 'Esta canción no está disponible en este momento.';
      } else if (err.message.includes('Empty src') || err.message.includes('MEDIA_ELEMENT_ERROR')) {
        userMessage = 'Error en la fuente de audio. La canción no puede reproducirse.';
      }
      
      if (isMountedRef.current) {
        setError(userMessage);
        setIsLoading(false);
        setCurrentSong(null);
      }
    }
  };

  // Funciones wrapper con validación de disponibilidad
  const pause = () => {
    if (audioEngineAvailableRef.current && typeof audioEngine.pause === 'function') {
      audioEngine.pause();
    }
  };

  const togglePlay = () => {
    if (audioEngineAvailableRef.current && typeof audioEngine.toggle === 'function') {
      audioEngine.toggle();
    } else if (audioEngineAvailableRef.current) {
      // Fallback manual
      if (isPlaying) {
        if (typeof audioEngine.pause === 'function') audioEngine.pause();
      } else {
        if (typeof audioEngine.play === 'function') audioEngine.play();
      }
    }
  };

  const seek = (seconds) => {
    if (audioEngineAvailableRef.current && 
        typeof audioEngine.seek === 'function' && 
        typeof seconds === 'number' && 
        seconds >= 0) {
      audioEngine.seek(seconds);
    }
  };

  const changeVolume = (value) => {
    // Validar volumen (0-1)
    const validVolume = Math.max(0, Math.min(1, value));
    
    if (audioEngineAvailableRef.current && typeof audioEngine.setVolume === 'function') {
      const newVolume = audioEngine.setVolume(validVolume);
      if (isMountedRef.current && newVolume !== null && newVolume !== undefined) {
        setVolume(newVolume);
      }
    } else {
      // Fallback: solo actualizar estado local
      if (isMountedRef.current) {
        setVolume(validVolume);
      }
    }
  };

  // Limpiar error después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setError(null);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Context value
  const contextValue = {
    // Estado
    currentSong,
    isPlaying,
    progress,
    volume,
    error,
    isLoading,
    lastValidUrl,
    
    // Acciones
    playSong,
    pause,
    togglePlay,
    seek,
    changeVolume,
    clearError: () => setError(null),
    
    // Información del sistema
    audioEngineAvailable: audioEngineAvailableRef.current,
    streamManagerAvailable: !!streamManager && typeof streamManager.getAudio === 'function'
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

// Hook de acceso rápido con fallback seguro
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  
  if (!context) {
    console.warn('usePlayer debe ser usado dentro de PlayerProvider. Usando mock.');
    
    // Devolver objeto mock para evitar errores en componentes
    return {
      currentSong: null,
      isPlaying: false,
      progress: { current: 0, duration: 0 },
      volume: 0.7,
      error: null,
      isLoading: false,
      lastValidUrl: null,
      audioEngineAvailable: false,
      streamManagerAvailable: false,
      
      playSong: (song) => {
        console.warn('Player no disponible. Canción:', song?.title);
      },
      pause: () => console.warn('Player no disponible - pause'),
      togglePlay: () => console.warn('Player no disponible - togglePlay'),
      seek: (seconds) => console.warn(`Player no disponible - seek: ${seconds}`),
      changeVolume: (value) => console.warn(`Player no disponible - volume: ${value}`),
      clearError: () => {}
    };
  }
  
  return context;
};

export default PlayerContext;