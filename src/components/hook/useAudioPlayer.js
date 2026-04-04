// src/hooks/useAudioPlayer.js - VERSIÓN CORREGIDA CON REPEAT
import { useState, useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';

export const useAudioPlayer = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState(false); // false, 'one', 'all'
  const [shuffle, setShuffle] = useState(false);
  
  const howlRef = useRef(null);
  const progressInterval = useRef(null);
  
  // ==================== REPEAT CONTROL ====================
  const toggleRepeat = useCallback(() => {
    if (repeatMode === false) {
      setRepeatMode('one');
      if (howlRef.current) {
        howlRef.current.loop(true);
      }
    } else if (repeatMode === 'one') {
      setRepeatMode('all');
      if (howlRef.current) {
        howlRef.current.loop(false);
      }
    } else {
      setRepeatMode(false);
      if (howlRef.current) {
        howlRef.current.loop(false);
      }
    }
  }, [repeatMode]);
  
  // ==================== PLAYBACK CONTROL ====================
  const togglePlay = useCallback(() => {
    if (!howlRef.current) return;
    
    if (isPlaying) {
      howlRef.current.pause();
      setIsPlaying(false);
    } else {
      howlRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);
  
  const setVolume = useCallback((value) => {
    const newVolume = Math.max(0, Math.min(1, value));
    setVolumeState(newVolume);
    if (howlRef.current) {
      howlRef.current.volume(newVolume);
    }
    localStorage.setItem('player_volume', newVolume);
  }, []);
  
  const seek = useCallback((percent) => {
    if (!howlRef.current || !duration) return;
    
    const newTime = (percent / 100) * duration;
    howlRef.current.seek(newTime);
    setProgress(percent);
  }, [duration]);
  
  // ==================== PLAYLIST CONTROL ====================
  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    
    let nextIdx;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * playlist.length);
    } else {
      nextIdx = (currentIndex + 1) % playlist.length;
    }
    
    setCurrentIndex(nextIdx);
    playSong(playlist[nextIdx]);
  }, [playlist, currentIndex, shuffle]);
  
  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    
    let prevIdx;
    if (shuffle) {
      prevIdx = Math.floor(Math.random() * playlist.length);
    } else {
      prevIdx = currentIndex - 1;
      if (prevIdx < 0) prevIdx = playlist.length - 1;
    }
    
    setCurrentIndex(prevIdx);
    playSong(playlist[prevIdx]);
  }, [playlist, currentIndex, shuffle]);
  
  // ==================== CORE: PLAY SONG ====================
  const playSong = useCallback(async (song, startPosition = 0) => {
    if (!song?.id) return;
    
    // Limpiar Howl anterior
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
      clearInterval(progressInterval.current);
    }
    
    setError(null);
    setIsBuffering(true);
    
    const streamUrl = `${process.env.REACT_APP_API_URL}/api2/songs/${song.id}/stream/`;
    
    const howl = new Howl({
      src: [streamUrl],
      html5: true,
      format: ['mp3', 'aac', 'webm', 'ogg'],
      autoplay: true,
      volume: volume,
      rate: 1.0,
      loop: repeatMode === 'one', // ← REPEAT UNA CANCIÓN
      
      onload: () => {
        setIsBuffering(false);
        setDuration(howl.duration());
        setCurrentSong(song);
        
        if (startPosition > 0) {
          howl.seek(startPosition);
        }
        
        // Iniciar tracking de progreso
        if (progressInterval.current) clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
          if (howl.playing()) {
            const current = howl.seek();
            const total = howl.duration();
            if (total > 0) {
              setProgress((current / total) * 100);
            }
          }
        }, 100);
      },
      
      onplay: () => {
        setIsPlaying(true);
        setIsBuffering(false);
      },
      
      onpause: () => {
        setIsPlaying(false);
      },
      
      onend: () => {
        setIsPlaying(false);
        setProgress(0);
        
        // 🔥 LÓGICA DE REPETICIÓN MEJORADA
        if (repeatMode === 'one') {
          // Repetir misma canción (ya lo maneja loop=true)
          playSong(song);
        } else if (repeatMode === 'all' && playlist.length > 0) {
          // Siguiente canción de la playlist
          playNext();
        } else if (playlist.length > 0) {
          // Sin repeat, pero con playlist: siguiente canción
          playNext();
        } else {
          // Sin playlist: solo terminar
          setCurrentSong(null);
        }
      },
      
      onloaderror: (_, err) => {
        console.error('Error loading audio:', err);
        setError('Error al cargar el audio');
        setIsBuffering(false);
      },
      
      onplayerror: (_, err) => {
        console.error('Error playing audio:', err);
        setError('Error al reproducir');
        setIsBuffering(false);
      },
    });
    
    howlRef.current = howl;
  }, [volume, repeatMode, playlist, playNext]);
  
  // ==================== STOP ====================
  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
      setIsPlaying(false);
      setProgress(0);
    }
  }, []);
  
  // ==================== LIMPIEZA ====================
  useEffect(() => {
    const savedVolume = localStorage.getItem('player_volume');
    if (savedVolume) {
      setVolumeState(parseFloat(savedVolume));
    }
    
    return () => {
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);
  
  // ==================== API PÚBLICA ====================
  return {
    // Estado
    currentSong,
    isPlaying,
    isBuffering,
    volume,
    progress,
    duration,
    error,
    playlist,
    currentIndex,
    repeatMode,      // ← PARA SONGCARD
    shuffle,
    
    // Control básico
    playSong,
    togglePlay,
    setVolume,
    seek,
    stop,
    
    // Playlist
    setPlaylist,
    playNext,
    playPrevious,
    toggleRepeat,    // ← PARA SONGCARD
    toggleShuffle: () => setShuffle(prev => !prev),
    
    // Utilidades
    clearError: () => setError(null),
    formatTime: (seconds) => {
      if (!seconds || isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
  };
};