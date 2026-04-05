// ============================================
// src/components/PlayerContext.jsx - VERSIÓN CORREGIDA
// ✅ playNext y playPrevious funcionan correctamente
// ✅ onended llama a playNext automáticamente
// ✅ Sin errores de referencias circulares
// ============================================

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { audioEngine } from "../audio/engine/AudioEngine";
import streamManager from "../audio/engine/StreamManager";
import useDownload from "../components/hook/services/useDownload";

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
  
  // Estados para playlist
  const [repeatMode, setRepeatMode] = useState(false); // false, 'one', 'all'
  const [playlist, setPlaylist] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);
  const [originalPlaylist, setOriginalPlaylist] = useState([]);

  // Estado de carga por canción específica
  const [songLoadingStates, setSongLoadingStates] = useState({});

  const download = useDownload();

  // REFs
  const isMountedRef = useRef(true);
  const cleanupPerformedRef = useRef(false);
  const isTogglingRef = useRef(false);
  const currentSongIdRef = useRef(null);
  const playerAPIExposedRef = useRef(false);
  const audioRef = useRef(null);
  
  // 🆕 REFERENCIAS PARA FUNCIONES (para romper dependencias circulares)
  const playSongRef = useRef(null);
  const playNextRef = useRef(null);
  const playPreviousRef = useRef(null);

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
  // FUNCIONES BÁSICAS
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
  // FUNCIONES DE REPETICIÓN
  // ============================================
  const toggleRepeat = useCallback(() => {
    console.log('[PlayerContext] toggleRepeat() - Modo actual:', repeatMode);
    
    if (repeatMode === false) {
      setRepeatMode('one');
      if (audioRef.current) {
        audioRef.current.loop = true;
      }
    } else if (repeatMode === 'one') {
      setRepeatMode('all');
      if (audioRef.current) {
        audioRef.current.loop = false;
      }
    } else {
      setRepeatMode(false);
      if (audioRef.current) {
        audioRef.current.loop = false;
      }
    }
  }, [repeatMode]);

  // ============================================
  // FUNCIONES DE PLAYLIST (sin playSong)
  // ============================================
  const generateShuffledPlaylist = useCallback((originalSongs) => {
    const shuffled = [...originalSongs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const toggleShuffle = useCallback(() => {
    if (shuffle) {
      if (originalPlaylist.length > 0) {
        setPlaylist(originalPlaylist);
        const currentSongId = currentSong?.id;
        const newIndex = originalPlaylist.findIndex(s => s.id === currentSongId);
        setPlaylistIndex(newIndex !== -1 ? newIndex : 0);
      }
      setShuffledPlaylist([]);
    } else {
      setOriginalPlaylist([...playlist]);
      const shuffled = generateShuffledPlaylist(playlist);
      setShuffledPlaylist(shuffled);
      setPlaylist(shuffled);
      const currentSongId = currentSong?.id;
      const newIndex = shuffled.findIndex(s => s.id === currentSongId);
      setPlaylistIndex(newIndex !== -1 ? newIndex : 0);
    }
    setShuffle(prev => !prev);
  }, [shuffle, playlist, originalPlaylist, currentSong, generateShuffledPlaylist]);

  const setPlaylistAndPlay = useCallback((songs, startIndex = 0, autoPlay = true) => {
    if (!songs || songs.length === 0) return;
    
    let finalPlaylist = [...songs];
    if (shuffle) {
      finalPlaylist = generateShuffledPlaylist(songs);
      setShuffledPlaylist(finalPlaylist);
    }
    
    setOriginalPlaylist([...songs]);
    setPlaylist(finalPlaylist);
    setPlaylistIndex(startIndex);
    
    if (autoPlay && finalPlaylist[startIndex]) {
      setTimeout(() => {
        if (playSongRef.current) {
          playSongRef.current(finalPlaylist[startIndex]);
        }
      }, 0);
    }
  }, [shuffle, generateShuffledPlaylist]);

  const addToPlaylist = useCallback((song, playNext = false) => {
    if (!song?.id) return;
    
    if (playNext && playlistIndex !== -1) {
      const newPlaylist = [...playlist];
      newPlaylist.splice(playlistIndex + 1, 0, song);
      setPlaylist(newPlaylist);
      if (shuffle) {
        setOriginalPlaylist(newPlaylist);
        const shuffled = generateShuffledPlaylist(newPlaylist);
        setShuffledPlaylist(shuffled);
        setPlaylist(shuffled);
      }
    } else {
      const newPlaylist = [...playlist, song];
      setPlaylist(newPlaylist);
      if (shuffle) {
        setOriginalPlaylist(newPlaylist);
        const shuffled = generateShuffledPlaylist(newPlaylist);
        setShuffledPlaylist(shuffled);
        setPlaylist(shuffled);
      }
    }
  }, [playlist, playlistIndex, shuffle, generateShuffledPlaylist]);

  const removeFromPlaylist = useCallback((songId) => {
    const newPlaylist = playlist.filter(s => s.id !== songId);
    setPlaylist(newPlaylist);
    
    if (currentSong?.id === songId) {
      if (newPlaylist.length > 0) {
        const newIndex = Math.min(playlistIndex, newPlaylist.length - 1);
        setPlaylistIndex(newIndex);
        if (playSongRef.current) {
          playSongRef.current(newPlaylist[newIndex]);
        }
      } else {
        stopAll();
      }
    } else {
      const currentIndexInNew = newPlaylist.findIndex(s => s.id === currentSong?.id);
      setPlaylistIndex(currentIndexInNew);
    }
    
    if (shuffle) {
      setOriginalPlaylist(newPlaylist);
      const shuffled = generateShuffledPlaylist(newPlaylist);
      setShuffledPlaylist(shuffled);
      setPlaylist(shuffled);
    }
  }, [playlist, playlistIndex, currentSong, shuffle, generateShuffledPlaylist, stopAll]);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setPlaylistIndex(-1);
    setOriginalPlaylist([]);
    setShuffledPlaylist([]);
  }, []);

  // ============================================
  // 🎵 PLAYSONG - FUNCIÓN PRINCIPAL
  // ============================================
  // ============================================
// 🎵 PLAYSONG - MODIFICADA PARA ACEPTAR CONTEXTO DE PLAYLIST
// ============================================
const playSong = useCallback(async (song, contextPlaylist = null) => {
  if (!song?.id || !isMountedRef.current) return;

  // Si es la misma canción, solo toggle
  if (currentSong?.id === song.id) {
    togglePlay();
    return;
  }

  // 🆕 CREAR PLAYLIST AUTOMÁTICA si se proporciona contexto
  if (contextPlaylist && contextPlaylist.length > 0 && playlist.length === 0) {
    const songIndex = contextPlaylist.findIndex(s => s.id === song.id);
    if (songIndex !== -1) {
      const newPlaylist = contextPlaylist.slice(songIndex);
      console.log(`[PlayerContext] 📋 Creando playlist automática con ${newPlaylist.length} canciones`);
      setPlaylist(newPlaylist);
      setOriginalPlaylist([...contextPlaylist]);
      setPlaylistIndex(0);
    }
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
        audioRef.current.onended = null;
        audioRef.current = null;
      }
    }

    // Verificar caché offline
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

    const audio = await streamManager.playSong(song.id, null, {
      streamUrl: offlineUrl
    });
    
    audioRef.current = audio;

    if (audio) {
      audio.loop = (repeatMode === 'one');
      
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
          console.log('[PlayerContext] Canción finalizada, repeatMode:', repeatMode);
          
          if (repeatMode === 'one') {
            playSong(song);
          } else if (playlist.length > 0) {
            if (playNextRef.current) {
              console.log('[PlayerContext] ⏭️ Llamando a playNext desde onended');
              playNextRef.current();
            } else {
              console.log('[PlayerContext] ⚠️ playNextRef no disponible');
            }
          } else {
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
}, [currentSong, togglePlay, updateSongLoadingState, download, repeatMode, playlist.length]);
  // ============================================
  // playNext y playPrevious - IMPLEMENTACIÓN REAL
  // ============================================
  const playNext = useCallback(() => {
    console.log('[PlayerContext] playNext llamado, playlist length:', playlist.length);
    
    if (playlist.length === 0) {
      console.log('[PlayerContext] No hay playlist para avanzar');
      return false;
    }
    
    let nextIndex = playlistIndex + 1;
    
    if (nextIndex >= playlist.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
        console.log('[PlayerContext] 🔁 Repitiendo playlist desde inicio');
      } else {
        console.log('[PlayerContext] Fin de playlist');
        setIsPlaying(false);
        setProgress({ current: 0, duration: 0 });
        return false;
      }
    }
    
    setPlaylistIndex(nextIndex);
    const nextSong = playlist[nextIndex];
    
    if (nextSong) {
      console.log(`[PlayerContext] ⏭️ Siguiente canción: ${nextSong.title}`);
      playSong(nextSong);
      return true;
    }
    
    return false;
  }, [playlist, playlistIndex, repeatMode, playSong]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) {
      console.log('[PlayerContext] No hay playlist para retroceder');
      return false;
    }
    
    let prevIndex = playlistIndex - 1;
    
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = playlist.length - 1;
        console.log('[PlayerContext] 🔁 Volviendo al final de playlist');
      } else {
        console.log('[PlayerContext] Inicio de playlist');
        return false;
      }
    }
    
    setPlaylistIndex(prevIndex);
    const prevSong = playlist[prevIndex];
    
    if (prevSong) {
      console.log(`[PlayerContext] ⏮️ Canción anterior: ${prevSong.title}`);
      playSong(prevSong);
      return true;
    }
    
    return false;
  }, [playlist, playlistIndex, repeatMode, playSong]);

  // ============================================
  // ASIGNAR REFERENCIAS (para romper dependencia circular)
  // ============================================
  useEffect(() => {
    playSongRef.current = playSong;
    playNextRef.current = playNext;
    playPreviousRef.current = playPrevious;
    console.log('[PlayerContext] Referencias asignadas correctamente');
  }, [playSong, playNext, playPrevious]);

  // ============================================
  // CLEANUP
  // ============================================
  const performCleanup = useCallback(() => {
    if (!cleanupPerformedRef.current && isMountedRef.current) {
      console.log("[PlayerContext] Cleanup...");
      cleanupPerformedRef.current = true;

      if (audioRef.current) {
        audioRef.current.ontimeupdate = null;
        audioRef.current.onended = null;
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

  // Exponer playerAPI globalmente
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
        repeatMode,
        toggleRepeat,
        playlist,
        playlistIndex,
        shuffle,
        playNext,
        playPrevious,
        toggleShuffle,
        setPlaylistAndPlay,
        addToPlaylist,
        removeFromPlaylist,
        clearPlaylist,
        getStreamMetrics: streamManager.getMetrics,
        getCacheStats: streamManager.getMetrics
      };
      
      playerAPIExposedRef.current = true;
      console.log('✅ playerAPI disponible');
    }
  }, [playSong, pause, togglePlay, resume, stopAll, currentSong, isPlaying, 
      repeatMode, toggleRepeat, playlist, playlistIndex, shuffle, playNext, 
      playPrevious, toggleShuffle, setPlaylistAndPlay, addToPlaylist, 
      removeFromPlaylist, clearPlaylist]);

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
    streamManagerAvailable: true,
    // Playlist
    playlist,
    playlistIndex,
    repeatMode,
    shuffle,
    setPlaylistAndPlay,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
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
      playlist: [],
      playlistIndex: -1,
      repeatMode: false,
      shuffle: false,
      playSong: () => {},
      pause: () => {},
      togglePlay: () => {},
      resume: () => {},
      seek: () => {},
      changeVolume: () => {},
      stopAll: () => {},
      getStreamMetrics: () => ({}),
      setPlaylistAndPlay: () => {},
      addToPlaylist: () => {},
      removeFromPlaylist: () => {},
      clearPlaylist: () => {},
      playNext: () => {},
      playPrevious: () => {},
      toggleRepeat: () => {},
      toggleShuffle: () => {},
    };
  }
  return context;
};

export default PlayerContext;