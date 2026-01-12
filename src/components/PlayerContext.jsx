// src/components/PlayerContext.jsx - VERSIÓN CORREGIDA PARA PAUSA
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { audioEngine } from "../audio/engine/AudioEngine";
import { streamManager } from "../audio/engine/StreamManager";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState(null);
  const [lastValidUrl, setLastValidUrl] = useState(null);
  
  // 🔥 NUEVO: Estado de carga por canción específica
  const [songLoadingStates, setSongLoadingStates] = useState({});
  
  // 🔥 REF para acceso directo al elemento de audio
  const audioElementRef = useRef(null);
  
  // 🔥 Función para actualizar estado de carga de una canción
  const updateSongLoadingState = (songId, loadingState) => {
    setSongLoadingStates(prev => ({
      ...prev,
      [songId]: {
        ...prev[songId],
        ...loadingState,
        lastUpdated: Date.now()
      }
    }));
  };
  
  // 🔥 Función para obtener estado de carga de una canción
  const getSongLoadingState = (songId) => {
    const state = songLoadingStates[songId];
    if (!state) {
      return {
        isLoading: false,
        progress: 0,
        stage: 'none',
        message: '',
        lastUpdated: 0
      };
    }
    
    // Limpiar estados muy viejos (más de 10 segundos)
    if (Date.now() - state.lastUpdated > 10000 && !state.isLoading) {
      return {
        isLoading: false,
        progress: 0,
        stage: 'none',
        message: '',
        lastUpdated: 0
      };
    }
    
    return state;
  };
  
  // 🔥 Función para verificar si una canción está cargando
  const isSongLoading = (songId) => {
    return getSongLoadingState(songId).isLoading;
  };
  
  // 🔥 Función para obtener progreso de carga de una canción
  const getSongLoadingProgress = (songId) => {
    return getSongLoadingState(songId).progress;
  };

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
          console.log('[PlayerContext] AudioEngine onPlay callback');
          if (isMountedRef.current) {
            setIsPlaying(true);
            // 🔥 Actualizar estado cuando empieza a reproducir
            if (currentSong) {
              updateSongLoadingState(currentSong.id, {
                isLoading: false,
                progress: 100,
                stage: 'playing',
                message: 'Reproduciendo'
              });
            }
          }
        };
      }

      if (typeof audioEngine.onPause === 'function') {
        audioEngine.onPause = () => {
          console.log('[PlayerContext] AudioEngine onPause callback');
          if (isMountedRef.current) {
            setIsPlaying(false);
            // 🔥 Actualizar estado cuando se pausa
            if (currentSong) {
              updateSongLoadingState(currentSong.id, {
                isLoading: false,
                progress: 100,
                stage: 'paused',
                message: 'Pausado'
              });
            }
          }
        };
      }

      if (typeof audioEngine.onEnd === 'function') {
        audioEngine.onEnd = () => {
          console.log('[PlayerContext] AudioEngine onEnd callback');
          if (isMountedRef.current) {
            setIsPlaying(false);
            if (currentSong) {
              updateSongLoadingState(currentSong.id, {
                isLoading: false,
                progress: 100,
                stage: 'ended',
                message: 'Finalizado'
              });
            }
          }
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
            if (currentSong) {
              updateSongLoadingState(currentSong.id, {
                isLoading: false,
                progress: 0,
                stage: 'error',
                message: 'Error cargando audio'
              });
            }
          }
        };
      }

      // 🔥 Callback personalizado para carga progresiva
      if (typeof audioEngine.onLoading === 'function') {
        audioEngine.onLoading = (progressPercent, stage, message) => {
          if (isMountedRef.current && currentSong) {
            updateSongLoadingState(currentSong.id, {
              isLoading: progressPercent < 100,
              progress: progressPercent,
              stage: stage || 'loading_audio',
              message: message || 'Cargando audio...'
            });
          }
        };
      }

      // Cargar volumen inicial si está disponible
      if (typeof audioEngine.getVolume === 'function') {
        try {
          const initialVolume = audioEngine.getVolume();
          if (isMountedRef.current && 
              initialVolume !== null && 
              initialVolume !== undefined &&
              typeof initialVolume === 'number') {
            setVolume(initialVolume);
          }
        } catch (err) {
          console.warn('[PlayerContext] Error obteniendo volumen inicial:', err);
        }
      }

      // 🔥 Intentar obtener referencia directa al elemento audio
      try {
        if (audioEngine.audioElement) {
          audioElementRef.current = audioEngine.audioElement;
          console.log('[PlayerContext] Referencia a audioElement obtenida');
        }
      } catch (err) {
        console.warn('[PlayerContext] No se pudo obtener audioElement:', err.message);
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
      // 🔥 Actualizar estado de carga
      updateSongLoadingState(songId, {
        isLoading: true,
        progress: 10,
        stage: 'fetching_url',
        message: 'Solicitando URL de audio...'
      });

      // Verificar disponibilidad de streamManager
      if (!streamManager || typeof streamManager.getAudio !== 'function') {
        console.warn('[PlayerContext] streamManager no disponible, usando fallback');
        
        updateSongLoadingState(songId, {
          progress: 30,
          message: 'StreamManager no disponible, usando fallback...'
        });
        
        // Fallback: usar URL de prueba
        const fallbackUrl = `https://api.djidjimusic.com/api2/stream/${songId}/`;
        console.log(`[PlayerContext] Usando URL fallback: ${fallbackUrl.substring(0, 50)}...`);
        
        updateSongLoadingState(songId, {
          progress: 40,
          message: 'URL fallback obtenida'
        });
        
        return fallbackUrl;
      }

      // 🔥 USAR EL STREAM MANAGER
      updateSongLoadingState(songId, {
        progress: 99,
        message: 'cargando..'
      });
      
      console.log(`[PlayerContext] cargando...: ${songId}`);
      const audioUrl = await streamManager.getAudio(songId);
      
      if (!audioUrl) {
        console.warn('[PlayerContext] StreamManager devolvió URL vacía');
        throw new Error("No se pudo obtener URL de audio");
      }

      updateSongLoadingState(songId, {
        progress: 60,
        message: 'URL obtenida, validando...'
      });

      // Validar que sea una URL válida
      if (!validateAudioUrl(audioUrl)) {
        throw new Error("URL de audio inválida obtenida del StreamManager");
      }

      console.log(`[PlayerContext] URL obtenida exitosamente: ${audioUrl.substring(0, 50)}...`);
      
      updateSongLoadingState(songId, {
        progress: 80,
        message: 'URL validada correctamente'
      });
      
      return audioUrl;

    } catch (err) {
      console.error('[PlayerContext] Error obteniendo URL de audio:', {
        songId,
        error: err.message,
        stack: err.stack
      });
      
      // Actualizar estado de error
      updateSongLoadingState(songId, {
        isLoading: false,
        progress: 0,
        stage: 'error',
        message: `Error: ${err.message}`
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
    
    // 🔥 INICIAR CARGA CON FEEDBACK VISUAL
    updateSongLoadingState(song.id, {
      isLoading: true,
      progress: 0,
      stage: 'init',
      message: 'Iniciando reproducción...'
    });

    try {
      // 1. Obtener URL segura usando StreamManager
      updateSongLoadingState(song.id, {
        progress: 15,
        message: 'Obteniendo URL de audio...'
      });
      
      const audioUrl = await getSecureAudioUrl(song.id);
      
      if (!validateAudioUrl(audioUrl)) {
        throw new Error("URL de audio inválida obtenida");
      }

      // 2. Actualizar canción actual
      setCurrentSong(song);
      
      // 3. Cargar audio - NO auto-play para evitar bloqueos del navegador
      updateSongLoadingState(song.id, {
        progress: 70,
        stage: 'loading_audio',
        message: 'Cargando audio en el reproductor...'
      });
      
      console.log(`[PlayerContext] Cargando audio: ${audioUrl.substring(0, 50)}...`);
      await audioEngine.load(audioUrl, false); // false = no auto-play
      
      // 4. Audio cargado, listo para reproducir
      updateSongLoadingState(song.id, {
        isLoading: false,
        progress: 100,
        stage: 'ready',
        message: 'Listo para reproducir'
      });

      // 5. Reproducir después de breve pausa para mejor experiencia
      setTimeout(() => {
        if (isMountedRef.current && typeof audioEngine.play === 'function') {
          audioEngine.play().catch(playError => {
            console.warn('[PlayerContext] Auto-play bloqueado por el navegador:', playError);
            // El usuario necesitará interactuar manualmente
            if (isMountedRef.current) {
              setError('Haz clic en el botón de reproducir para iniciar la canción');
              updateSongLoadingState(song.id, {
                isLoading: false,
                progress: 100,
                stage: 'ready',
                message: 'Haz clic para reproducir'
              });
            }
          });
        }
      }, 300);

    } catch (err) {
      console.error("[PlayerContext] Error reproduciendo canción:", err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Error al reproducir');
        updateSongLoadingState(song.id, {
          isLoading: false,
          progress: 0,
          stage: 'error',
          message: 'Error cargando audio'
        });
        
        setCurrentSong(null);
      }
    }
  };

  /**
   * Toggle play/pause con feedback visual - VERSIÓN MEJORADA
   */
  const togglePlay = () => {
    console.log('[PlayerContext] togglePlay llamado, estado actual:', { 
      isPlaying, 
      currentSong: currentSong?.title,
      audioEngineAvailable: audioEngineAvailableRef.current 
    });
    
    if (!audioEngineAvailableRef.current || !currentSong) {
      console.warn('[PlayerContext] No se puede togglePlay: audioEngine no disponible o no hay canción');
      return;
    }

    try {
      if (isPlaying) {
        // 🔥 INTENTAR MÚLTIPLES FORMAS DE PAUSAR
        
        // 1. Intentar con audioEngine.pause() si existe
        if (typeof audioEngine.pause === 'function') {
          console.log('[PlayerContext] Intentando pausar con audioEngine.pause()');
          audioEngine.pause();
        }
        
        // 2. Intentar directamente con el elemento de audio si tenemos referencia
        if (audioElementRef.current && typeof audioElementRef.current.pause === 'function') {
          console.log('[PlayerContext] Intentando pausar directamente con audioElement.pause()');
          audioElementRef.current.pause();
        }
        
        // 3. Intentar buscar elementos audio en el DOM
        const audioElements = document.querySelectorAll('audio');
        if (audioElements.length > 0) {
          console.log(`[PlayerContext] Encontrados ${audioElements.length} elementos audio, pausando todos`);
          audioElements.forEach(audio => {
            if (typeof audio.pause === 'function') {
              audio.pause();
            }
          });
        }
        
        // 🔥 ACTUALIZAR ESTADO INMEDIATAMENTE (no depender de callbacks)
        setIsPlaying(false);
        updateSongLoadingState(currentSong.id, {
          isLoading: false,
          progress: 100,
          stage: 'paused',
          message: 'Pausado'
        });
        
        console.log('[PlayerContext] Estado actualizado a pausado');
        
      } else {
        // Reanudar reproducción
        console.log('[PlayerContext] Intentando reanudar reproducción');
        
        updateSongLoadingState(currentSong.id, {
          isLoading: true,
          progress: 0,
          stage: 'resuming',
          message: 'Reanudando...'
        });
        
        if (typeof audioEngine.play === 'function') {
          audioEngine.play().then(() => {
            console.log('[PlayerContext] audioEngine.play() exitoso');
            if (isMountedRef.current) {
              setIsPlaying(true);
              updateSongLoadingState(currentSong.id, {
                isLoading: false,
                progress: 100,
                stage: 'playing',
                message: 'Reproduciendo'
              });
            }
          }).catch(playError => {
            console.warn('[PlayerContext] Error en audioEngine.play():', playError);
            
            // 🔥 INTENTAR FORMAS ALTERNATIVAS DE PLAY
            
            // 1. Intentar directamente con el elemento de audio
            if (audioElementRef.current && typeof audioElementRef.current.play === 'function') {
              console.log('[PlayerContext] Intentando play directamente con audioElement');
              audioElementRef.current.play().then(() => {
                setIsPlaying(true);
                updateSongLoadingState(currentSong.id, {
                  isLoading: false,
                  progress: 100,
                  stage: 'playing',
                  message: 'Reproduciendo'
                });
              }).catch(err => {
                console.warn('[PlayerContext] Error en audioElement.play():', err);
              });
            }
            
            // 2. Intentar con elementos audio en DOM
            const audioElements = document.querySelectorAll('audio');
            if (audioElements.length > 0) {
              console.log(`[PlayerContext] Intentando play con ${audioElements.length} elementos audio`);
              audioElements.forEach(audio => {
                if (typeof audio.play === 'function') {
                  audio.play().catch(e => console.warn('Error en audio.play():', e));
                }
              });
            }
            
            updateSongLoadingState(currentSong.id, {
              isLoading: false,
              message: 'Error reanudando'
            });
          });
        } else {
          console.warn('[PlayerContext] audioEngine.play no es una función');
          updateSongLoadingState(currentSong.id, {
            isLoading: false,
            message: 'Error: función play no disponible'
          });
        }
      }
    } catch (err) {
      console.error('[PlayerContext] Error en togglePlay:', err);
    }
  };

  // Funciones wrapper con validación de disponibilidad
  const pause = () => {
    console.log('[PlayerContext] pause() llamado');
    if (audioEngineAvailableRef.current && typeof audioEngine.pause === 'function') {
      audioEngine.pause();
      setIsPlaying(false); // Actualizar estado inmediatamente
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
      try {
        const newVolume = audioEngine.setVolume(validVolume);
        if (isMountedRef.current && 
            newVolume !== null && 
            newVolume !== undefined &&
            typeof newVolume === 'number') {
          setVolume(newVolume);
        }
      } catch (err) {
        console.warn('[PlayerContext] Error cambiando volumen:', err);
      }
    } else {
      // Fallback: solo actualizar estado local
      if (isMountedRef.current) {
        setVolume(validVolume);
      }
    }
  };

  const clearError = () => {
    setError(null);
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
    lastValidUrl,
    
    // 🔥 Estado de carga por canción
    songLoadingStates,
    getSongLoadingState,
    updateSongLoadingState,
    isSongLoading,
    getSongLoadingProgress,
    
    // Acciones
    playSong,
    pause,
    togglePlay,
    seek,
    changeVolume,
    clearError,
    
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
      lastValidUrl: null,
      songLoadingStates: {},
      getSongLoadingState: () => ({
        isLoading: false,
        progress: 0,
        stage: 'none',
        message: '',
        lastUpdated: 0
      }),
      updateSongLoadingState: () => {},
      isSongLoading: () => false,
      getSongLoadingProgress: () => 0,
      
      playSong: (song) => {
        console.warn('Player no disponible. Canción:', song?.title);
      },
      pause: () => console.warn('Player no disponible - pause'),
      togglePlay: () => console.warn('Player no disponible - togglePlay'),
      seek: (seconds) => console.warn(`Player no disponible - seek: ${seconds}`),
      changeVolume: (value) => console.warn(`Player no disponible - volume: ${value}`),
      clearError: () => {},
      audioEngineAvailable: false,
      streamManagerAvailable: false
    };
  }
  
  return context;
};

export default PlayerContext;