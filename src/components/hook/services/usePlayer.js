// src/audio/hooks/usePlayer.js - VERSIÓN MEJORADA CON HELPERS PARA SONGCARD
import { usePlayer as usePlayerContext } from '../../../components/PlayerContext.jsx';

/**
 * Hook de alto nivel para UI con funcionalidades adicionales
 * Abstraction sobre PlayerContext para componentes específicos de audio
 */
export const useAudioPlayer = () => {
  const player = usePlayerContext();
  
  // Funciones helper para UI
  const playNext = () => {
    console.log('[useAudioPlayer] Play next');
    // Aquí iría la lógica para siguiente canción
    // Por ahora solo es un placeholder
  };
  
  const playPrevious = () => {
    console.log('[useAudioPlayer] Play previous');
    // Aquí iría la lógica para canción anterior
  };
  
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgressPercentage = () => {
    if (!player.progress.duration || player.progress.duration === 0) return 0;
    return (player.progress.current / player.progress.duration) * 100;
  };
  
  const playSongById = async (songId, songData) => {
    if (!songId) {
      console.error('[useAudioPlayer] songId es requerido');
      return;
    }
    
    const song = songData || { 
      id: songId, 
      title: `Canción ${songId}`,
      artist: 'Artista desconocido',
      genre: 'Género',
      duration: 180
    };
    return player.playSong(song);
  };
  
  // 🔥 NUEVO: Helper para SongCard - Determinar estado de UNA canción específica
  const getSongStatus = (songId) => {
    const isCurrent = player.currentSong?.id === songId;
    const loadingState = player.getSongLoadingState(songId);
    
    // Determinar si está cargando ESTA canción específica
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
      
      // Colores para UI
      getButtonColor: () => {
        if (isLoading) return '#FF9800'; // Naranja para carga
        if (isCurrent && player.isPlaying) return '#f50057'; // Rosa para reproduciendo
        if (isCurrent && !player.isPlaying) return '#00838F'; // Azul para pausada
        return '#00838F'; // Azul por defecto
      },
      
      // Icono del botón
      getButtonIcon: () => {
        if (isLoading) return 'loading';
        if (isCurrent && player.isPlaying) return 'pause';
        return 'play';
      },
      
      // Tooltip del botón
      getButtonTooltip: () => {
        if (isLoading) return loadingMessage || 'Cargando...';
        if (isCurrent && player.isPlaying) return 'Pausar';
        if (isCurrent && !player.isPlaying) return 'Reanudar';
        return 'Reproducir';
      },
      
      // Mensaje para mostrar en la UI
      getDisplayMessage: () => {
        if (isLoading) return loadingMessage;
        if (isCurrent && player.isPlaying) return 'Reproduciendo';
        if (isCurrent && !player.isPlaying) return 'Pausado';
        return 'Lista para reproducir';
      },
      
      // Progreso para mostrar
      getDisplayProgress: () => {
        if (isLoading) return `${loadingProgress}%`;
        if (isCurrent && player.progress.duration > 0) {
          return `${formatTime(player.progress.current)} / ${formatTime(player.progress.duration)}`;
        }
        return '';
      }
    };
  };
  
  // 🔥 Función específica para reproducir desde SongCard
  const playSongFromCard = async (song) => {
    console.log('🎵 Reproduciendo desde SongCard:', {
      id: song.id,
      title: song.title,
      artist: song.artist
    });
    return player.playSong(song);
  };
  
  // Estado calculado (para compatibilidad)
  const isLoading = player.currentSong ? player.getSongLoadingState(player.currentSong.id).isLoading : false;
  const status = player.isPlaying ? 'playing' : isLoading ? 'loading' : 'paused';
  const hasSong = !!player.currentSong;
  const isPaused = !player.isPlaying && hasSong;
  const canPlay = hasSong && !isLoading;
  const canPause = hasSong && player.isPlaying;
  
  return {
    // Estado básico (del contexto)
    ...player,
    
    // Estado calculado (para compatibilidad)
    isLoading,
    status,
    hasSong,
    isPaused,
    canPlay,
    canPause,
    currentTrack: player.currentSong,
    duration: player.progress.duration,
    currentTime: player.progress.current,
    progressPercentage: getProgressPercentage(),
    
    // 🔥 Nuevas funciones específicas para SongCard
    getSongStatus,
    formatTime,
    playSongFromCard,
    
    // Funciones adicionales
    playNext,
    playPrevious,
    playSongById,
    
    // Aliases para consistencia
    play: player.togglePlay,
    toggle: player.togglePlay,
    setVolume: player.changeVolume,
    
    // 🔥 Helpers para obtener datos específicos
    getCurrentSongLoadingState: () => {
      return player.currentSong ? player.getSongLoadingState(player.currentSong.id) : null;
    },
    
    // Función para verificar si una canción está siendo procesada
    isSongBeingProcessed: (songId) => {
      const state = player.getSongLoadingState(songId);
      return state.isLoading || 
             state.stage === 'playing' || 
             state.stage === 'paused' ||
             state.stage === 'resuming';
    }
  };
};

// Exportar ambos hooks para compatibilidad
export { usePlayerContext as usePlayer };