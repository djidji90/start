// ============================================
// src/components/PlayerContext.jsx - VERSIÓN CORREGIDA (PAUSA FUNCIONAL)
// ============================================
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
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

  // Estado de carga por canción específica
  const [songLoadingStates, setSongLoadingStates] = useState({});

  // REF para acceso directo al elemento de audio
  const audioElementRef = useRef(null);

  const isMountedRef = useRef(true);
  const cleanupPerformedRef = useRef(false);
  const audioEngineAvailableRef = useRef(!!audioEngine);

  // Referencia para evitar múltiples llamadas a play/pause
  const isTogglingRef = useRef(false);

  // ============================================
  // FUNCIONES DE ESTADO DE CARGA
  // ============================================
  const updateSongLoadingState = useCallback((songId, loadingState) => {
    setSongLoadingStates(prev => ({
      ...prev,
      [songId]: {
        ...prev[songId],
        ...loadingState,
        lastUpdated: Date.now()
      }
    }));
  }, []);

  const getSongLoadingState = useCallback((songId) => {
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
  }, [songLoadingStates]);

  const isSongLoading = useCallback((songId) => {
    return getSongLoadingState(songId).isLoading;
  }, [getSongLoadingState]);

  const getSongLoadingProgress = useCallback((songId) => {
    return getSongLoadingState(songId).progress;
  }, [getSongLoadingState]);

  // ============================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================
  const validateAudioUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') {
      console.error("[PlayerContext] URL de audio no proporcionada o inválida");
      return false;
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl === '') {
      console.error("[PlayerContext] URL de audio vacía");
      return false;
    }

    const isValidUrl = trimmedUrl.startsWith('http://') || 
                      trimmedUrl.startsWith('https://') || 
                      trimmedUrl.startsWith('blob:') ||
                      trimmedUrl.startsWith('data:') ||
                      trimmedUrl.startsWith('/');

    if (!isValidUrl) {
      console.error("[PlayerContext] URL con formato inválido:", trimmedUrl.substring(0, 50));
      return false;
    }

    setLastValidUrl(trimmedUrl);
    return true;
  }, []);

  // ============================================
  // FUNCIONES OFFLINE
  // ============================================
  const isCurrentSongOffline = useCallback(() => {
    return currentSong?.source === 'offline';
  }, [currentSong]);

  const getPlaybackBadge = useCallback(() => {
    if (!currentSong) return null;

    if (currentSong.source === 'offline') {
      return {
        text: currentSong.storageType === 'cache' ? '📱 OFFLINE' : '💾 PC',
        color: '#4caf50'
      };
    }

    if (!navigator.onLine) {
      return {
        text: '⚠️ SIN INTERNET',
        color: '#f44336'
      };
    }

    return {
      text: '🌐 ONLINE',
      color: '#2196f3'
    };
  }, [currentSong]);

  // ============================================
  // OBTENER URL SEGURA
  // ============================================
  const getSecureAudioUrl = useCallback(async (songId) => {
    console.log(`[PlayerContext] Obteniendo URL para canción: ${songId}`);

    if (!songId) {
      throw new Error("ID de canción no proporcionado");
    }

    try {
      updateSongLoadingState(songId, {
        isLoading: true,
        progress: 10,
        stage: 'checking_offline',
        message: 'Verificando disponibilidad offline...'
      });

      const downloadHook = window.downloadAPI;
      if (downloadHook) {
        const isOfflineAvailable = await downloadHook.isDownloaded(songId);

        if (isOfflineAvailable) {
          const downloadInfo = downloadHook.getDownloadInfo(songId);

          if (downloadInfo?.storageType === 'cache') {
            updateSongLoadingState(songId, {
              progress: 30,
              stage: 'loading_offline',
              message: 'Cargando desde almacenamiento offline...'
            });

            const offlineUrl = await downloadHook.getOfflineAudioUrl(songId);

            if (offlineUrl) {
              console.log(`[PlayerContext] ✅ Reproduciendo OFFLINE: ${songId}`);
              updateSongLoadingState(songId, {
                progress: 80,
                stage: 'offline_ready',
                message: 'Audio offline cargado'
              });
              return offlineUrl;
            }
          } else {
            console.log(`[PlayerContext] ℹ️ Canción en PC: ${songId} - usar streaming`);
            updateSongLoadingState(songId, {
              progress: 20,
              stage: 'offline_unavailable',
              message: 'Canción en PC, usando streaming...'
            });
          }
        }
      }

      updateSongLoadingState(songId, {
        progress: 99,
        stage: 'fetching_url',
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
        stage: 'validating',
        message: 'URL obtenida, validando...'
      });

      if (!validateAudioUrl(audioUrl)) {
        throw new Error("URL de audio inválida obtenida del StreamManager");
      }

      console.log(`[PlayerContext] URL obtenida exitosamente: ${audioUrl.substring(0, 50)}...`);

      updateSongLoadingState(songId, {
        progress: 80,
        stage: 'online_ready',
        message: 'URL validada correctamente'
      });

      return audioUrl;

    } catch (err) {
      console.error('[PlayerContext] Error obteniendo URL de audio:', {
        songId,
        error: err.message
      });

      updateSongLoadingState(songId, {
        isLoading: false,
        progress: 0,
        stage: 'error',
        message: `Error: ${err.message}`
      });

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
  }, [updateSongLoadingState, validateAudioUrl]);

  // ============================================
  // PAUSE (FUNCIÓN SEPARADA PARA MAYOR CLARIDAD)
  // ============================================
  const pause = useCallback(() => {
    console.log('[PlayerContext] pause() llamado');

    if (!audioEngineAvailableRef.current) {
      console.warn('[PlayerContext] audioEngine no disponible');
      return;
    }

    try {
      // Intentar pausar con audioEngine
      if (typeof audioEngine.pause === 'function') {
        audioEngine.pause();
      }

      // Intentar pausar directamente con el elemento de audio
      if (audioElementRef.current && typeof audioElementRef.current.pause === 'function') {
        audioElementRef.current.pause();
      }

      // Buscar elementos audio en el DOM como último recurso
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        if (typeof audio.pause === 'function') {
          audio.pause();
        }
      });

      // Actualizar estado
      setIsPlaying(false);

      if (currentSong) {
        updateSongLoadingState(currentSong.id, {
          isLoading: false,
          progress: progress.current,
          stage: 'paused',
          message: 'Pausado'
        });
      }

      console.log('[PlayerContext] Pausa exitosa');

    } catch (err) {
      console.error('[PlayerContext] Error en pause:', err);
    }
  }, [currentSong, progress, updateSongLoadingState]);

  // ============================================
  // PLAY (FUNCIÓN SEPARADA)
  // ============================================
  const play = useCallback(() => {
    console.log('[PlayerContext] play() llamado');

    if (!audioEngineAvailableRef.current || !currentSong) {
      console.warn('[PlayerContext] No se puede reproducir');
      return;
    }

    try {
      updateSongLoadingState(currentSong.id, {
        isLoading: true,
        progress: progress.current,
        stage: 'resuming',
        message: 'Reanudando...'
      });

      // Intentar reproducir con audioEngine
      if (typeof audioEngine.play === 'function') {
        audioEngine.play().then(() => {
          if (isMountedRef.current) {
            setIsPlaying(true);
            updateSongLoadingState(currentSong.id, {
              isLoading: false,
              progress: progress.current,
              stage: 'playing',
              message: 'Reproduciendo'
            });
          }
        }).catch(playError => {
          console.warn('[PlayerContext] Error en audioEngine.play():', playError);

          // Intentar con el elemento de audio directamente
          if (audioElementRef.current && typeof audioElementRef.current.play === 'function') {
            audioElementRef.current.play().then(() => {
              setIsPlaying(true);
              updateSongLoadingState(currentSong.id, {
                isLoading: false,
                progress: progress.current,
                stage: 'playing',
                message: 'Reproduciendo'
              });
            }).catch(err => {
              console.warn('[PlayerContext] Error en audioElement.play():', err);
            });
          }
        });
      }

    } catch (err) {
      console.error('[PlayerContext] Error en play:', err);
    }
  }, [currentSong, progress, updateSongLoadingState]);

  // ============================================
  // TOGGLE PLAY/PAUSE (VERSIÓN CORREGIDA)
  // ============================================
  const togglePlay = useCallback(() => {
    console.log('[PlayerContext] togglePlay llamado, isPlaying:', isPlaying);

    // Evitar múltiples llamadas simultáneas
    if (isTogglingRef.current) {
      console.log('[PlayerContext] togglePlay ya en ejecución, ignorando');
      return;
    }

    isTogglingRef.current = true;

    try {
      if (isPlaying) {
        // Si está sonando, pausar
        pause();
      } else {
        // Si está pausado, reanudar
        play();
      }
    } catch (err) {
      console.error('[PlayerContext] Error en togglePlay:', err);
    } finally {
      // Liberar el bloqueo después de un breve tiempo
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 100);
    }
  }, [isPlaying, pause, play]);

  // ============================================
  // REPRODUCIR CANCIÓN
  // ============================================
  const playSong = useCallback(async (song) => {
    if (!song || !song.id) {
      console.warn("[PlayerContext] No se proporcionó canción válida");
      setError("Canción no válida");
      return;
    }

    if (!audioEngineAvailableRef.current) {
      console.warn("[PlayerContext] audioEngine no disponible para reproducir");
      setError("Reproductor no disponible. Recarga la página.");
      return;
    }

    // Si ya está reproduciendo la misma canción, solo toggle
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    setError(null);

    updateSongLoadingState(song.id, {
      isLoading: true,
      progress: 0,
      stage: 'init',
      message: 'Iniciando reproducción...'
    });

    try {
      const downloadHook = window.downloadAPI;
      let isOfflineAvailable = false;
      let downloadInfo = null;

      if (downloadHook) {
        isOfflineAvailable = await downloadHook.isDownloaded(song.id);
        if (isOfflineAvailable) {
          downloadInfo = downloadHook.getDownloadInfo(song.id);
        }
      }

      updateSongLoadingState(song.id, {
        progress: 15,
        stage: isOfflineAvailable ? 'offline' : 'online',
        message: isOfflineAvailable ? 'Usando audio offline...' : 'Obteniendo URL de audio...'
      });

      const audioUrl = await getSecureAudioUrl(song.id);

      if (!validateAudioUrl(audioUrl)) {
        throw new Error("URL de audio inválida obtenida");
      }

      const songWithSource = {
        ...song,
        source: isOfflineAvailable ? 'offline' : 'online',
        storageType: downloadInfo?.storageType || null
      };

      setCurrentSong(songWithSource);

      updateSongLoadingState(song.id, {
        progress: 70,
        stage: 'loading_audio',
        message: 'Cargando audio en el reproductor...'
      });

      console.log(`[PlayerContext] Cargando audio (${isOfflineAvailable ? 'OFFLINE' : 'ONLINE'}): ${audioUrl.substring(0, 50)}...`);
      await audioEngine.load(audioUrl, false);

      // Guardar referencia al elemento audio
      try {
        if (audioEngine.audioElement) {
          audioElementRef.current = audioEngine.audioElement;
        }
      } catch (e) {
        console.warn('[PlayerContext] No se pudo obtener audioElement:', e);
      }

      updateSongLoadingState(song.id, {
        isLoading: false,
        progress: 100,
        stage: 'ready',
        message: 'Listo para reproducir'
      });

      // Auto-play después de cargar
      setTimeout(() => {
        if (isMountedRef.current) {
          play();
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
  }, [currentSong, getSecureAudioUrl, updateSongLoadingState, validateAudioUrl, togglePlay, play]);

  // ============================================
  // SEEK
  // ============================================
  const seek = useCallback((seconds) => {
    if (audioEngineAvailableRef.current && 
        typeof audioEngine.seek === 'function' && 
        typeof seconds === 'number' && 
        seconds >= 0) {
      audioEngine.seek(seconds);
    }
  }, []);

  // ============================================
  // CHANGE VOLUME
  // ============================================
  const changeVolume = useCallback((value) => {
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
      if (isMountedRef.current) {
        setVolume(validVolume);
      }
    }
  }, []);

  // ============================================
  // CLEAR ERROR
  // ============================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // CLEANUP
  // ============================================
  const performCleanup = useCallback(() => {
    if (!cleanupPerformedRef.current) {
      console.log("[PlayerContext] Realizando cleanup...");
      cleanupPerformedRef.current = true;

      try {
        pause();

        if (audioEngineAvailableRef.current) {
          if (typeof audioEngine.destroy === 'function') {
            audioEngine.destroy();
          }
        }
      } catch (err) {
        console.error("[PlayerContext] Error en cleanup:", err);
      }
    }
  }, [pause]);

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  useEffect(() => {
    isMountedRef.current = true;
    cleanupPerformedRef.current = false;

    if (!audioEngineAvailableRef.current) {
      console.warn('[PlayerContext] audioEngine no está disponible');
      if (isMountedRef.current) {
        setError('Reproductor de audio no disponible en este momento');
      }
      return;
    }

    try {
      // Configurar callbacks
      if (typeof audioEngine.onPlay === 'function') {
        audioEngine.onPlay = () => {
          console.log('[PlayerContext] AudioEngine onPlay callback');
          if (isMountedRef.current) {
            setIsPlaying(true);
            if (currentSong) {
              updateSongLoadingState(currentSong.id, {
                isLoading: false,
                progress: progress.current,
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
            if (currentSong) {
              updateSongLoadingState(currentSong.id, {
                isLoading: false,
                progress: progress.current,
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

      // Callback personalizado para carga progresiva
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

      // Cargar volumen inicial
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

      // Obtener referencia al elemento audio
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

    return () => {
      isMountedRef.current = false;
      performCleanup();
    };
  }, []);

  // ✅ Exponer player globalmente
  useEffect(() => {
    window.playerAPI = {
      playSong,
      pause,
      togglePlay,
      play,
      currentSong: currentSong,
      isPlaying: isPlaying,
      isCurrentSongOffline: isCurrentSongOffline()
    };

    console.log('✅ playerAPI disponible globalmente');

    return () => {
      delete window.playerAPI;
    };
  }, [currentSong, isPlaying, playSong, pause, togglePlay, play, isCurrentSongOffline]);

  // ============================================
  // AUTO-LIMPIAR ERRORES
  // ============================================
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

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const contextValue = {
    // Estado
    currentSong,
    isPlaying,
    progress,
    volume,
    error,
    lastValidUrl,

    // Estado de carga por canción
    songLoadingStates,
    getSongLoadingState,
    updateSongLoadingState,
    isSongLoading,
    getSongLoadingProgress,

    // Funciones offline
    isCurrentSongOffline,
    getPlaybackBadge,

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

// ============================================
// HOOK PERSONALIZADO
// ============================================
export const usePlayer = () => {
  const context = useContext(PlayerContext);

  if (!context) {
    console.warn('usePlayer debe ser usado dentro de PlayerProvider. Usando mock.');

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
      isCurrentSongOffline: () => false,
      getPlaybackBadge: () => null,

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