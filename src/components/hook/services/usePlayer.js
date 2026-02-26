// src/audio/hooks/usePlayer.js - VERSIÓN CORREGIDA
import { usePlayer as usePlayerContext } from '../../../components/PlayerContext.jsx';
import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Hook de alto nivel para UI con funcionalidades adicionales
 * Abstracción sobre PlayerContext para componentes específicos de audio
 * @version 2.1.0 - Corregido: métodos correctos del contexto
 */
export const useAudioPlayer = () => {
  const player = usePlayerContext();

  // Referencia para evitar actualizaciones innecesarias
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Configuración de logging condicional (solo en desarrollo)
  const DEBUG = process.env.NODE_ENV === 'development';
  const log = useCallback((...args) => {
    if (DEBUG) console.log('[useAudioPlayer]', ...args);
  }, [DEBUG]);

  /**
   * Formatea segundos a formato mm:ss o hh:mm:ss
   */
  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    
    const MAX_SECONDS = 359999;
    const safeSeconds = Math.min(seconds, MAX_SECONDS);
    
    const hours = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = Math.floor(safeSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Calcula el porcentaje de progreso de reproducción
   */
  const getProgressPercentage = useCallback(() => {
    if (!player.progress?.duration || player.progress.duration === 0) return 0;
    return (player.progress.current / player.progress.duration) * 100;
  }, [player.progress.current, player.progress.duration]);

  /**
   * Reproduce una canción por su ID con datos opcionales
   */
  const playSongById = useCallback(async (songId, songData) => {
    if (!songId) {
      const error = new Error('[useAudioPlayer] songId es requerido');
      log('Error:', error.message);
      throw error;
    }

    const song = songData || { 
      id: songId, 
      title: `Canción ${songId}`,
      artist: 'Artista desconocido',
      genre: 'Género',
      duration: 180
    };
    
    try {
      log('Reproduciendo por ID:', songId);
      return await player.playSong(song);
    } catch (error) {
      log('Error reproduciendo por ID:', error);
      throw new Error(`No se pudo reproducir la canción: ${error.message}`);
    }
  }, [player.playSong, log]);

  /**
   * Función específica para reproducir desde SongCard
   */
  const playSongFromCard = useCallback(async (song) => {
    if (!song?.id) {
      const error = new Error('[useAudioPlayer] Canción inválida');
      log('Error:', error.message);
      throw error;
    }

    log('🎵 Reproduciendo desde SongCard:', {
      id: song.id,
      title: song.title,
      artist: song.artist
    });
    
    try {
      return await player.playSong(song);
    } catch (error) {
      log('Error reproduciendo desde card:', error);
      throw new Error(`No se pudo reproducir ${song.title}: ${error.message}`);
    }
  }, [player.playSong, log]);

  /**
   * ✅ CORREGIDO: Usar player.pause() en lugar de player.pauseSong()
   */
  const pause = useCallback(() => {
    log('Pausando canción actual');
    if (player.currentSong) {
      player.pause(); // Cambiado de pauseSong a pause
    }
  }, [player.pause, player.currentSong, log]);

  /**
   * ✅ CORREGIDO: Usar player.resume() en lugar de player.resumeSong()
   */
  const resume = useCallback(async () => {
    log('Reanudando canción actual');
    if (player.currentSong) {
      return player.resume(); // Cambiado de resumeSong a resume
    }
  }, [player.resume, player.currentSong, log]);

  /**
   * Alterna play/pause de la canción actual
   */
  const togglePlay = useCallback(async () => {
    log('Toggle play/pause');
    if (!player.currentSong) {
      log('No hay canción actual para alternar');
      return;
    }

    // ✅ CORREGIDO: Usar player.togglePlay() en lugar de lógica manual
    await player.togglePlay();
  }, [player.togglePlay, player.currentSong, log]);

  /**
   * Avanza a la siguiente canción
   */
  const playNext = useCallback(async () => {
    log('Play next - Pendiente de implementación');
    return Promise.resolve();
  }, [log]);

  /**
   * Retrocede a la canción anterior
   */
  const playPrevious = useCallback(async () => {
    log('Play previous - Pendiente de implementación');
    return Promise.resolve();
  }, [log]);

  /**
   * Obtiene el estado de carga de la canción actual
   */
  const getCurrentSongLoadingState = useCallback(() => {
    return player.currentSong 
      ? player.getSongLoadingState(player.currentSong.id) 
      : null;
  }, [player.currentSong, player.getSongLoadingState]);

  /**
   * Verifica si una canción está siendo procesada
   */
  const isSongBeingProcessed = useCallback((songId) => {
    if (!songId) return false;
    const state = player.getSongLoadingState(songId);
    return state.isLoading || 
           state.stage === 'playing' || 
           state.stage === 'paused' ||
           state.stage === 'resuming';
  }, [player.getSongLoadingState]);

  /**
   * Helper para SongCard - Determina el estado de UNA canción específica
   */
  const getSongStatus = useCallback((songId) => {
    if (!songId) {
      log('getSongStatus llamado sin songId');
      return null;
    }

    const isCurrent = player.currentSong?.id === songId;
    const loadingState = player.getSongLoadingState(songId);

    // Determinar estados base
    const isLoading = loadingState.isLoading;
    const loadingProgress = loadingState.progress;
    const loadingMessage = loadingState.message;
    const loadingStage = loadingState.stage;

    // Determinar estado para UI
    let status;
    if (isCurrent && player.isPlaying) {
      status = 'playing';
    } else if (isCurrent && !player.isPlaying) {
      status = 'paused';
    } else if (isLoading) {
      status = 'loading';
    } else {
      status = 'idle';
    }

    // Determinar qué botón mostrar
    const showPlayButton = !isCurrent || (!player.isPlaying && !isLoading);
    const showPauseButton = isCurrent && player.isPlaying && !isLoading;
    const showLoadingButton = isLoading;

    // Determinar qué barra de progreso mostrar
    const showLoadingBar = isLoading;
    const showPlaybackBar = isCurrent && player.progress.duration > 0;

    // Calcular progreso de reproducción si es la canción actual
    const playbackProgress = isCurrent ? {
      current: player.progress.current,
      duration: player.progress.duration,
      percentage: getProgressPercentage()
    } : null;

    // Colores para UI
    const buttonColor = (() => {
      if (isLoading) return '#FF9800';
      if (isCurrent && player.isPlaying) return '#f50057';
      return '#00838F';
    })();

    // Texto del botón
    const buttonText = isLoading 
      ? `${loadingProgress}%`
      : (isCurrent && player.isPlaying ? '⏸️' : '▶️');

    return {
      // Identificación
      songId,
      isCurrent,

      // Estado del reproductor
      isPlaying: player.isPlaying,

      // Estado de carga
      isLoading,
      loadingProgress,
      loadingMessage,
      loadingStage,

      // Estado calculado para UI
      status,
      showPlayButton,
      showPauseButton,
      showLoadingButton,
      showLoadingBar,
      showPlaybackBar,

      // Progreso de reproducción
      playbackProgress,
      playbackCurrentTime: playbackProgress?.current || 0,
      playbackDuration: playbackProgress?.duration || 0,
      playbackPercentage: playbackProgress?.percentage || 0,

      // UI Helpers
      buttonColor,
      buttonText,
      buttonTooltip: isLoading 
        ? (loadingMessage || 'Cargando...')
        : (isCurrent && player.isPlaying 
            ? 'Pausar' 
            : (isCurrent ? 'Reanudar' : 'Reproducir')),
      displayMessage: isLoading
        ? loadingMessage
        : (isCurrent && player.isPlaying 
            ? 'Reproduciendo'
            : (isCurrent ? 'Pausado' : 'Listo')),
      displayProgress: isLoading
        ? `${loadingProgress}%`
        : (isCurrent && player.progress.duration > 0
            ? `${formatTime(player.progress.current)} / ${formatTime(player.progress.duration)}`
            : '')
    };
  }, [
    player.currentSong,
    player.isPlaying,
    player.progress,
    player.getSongLoadingState,
    getProgressPercentage,
    formatTime,
    log
  ]);

  /**
   * Cambia el volumen
   */
  const setVolume = useCallback((volume) => {
    const validVolume = Math.max(0, Math.min(1, volume));
    log('Cambiando volumen:', validVolume);
    player.changeVolume(validVolume);
  }, [player.changeVolume, log]);

  /**
   * Busca una posición específica en la canción actual
   */
  const seek = useCallback((seconds) => {
    if (player.currentSong) {
      log('Buscando posición:', seconds);
      player.seek(seconds);
    }
  }, [player.seek, player.currentSong, log]);

  // Estado calculado memoizado
  const isLoading = useMemo(() => {
    return player.currentSong 
      ? player.getSongLoadingState(player.currentSong.id).isLoading 
      : false;
  }, [player.currentSong, player.getSongLoadingState]);

  const status = useMemo(() => {
    if (!player.currentSong) return 'idle';
    if (isLoading) return 'loading';
    return player.isPlaying ? 'playing' : 'paused';
  }, [player.currentSong, player.isPlaying, isLoading]);

  const hasSong = !!player.currentSong;
  const isPaused = hasSong && !player.isPlaying && !isLoading;
  const canPlay = hasSong && !player.isPlaying && !isLoading;
  const canPause = hasSong && player.isPlaying && !isLoading;

  const progressPercentage = getProgressPercentage();

  // Obtener el título de la canción actual
  const currentTrackTitle = useMemo(() => {
    return player.currentSong?.title || null;
  }, [player.currentSong]);

  const currentTrackArtist = useMemo(() => {
    return player.currentSong?.artist || null;
  }, [player.currentSong]);

  return {
    // Estado básico (del contexto)
    ...player,

    // Estado calculado (memoizado)
    isLoading,
    status,
    hasSong,
    isPaused,
    canPlay,
    canPause,
    currentTrack: player.currentSong,
    currentTrackTitle,
    currentTrackArtist,
    duration: player.progress.duration,
    currentTime: player.progress.current,
    progressPercentage,

    // Funciones de control específicas (CORREGIDAS)
    pause,
    resume,
    toggle: togglePlay,
    seek,
    setVolume,

    // Funciones de navegación
    playNext,
    playPrevious,

    // Funciones de utilidad
    getSongStatus,
    formatTime,
    playSongFromCard,
    playSongById,
    getCurrentSongLoadingState,
    isSongBeingProcessed,
  };
};

// Exportar ambos hooks para compatibilidad
export { usePlayerContext as usePlayer };