// ============================================
// src/components/PlayerContext.jsx - VERSIÓN FINAL CON SOPORTE OFFLINE
// ✅ Reproducción offline automática (canciones cacheadas)
// ✅ Eliminada doble llamada a getStreamUrl
// ✅ Usa ontimeupdate en lugar de setInterval
// ✅ Mejor manejo de errores
// ✅ Compatible con cache de StreamManager
// ============================================

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { audioEngine } from "../audio/engine/AudioEngine";
import streamManager from "../audio/engine/StreamManager";
import useDownload from "../components/hook/services/useDownload"; // 🔥 IMPORTANTE: Ajusta la ruta según tu estructura

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState(null);
  const [lastValidUrl, setLastValidUrl] = useState(null);
  const [streamMetadata, setStreamMetadata] = useState(null);

  // Estado de carga por canción específica
  const [songLoadingStates, setSongLoadingStates] = useState({});

  // 🔥 Hook de descargas (necesario para offline)
  const download = useDownload();

  // REFs
  const isMountedRef = useRef(true);
  const cleanupPerformedRef = useRef(false);
  const isTogglingRef = useRef(false);
  const currentSongIdRef = useRef(null);
  const playerAPIExposedRef = useRef(false);
  const audioRef = useRef(null);

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
  // 🎵 FUNCIONES DE CONTROL BÁSICAS
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

  // ============================================
  // 🎵 PLAYSONG - VERSIÓN CON SOPORTE OFFLINE (CORAZÓN DEL SISTEMA)
  // ============================================
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
        if (audioRef.current) {
          audioRef.current.ontimeupdate = null;
          audioRef.current = null;
        }
      }

      // 🔥 VERIFICAR SI LA CANCIÓN ESTÁ EN CACHÉ OFFLINE
      let offlineUrl = null;
      const isCached = download?.isDownloaded?.(song.id);
      
      if (isCached) {
        console.log(`[PlayerContext] 📴 Canción encontrada en caché: ${song.title}`);
        offlineUrl = await download?.getOfflineAudioUrl?.(song.id);
      }

      const songWithSource = {
        ...song,
        source: offlineUrl ? 'offline' : 'online'
      };

      setCurrentSong(songWithSource);

      updateSongLoadingState(song.id, {
        progress: 70,
        stage: 'loading_audio',
        message: offlineUrl ? 'Cargando desde caché...' : 'Conectando...'
      });

      console.log(`[PlayerContext] Reproduciendo: ${song.title} (${offlineUrl ? 'OFFLINE' : 'ONLINE'})`);

      // 🔥 PASAR LA URL OFFLINE A STREAM MANAGER SI EXISTE
      const audio = await streamManager.playSong(song.id, null, {
        streamUrl: offlineUrl // StreamManager usará esto si existe
      });
      
      audioRef.current = audio;

      if (audio) {
        // Configurar event listeners
        audio.onplay = () => {
          if (isMountedRef.current && currentSongIdRef.current === song.id) {
            setIsPlaying(true);
            updateSongLoadingState(song.id, {
              isLoading: false,
              stage: 'playing',
              message: 'Reproduciendo'
            });
          }
        };
        
        audio.onpause = () => {
          if (isMountedRef.current && currentSongIdRef.current === song.id) {
            setIsPlaying(false);
            updateSongLoadingState(song.id, {
              isLoading: false,
              stage: 'paused',
              message: 'Pausado'
            });
          }
        };
        
        audio.onended = () => {
          if (isMountedRef.current && currentSongIdRef.current === song.id) {
            setIsPlaying(false);
            setProgress({ current: 0, duration: 0 });
            currentSongIdRef.current = null;
            audioRef.current = null;
            
            updateSongLoadingState(song.id, {
              isLoading: false,
              stage: 'ended',
              message: 'Finalizado'
            });
          }
        };

        audio.onerror = (e) => {
          if (isMountedRef.current && currentSongIdRef.current === song.id) {
            console.error('[PlayerContext] Error en audio:', audio.error);
            setError('Error en reproducción');
            updateSongLoadingState(song.id, {
              isLoading: false,
              stage: 'error',
              message: audio.error?.message || 'Error desconocido'
            });
          }
        };

        // ✅ Usar ontimeupdate para progreso (más eficiente que setInterval)
        audio.ontimeupdate = () => {
          if (isMountedRef.current && currentSongIdRef.current === song.id) {
            setProgress({
              current: audio.currentTime,
              duration: audio.duration || 0
            });
          }
        };
      }

      updateSongLoadingState(song.id, {
        isLoading: false,
        progress: 100,
        stage: 'playing',
        message: 'Reproduciendo'
      });

    } catch (err) {
      console.error("[PlayerContext] Error:", err);
      
      // Manejo específico de errores
      let errorMessage = err.message;
      if (err.message.includes('401')) {
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
      } else if (err.message.includes('403')) {
        errorMessage = 'No tienes permisos para esta canción.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Canción no disponible.';
      } else if (err.message.includes('429')) {
        errorMessage = 'Límite de reproducciones excedido.';
      } else if (err.message.includes('fetch') || err.message.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (!navigator.onLine && !offlineUrl) {
        // 🔥 CASO ESPECÍFICO: offline sin caché
        errorMessage = 'No hay internet y esta canción no está disponible offline.';
      }
      
      setError(errorMessage);
      
      updateSongLoadingState(song.id, {
        isLoading: false,
        stage: 'error',
        message: errorMessage
      });
      
      currentSongIdRef.current = null;
      audioRef.current = null;
    }
  }, [currentSong, togglePlay, updateSongLoadingState, download]); // ✅ Incluir download en dependencias

  // ============================================
  // OTRAS FUNCIONES DE CONTROL
  // ============================================
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
    
    if (audioRef.current) {
      audioRef.current.ontimeupdate = null;
      audioRef.current = null;
    }
  }, []);

  // ============================================
  // CLEANUP
  // ============================================
  const performCleanup = useCallback(() => {
    if (!cleanupPerformedRef.current && isMountedRef.current) {
      console.log("[PlayerContext] Cleanup...");
      cleanupPerformedRef.current = true;

      if (audioRef.current) {
        audioRef.current.ontimeupdate = null;
        audioRef.current = null;
      }
      
      streamManager.cleanup();
      audioEngine?.destroy?.();
      
      playerAPIExposedRef.current = false;
      currentSongIdRef.current = null;
    }
  }, []);

  // ============================================
  // EFECTOS
  // ============================================

  // Inicialización
  useEffect(() => {
    isMountedRef.current = true;
    cleanupPerformedRef.current = false;

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

  // Exponer playerAPI globalmente (para debugging)
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
        getStreamMetrics: streamManager.getMetrics,
        getCacheStats: streamManager.getMetrics
      };
      
      playerAPIExposedRef.current = true;
      console.log('✅ playerAPI disponible (con soporte offline)');
    }
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
  // CONTEXT VALUE
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
    getCacheStats: streamManager.getMetrics,
    audioEngineAvailable: !!audioEngine,
    streamManagerAvailable: true
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
      stopAll: () => {},
      getStreamMetrics: () => ({})
    };
  }
  return context;
};

export default PlayerContext;