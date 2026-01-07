// src/audio/hooks/usePlayer.js
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
    
    const song = songData || { id: songId, title: `Canción ${songId}` };
    return player.playSong(song);
  };
  
  // Estado calculado
  const status = player.isPlaying ? 'playing' : player.isLoading ? 'loading' : 'paused';
  const hasSong = !!player.currentSong;
  const isPaused = !player.isPlaying && hasSong;
  const canPlay = hasSong && !player.isLoading;
  const canPause = hasSong && player.isPlaying;
  
  return {
    // Estado básico (del contexto)
    ...player,
    
    // Estado adicional (calculado)
    status,
    hasSong,
    isPaused,
    canPlay,
    canPause,
    currentTrack: player.currentSong,
    duration: player.progress.duration,
    currentTime: player.progress.current,
    progressPercentage: getProgressPercentage(),
    
    // Funciones adicionales
    playNext,
    playPrevious,
    formatTime,
    playSongById,
    
    // Aliases para consistencia
    play: player.togglePlay,
    toggle: player.togglePlay,
    setVolume: player.changeVolume,
  };
};

// Exportar ambos hooks para compatibilidad
export { usePlayerContext as usePlayer };