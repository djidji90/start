// ============================================
// src/components/PlayerContext.jsx - VERSIÓN ACTUALIZADA PARA NUEVA ARQUITECTURA
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
  // FUNCIONES DE ESTADO DE CARGA (SIN CAMBIOS)
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
  // FUNCIONES DE VALIDACIÓN (SIN CAMBIOS)
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
  // FUNCIONES OFFLINE (SIN CAMBIOS)
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
  // 🆕 NUEVO MÉTODO: OBTENER URL DEL BACKEND
  // ============================================
  const getStreamUrl = useCallback(async (songId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`/api2/songs/${songId}/stream/`, {
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
    return data.data.stream_url;
  }, []);

  // ============================================
  // 📝 OBTENER URL SEGURA (ACTUALIZADO)
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

      // ✅ PRIMERO: Verificar offline
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

      // ✅ SEGUNDO: Obtener URL del backend (nueva arquitectura)
      updateSongLoadingState(songId, {
        progress: 50,
        stage: 'fetching_url',
        message: 'Obteniendo URL de streaming...'
      });

      console.log(`[PlayerContext] Solicitando URL para: ${songId}`);
      
      // 🆕 USAR EL NUEVO MÉTODO
      const audioUrl = await getStreamUrl(songId);

      if (!audioUrl) {
        console.warn('[PlayerContext] No se pudo obtener URL');
        throw new Error("No se pudo obtener URL de audio");
      }

      updateSongLoadingState(songId, {
        progress: 80,
        stage: 'validating',
        message: 'URL obtenida, validando...'
      });

      if (!validateAudioUrl(audioUrl)) {
        throw new Error("URL de audio inválida obtenida");
      }

      console.log(`[PlayerContext] ✅ URL obtenida exitosamente: ${audioUrl.substring(0, 50)}...`);

      updateSongLoadingState(songId, {
        progress: 100,
        isLoading: false,
        stage: 'ready',
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

      // Mensajes de error amigables
      let userMessage = err.message;
      if (err.message.includes('401')) {
        userMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (err.message.includes('403')) {
        userMessage = 'No tienes permisos para reproducir esta canción.';
      } else if (err.message.includes('404')) {
        userMessage = 'La canción no está disponible.';
      } else if (err.message.includes('429')) {
        userMessage = 'Has excedido el límite de reproducciones. Intenta más tarde.';
      } else if (err.message.includes('fetch') || err.message.includes('network')) {
        userMessage = 'Error de conexión. Verifica tu internet.';
      }

      throw new Error(userMessage);
    }
  }, [updateSongLoadingState, validateAudioUrl, getStreamUrl]);

  // ============================================
  // PAUSE (SIN CAMBIOS)
  // ============================================
  const pause = useCallback(() => {
    console.log('[PlayerContext] pause() llamado');

    if (!audioEngineAvailableRef.current) {
      console.warn('[PlayerContext] audioEngine no disponible');
      return;
    }

    try {
      if (typeof audioEngine.pause === 'function') {
        audioEngine.pause();
      }

      if (audioElementRef.current && typeof audioElementRef.current.pause === 'function') {
        audioElementRef.current.pause();
      }

      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        if (typeof audio.pause === 'function') {
          audio.pause();
        }
      });

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
  // PLAY (SIN CAMBIOS)
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
  // TOGGLE PLAY/PAUSE (SIN CAMBIOS)
  // ============================================
  const togglePlay = useCallback(() => {
    console.log('[PlayerContext] togglePlay llamado, isPlaying:', isPlaying);

    if (isTogglingRef.current) {
      console.log('[PlayerContext] togglePlay ya en ejecución, ignorando');
      return;
    }

    isTogglingRef.current = true;

    try {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } catch (err) {
      console.error('[PlayerContext] Error en togglePlay:', err);
    } finally {
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 100);
    }
  }, [isPlaying, pause, play]);

  // ============================================
  // 🆕 NUEVO MÉTODO: Reproducir usando StreamManager simplificado
  // ============================================
  const playWithStreamManager = useCallback(async (song, audioUrl) => {
    try {
      // Usar el StreamManager simplificado para reproducir
      const audio = await streamManager.playSong(song.id);
      
      // Guardar referencia
      audioElementRef.current = audio;
      
      // Configurar eventos
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        // Aquí podrías reproducir la siguiente canción
      };
      audio.onerror = (e) => {
        console.error('[PlayerContext] Error en reproducción:', e);
        setError('Error en la reproducción');
      };
      
      return audio;
    } catch (error) {
      console.error('[PlayerContext] Error en playWithStreamManager:', error);
      throw error;
    }
  }, []);

  // ============================================
  // REPRODUCIR CANCIÓN (ACTUALIZADO)
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
      // Verificar offline
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
        message: isOfflineAvailable ? 'Usando audio offline...' : 'Obteniendo URL de streaming...'
      });

      // ✅ OBTENER URL (ahora usa getSecureAudioUrl actualizado)
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

      console.log(`[PlayerContext] Reproduciendo (${isOfflineAvailable ? 'OFFLINE' : 'STREAMING'}): ${song.title}`);

      // 🆕 USAR STREAM MANAGER SIMPLIFICADO para reproducir
      await playWithStreamManager(song, audioUrl);

      updateSongLoadingState(song.id, {
        isLoading: false,
        progress: 100,
        stage: 'playing',
        message: 'Reproduciendo'
      });

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
  }, [currentSong, getSecureAudioUrl, updateSongLoadingState, validateAudioUrl, togglePlay, playWithStreamManager]);

  // ============================================
  // SEEK (ACTUALIZADO para usar streamManager)
  // ============================================
  const seek = useCallback((seconds) => {
    if (currentSong) {
      streamManager.seek(currentSong.id, seconds);
    }
  }, [currentSong]);

  // ============================================
  // CHANGE VOLUME (ACTUALIZADO para usar streamManager)
  // ============================================
  const changeVolume = useCallback((value) => {
    const validVolume = Math.max(0, Math.min(1, value));
    
    if (currentSong) {
      streamManager.setVolume(currentSong.id, validVolume);
    }
    
    setVolume(validVolume);
  }, [currentSong]);

  // ============================================
  // CLEAR ERROR (SIN CAMBIOS)
  // ============================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // CLEANUP (ACTUALIZADO)
  // ============================================
  const performCleanup = useCallback(() => {
    if (!cleanupPerformedRef.current) {
      console.log("[PlayerContext] Realizando cleanup...");
      cleanupPerformedRef.current = true;

      try {
        pause();
        streamManager.cleanup(); // ✅ Limpiar streams activos
        
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
  // INICIALIZACIÓN (con pequeñas actualizaciones)
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
      // Configurar callbacks de audioEngine (sin cambios)
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

  // ✅ Exponer player globalmente (SIN CAMBIOS)
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
  // AUTO-LIMPIAR ERRORES (SIN CAMBIOS)
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
  // CONTEXT VALUE (ACTUALIZADO)
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

    // Información del sistema (actualizado)
    audioEngineAvailable: audioEngineAvailableRef.current,
    streamManagerAvailable: !!streamManager && typeof streamManager.playSong === 'function'
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

// ============================================
// HOOK PERSONALIZADO (SIN CAMBIOS)
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