// src/audio/hooks/usePlayer.js - VERSIÓN OPTIMIZADA CON USE CALLBACK
import { usePlayer as usePlayerContext } from '../../../components/PlayerContext.jsx';
import { useCallback, useMemo } from 'react';

/**
 * Hook de alto nivel para UI con funcionalidades adicionales
 * Abstracción sobre PlayerContext para componentes específicos de audio
 * @version 2.0.0 - Optimizado con useCallback para máximo rendimiento
 */
export const useAudioPlayer = () => {
  const player = usePlayerContext();

  // Configuración de logging condicional (solo en desarrollo)
  const DEBUG = process.env.NODE_ENV === 'development';
  const log = useCallback((...args) => {
    if (DEBUG) console.log('[useAudioPlayer]', ...args);
  }, [DEBUG]);

  /**
   * Formatea segundos a formato mm:ss o hh:mm:ss
   * @param {number} seconds - Tiempo en segundos
   * @returns {string} Tiempo formateado
   */
  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    
    // Límite seguro: 99:59:59
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
   * @returns {number} Porcentaje entre 0 y 100
   */
  const getProgressPercentage = useCallback(() => {
    if (!player.progress?.duration || player.progress.duration === 0) return 0;
    return (player.progress.current / player.progress.duration) * 100;
  }, [player.progress.current, player.progress.duration]);

  /**
   * Reproduce una canción por su ID con datos opcionales
   * @param {string} songId - ID de la canción
   * @param {Object} songData - Datos de la canción (opcional)
   * @returns {Promise} Promesa de reproducción
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
   * @param {Object} song - Objeto de canción
   * @returns {Promise} Promesa de reproducción
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
   * Avanza a la siguiente canción
   * @returns {Promise} Promesa de reproducción
   */
  const playNext = useCallback(async () => {
    log('Play next - Pendiente de implementación con playlist context');
    // TODO: Implementar con el contexto de playlist cuando esté disponible
    // Por ahora retornamos una promesa resuelta para mantener compatibilidad
    return Promise.resolve();
  }, [log]);

  /**
   * Retrocede a la canción anterior
   * @returns {Promise} Promesa de reproducción
   */
  const playPrevious = useCallback(async () => {
    log('Play previous - Pendiente de implementación con playlist context');
    // TODO: Implementar con el contexto de playlist cuando esté disponible
    return Promise.resolve();
  }, [log]);

  /**
   * Obtiene el estado de carga de la canción actual
   * @returns {Object|null} Estado de carga o null si no hay canción actual
   */
  const getCurrentSongLoadingState = useCallback(() => {
    return player.currentSong 
      ? player.getSongLoadingState(player.currentSong.id) 
      : null;
  }, [player.currentSong, player.getSongLoadingState]);

  /**
   * Verifica si una canción está siendo procesada
   * @param {string} songId - ID de la canción
   * @returns {boolean} True si está en proceso
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
   * @param {string} songId - ID de la canción a evaluar
   * @returns {Object} Estado completo para UI
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
    if (isCurrent) {
      status = player.isPlaying ? 'playing' : 'paused';
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

    // Colores para UI (estables por estado)
    const buttonColor = useMemo(() => {
      if (isLoading) return '#FF9800'; // Naranja para carga
      if (isCurrent && player.isPlaying) return '#f50057'; // Rosa para reproduciendo
      return '#00838F'; // Azul para pausada/por defecto
    }, [isLoading, isCurrent, player.isPlaying]);

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

      // UI Helpers (valores directos en lugar de funciones para evitar recreación)
      buttonColor,
      buttonIcon: isLoading ? 'loading' : (isCurrent && player.isPlaying ? 'pause' : 'play'),
      buttonTooltip: isLoading 
        ? (loadingMessage || 'Cargando...')
        : (isCurrent && player.isPlaying 
            ? 'Pausar' 
            : (isCurrent ? 'Reanudar' : 'Reproducir')),
      displayMessage: isLoading
        ? loadingMessage
        : (isCurrent && player.isPlaying 
            ? 'Reproduciendo'
            : (isCurrent ? 'Pausado' : 'Lista para reproducir')),
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

  // Estado calculado memoizado
  const isLoading = useMemo(() => {
    return player.currentSong 
      ? player.getSongLoadingState(player.currentSong.id).isLoading 
      : false;
  }, [player.currentSong, player.getSongLoadingState]);

  const status = useMemo(() => {
    return player.isPlaying ? 'playing' : isLoading ? 'loading' : 'paused';
  }, [player.isPlaying, isLoading]);

  const hasSong = !!player.currentSong;
  const isPaused = !player.isPlaying && hasSong;
  const canPlay = hasSong && !isLoading;
  const canPause = hasSong && player.isPlaying;

  const progressPercentage = getProgressPercentage();

  // Versión estable de toggle (alias)
  const toggle = useCallback(() => {
    log('Toggle play/pause');
    return player.togglePlay();
  }, [player.togglePlay, log]);

  const setVolume = useCallback((volume) => {
    log('Cambiando volumen:', volume);
    return player.changeVolume(volume);
  }, [player.changeVolume, log]);

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
    duration: player.progress.duration,
    currentTime: player.progress.current,
    progressPercentage,

    // Funciones estables con useCallback
    getSongStatus,
    formatTime,
    playSongFromCard,
    playNext,
    playPrevious,
    playSongById,
    getCurrentSongLoadingState,
    isSongBeingProcessed,

    // Aliases estables
    play: toggle,
    toggle,
    setVolume,
  };
};

// Exportar ambos hooks para compatibilidad
export { usePlayerContext as usePlayer };