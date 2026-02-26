// ============================================
// src/components/PlayerContext.jsx - VERSIÓN OPTIMIZADA
// ============================================
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { audioEngine } from "../audio/engine/AudioEngine";
import streamManager from "../audio/engine/StreamManager";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState(null);
  const [lastValidUrl, setLastValidUrl] = useState(null);
  const [streamMetadata, setStreamMetadata] = useState(null);

  // Estado de carga por canción específica
  const [songLoadingStates, setSongLoadingStates] = useState({});

  // REFs
  const isMountedRef = useRef(true);
  const cleanupPerformedRef = useRef(false);
  const isTogglingRef = useRef(false);
  const progressIntervalRef = useRef(null);
  const currentSongIdRef = useRef(null);
  const playerAPIExposedRef = useRef(false); // Evitar exponer múltiples veces

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
    return state;
  }, [songLoadingStates]);

  // ============================================
  // 🎵 FUNCIONES DE CONTROL
  // ============================================

  const pause = useCallback(() => {
    if (!currentSong || !isMountedRef.current) return;
    
    console.log('[PlayerContext] pause()');
    streamManager.pauseSong(currentSong.id);
    setIsPlaying(false);
    
    updateSongLoadingState(currentSong.id, {
      isLoading: false,
      stage: 'paused',
      message: 'Pausado'
    });
  }, [currentSong, updateSongLoadingState]);

  const resume = useCallback(async () => {
    if (!currentSong || !isMountedRef.current) return;
    
    console.log('[PlayerContext] resume()');
    
    updateSongLoadingState(currentSong.id, {
      isLoading: true,
      stage: 'resuming',
      message: 'Reanudando...'
    });

    await streamManager.resumeSong(currentSong.id);
  }, [currentSong, updateSongLoadingState]);

  const togglePlay = useCallback(async () => {
    if (!currentSong || isTogglingRef.current) return;
    
    isTogglingRef.current = true;
    try {
      if (isPlaying) {
        pause();
      } else {
        await resume();
      }
    } finally {
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 100);
    }
  }, [currentSong, isPlaying, pause, resume]);

  const playSong = useCallback(async (song) => {
    if (!song?.id || !isMountedRef.current) return;

    // Si es la misma canción, solo toggle
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    setError(null);
    currentSongIdRef.current = song.id;

    updateSongLoadingState(song.id, {
      isLoading: true,
      progress: 0,
      stage: 'init',
      message: 'Iniciando...'
    });

    try {
      // Detener canción anterior si existe
      if (currentSong) {
        streamManager.stopStream(currentSong.id);
      }

      // Obtener URL
      const url = await streamManager.getStreamUrl(song.id);
      
      if (!url) throw new Error("No se pudo obtener URL");

      const songWithSource = {
        ...song,
        source: 'online'
      };

      setCurrentSong(songWithSource);

      updateSongLoadingState(song.id, {
        progress: 70,
        stage: 'loading_audio',
        message: 'Cargando...'
      });

      console.log(`[PlayerContext] Reproduciendo: ${song.title}`);

      const audio = await streamManager.playSong(song.id);

      if (audio) {
        audio.onplay = () => {
          if (isMountedRef.current && currentSongIdRef.current === song.id) {
            setIsPlaying(true);
          }
        };
        
        audio.onpause = () => {
          if (isMountedRef.current && currentSongIdRef.current === song.id) {
            setIsPlaying(false);
          }
        };
        
        audio.onended = () => {
          if (isMountedRef.current && currentSongIdRef.current === song.id) {
            setIsPlaying(false);
            setProgress({ current: 0, duration: 0 });
            currentSongIdRef.current = null;
          }
        };
      }

      // Intervalo de progreso
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        if (currentSongIdRef.current === song.id && isMountedRef.current) {
          const current = streamManager.getCurrentTime(song.id);
          const duration = streamManager.getDuration(song.id);
          
          if (duration > 0) {
            setProgress({ current, duration });
          }
        }
      }, 500);

      updateSongLoadingState(song.id, {
        isLoading: false,
        progress: 100,
        stage: 'playing',
        message: 'Reproduciendo'
      });

    } catch (err) {
      console.error("[PlayerContext] Error:", err);
      setError(err.message);
      updateSongLoadingState(song.id, {
        isLoading: false,
        stage: 'error',
        message: err.message
      });
      currentSongIdRef.current = null;
    }
  }, [currentSong, togglePlay, updateSongLoadingState]);

  const seek = useCallback((seconds) => {
    if (currentSong) {
      streamManager.seek(currentSong.id, seconds);
      setProgress(prev => ({ ...prev, current: seconds }));
    }
  }, [currentSong]);

  const changeVolume = useCallback((value) => {
    const validVolume = Math.max(0, Math.min(1, value));
    if (currentSong) {
      streamManager.setVolume(currentSong.id, validVolume);
    }
    setVolume(validVolume);
    localStorage.setItem('player_volume', validVolume.toString());
  }, [currentSong]);

  const stopAll = useCallback(() => {
    console.log("[PlayerContext] stopAll");
    streamManager.stopAll();
    setIsPlaying(false);
    setCurrentSong(null);
    setProgress({ current: 0, duration: 0 });
    currentSongIdRef.current = null;
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // ============================================
  // CLEANUP OPTIMIZADO
  // ============================================
  const performCleanup = useCallback(() => {
    if (!cleanupPerformedRef.current && isMountedRef.current) {
      console.log("[PlayerContext] Cleanup...");
      cleanupPerformedRef.current = true;

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      streamManager.cleanup();
      audioEngine?.destroy?.();
      
      playerAPIExposedRef.current = false;
      currentSongIdRef.current = null;
    }
  }, []);

  // ============================================
  // EFECTOS OPTIMIZADOS
  // ============================================

  // Inicialización (solo una vez)
  useEffect(() => {
    isMountedRef.current = true;
    cleanupPerformedRef.current = false;

    // Cargar volumen guardado
    const savedVolume = localStorage.getItem('player_volume');
    if (savedVolume) {
      const parsed = parseFloat(savedVolume);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        setVolume(parsed);
      }
    }

    return () => {
      isMountedRef.current = false;
      performCleanup();
    };
  }, [performCleanup]);

  // Exponer playerAPI (solo una vez)
  useEffect(() => {
    if (!playerAPIExposedRef.current) {
      window.playerAPI = {
        playSong,
        pause,
        togglePlay,
        resume,
        stopAll,
        currentSong,
        isPlaying,
        getStreamMetrics: streamManager.getMetrics
      };
      
      playerAPIExposedRef.current = true;
      console.log('✅ playerAPI disponible');
    }

    // Actualizar referencia cuando cambien
    return () => {
      if (window.playerAPI) {
        // Solo limpiar si es necesario
      }
    };
  }, [playSong, pause, togglePlay, resume, stopAll, currentSong, isPlaying]);

  // Sincronizar estado con streamManager
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (currentSong && isMountedRef.current) {
        const isActuallyPlaying = streamManager.isPlaying(currentSong.id);
        if (isActuallyPlaying !== isPlaying) {
          setIsPlaying(isActuallyPlaying);
        }
      }
    }, 1000);

    return () => clearInterval(syncInterval);
  }, [currentSong, isPlaying]);

  // ============================================
  // CONTEXT VALUE (memoizado)
  // ============================================
  const contextValue = {
    currentSong,
    isPlaying,
    progress,
    volume,
    error,
    lastValidUrl,
    streamMetadata,
    songLoadingStates,
    getSongLoadingState,
    updateSongLoadingState,
    isSongLoading: (id) => getSongLoadingState(id).isLoading,
    getSongLoadingProgress: (id) => getSongLoadingState(id).progress,
    isCurrentSongOffline: () => currentSong?.source === 'offline',
    getPlaybackBadge: () => null,
    playSong,
    pause,
    resume,
    togglePlay,
    seek,
    changeVolume,
    clearError: () => setError(null),
    stopAll,
    getStreamMetrics: streamManager.getMetrics,
    audioEngineAvailable: !!audioEngine,
    streamManagerAvailable: true
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    console.warn('usePlayer fuera de PlayerProvider');
    return {
      currentSong: null,
      isPlaying: false,
      progress: { current: 0, duration: 0 },
      volume: 0.7,
      error: null,
      playSong: () => {},
      pause: () => {},
      togglePlay: () => {},
      resume: () => {},
      seek: () => {},
      changeVolume: () => {},
      stopAll: () => {}
    };
  }
  return context;
};

export default PlayerContext;