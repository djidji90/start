// src/hooks/useAudioPlayer.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { useAudioCache } from '../../components/hook/services/useAudioCache';
import { useNetworkStatus } from '../../components/hook/services/useNetworkStatus';

export const useAudioPlayer = () => {
  // Estado principal
  const [playerState, setPlayerState] = useState({
    currentSong: null,
    isPlaying: false,
    isBuffering: false,
    volume: 0.7,
    progress: 0,
    duration: 0,
    error: null,
    playlist: [],
    currentIndex: -1,
    playbackRate: 1.0,
    isMuted: false,
    loop: false,
    shuffle: false,
    seekPosition: 0,
    networkStatus: 'online', // 'online', 'slow', 'offline'
    cacheStatus: 'idle', // 'idle', 'caching', 'cached', 'error'
  });

  // Referencias y hooks
  const howlRef = useRef(null);
  const progressInterval = useRef(null);
  const preloadTimeout = useRef(null);
  const cache = useAudioCache();
  const network = useNetworkStatus();
  
  // ==================== CACHING DE AUDIO ====================
  
  const cacheCurrentSong = useCallback(async () => {
    if (!playerState.currentSong || !cache.isSupported()) return;
    
    try {
      setPlayerState(prev => ({ ...prev, cacheStatus: 'caching' }));
      
      const song = playerState.currentSong;
      const cacheKey = `audio_${song.id}_${song.title}`;
      
      // Intentar obtener del cache primero
      const cachedAudio = await cache.getAudio(cacheKey);
      
      if (cachedAudio) {
        console.log(`🎵 Audio en cache encontrado: ${song.title}`);
        setPlayerState(prev => ({ ...prev, cacheStatus: 'cached' }));
        return cachedAudio;
      }
      
      // Si no está en cache, descargar y cachear
      console.log(`📥 Cacheando audio: ${song.title}`);
      
      const audioBlob = await fetchAudioWithProgress(
        `${process.env.REACT_APP_API_URL}/api2/songs/${song.id}/stream/`,
        (progress) => {
          console.log(`Cache progress: ${progress}%`);
        }
      );
      
      await cache.setAudio(cacheKey, audioBlob, {
        title: song.title,
        artist: song.artist,
        duration: song.duration
      });
      
      setPlayerState(prev => ({ ...prev, cacheStatus: 'cached' }));
      return audioBlob;
      
    } catch (error) {
      console.error('Error caching audio:', error);
      setPlayerState(prev => ({ ...prev, cacheStatus: 'error' }));
      return null;
    }
  }, [playerState.currentSong, cache]);

  // ==================== PRELOADING DE SIGUIENTE CANCIÓN ====================
  
  const preloadNextSong = useCallback(async () => {
    if (playerState.playlist.length === 0 || playerState.currentIndex === -1) return;
    
    const nextIndex = (playerState.currentIndex + 1) % playerState.playlist.length;
    const nextSong = playerState.playlist[nextIndex];
    
    if (!nextSong || !cache.isSupported()) return;
    
    try {
      const cacheKey = `audio_${nextSong.id}_${nextSong.title}`;
      
      // Verificar si ya está cacheado
      const isCached = await cache.hasAudio(cacheKey);
      if (isCached) return;
      
      // Preload en segundo plano
      preloadTimeout.current = setTimeout(async () => {
        console.log(`⏭️  Preloading next song: ${nextSong.title}`);
        
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api2/songs/${nextSong.id}/stream/`,
          {
            headers: { 'Range': 'bytes=0-1048576' } // Solo primeros 1MB para preview
          }
        );
        
        if (response.ok) {
          const audioBlob = await response.blob();
          await cache.setAudio(cacheKey, audioBlob, {
            title: nextSong.title,
            artist: nextSong.artist,
            duration: nextSong.duration,
            isPreview: true // Marcar como preview
          });
          
          console.log(`✅ Preload completado: ${nextSong.title}`);
        }
      }, 3000); // Esperar 3 segundos después de empezar a reproducir
      
    } catch (error) {
      console.error('Error preloading song:', error);
    }
  }, [playerState.playlist, playerState.currentIndex, cache]);

  // ==================== STREAMING CON RANGE HEADERS ====================
  
  const createHowlWithRangeSupport = useCallback((song, startPosition = 0) => {
    if (!song) return null;
    
    const streamUrl = `${process.env.REACT_APP_API_URL}/api2/songs/${song.id}/stream/`;
    
    // Verificar cache primero si estamos offline
    if (network.status === 'offline') {
      const cacheKey = `audio_${song.id}_${song.title}`;
      cache.getAudio(cacheKey).then(cachedAudio => {
        if (cachedAudio) {
          console.log('📦 Reproduciendo desde cache offline');
          // Crear URL local del blob cacheado
          const localUrl = URL.createObjectURL(cachedAudio);
          playFromUrl(localUrl, song);
        }
      });
      return null;
    }
    
    const howl = new Howl({
      src: [streamUrl],
      html5: true,
      format: ['mp3', 'aac', 'webm', 'ogg'],
      autoplay: true,
      volume: playerState.volume,
      mute: playerState.isMuted,
      rate: playerState.playbackRate,
      loop: playerState.loop,
      
      // Soporte para Range headers (seek inicial)
      onload: function() {
        if (startPosition > 0 && this.seek() !== undefined) {
          this.seek(startPosition);
        }
      },
      
      onplay: () => {
        setPlayerState(prev => ({ 
          ...prev, 
          isPlaying: true,
          isBuffering: false 
        }));
        
        // Iniciar seguimiento de progreso
        startProgressTracking();
        
        // Iniciar cache y preload en segundo plano
        cacheCurrentSong();
        preloadNextSong();
      },
      
      // ... resto de event listeners
    });
    
    return howl;
  }, [network.status, cache, playerState.volume, playerState.isMuted, playerState.playbackRate, playerState.loop]);

  // ==================== SEEK CON RANGE HEADERS ====================
  
  const seekWithRange = useCallback(async (percent) => {
    if (!howlRef.current || !playerState.currentSong) return;
    
    const newTime = (percent / 100) * playerState.duration;
    
    // Si la diferencia es grande (>30 segundos), reiniciar stream con Range
    if (Math.abs(newTime - playerState.seekPosition) > 30) {
      console.log(`⏩ Seek grande detectado: ${Math.round(newTime)}s`);
      
      // Detener reproducción actual
      howlRef.current.stop();
      
      // Crear nuevo stream con Range header
      const rangeHeader = `bytes=${Math.floor(newTime * 16000)}-`; // Aproximación: 16kbps
      
      const newHowl = new Howl({
        src: [
          `${process.env.REACT_APP_API_URL}/api2/songs/${playerState.currentSong.id}/stream/`
        ],
        html5: true,
        headers: { 'Range': rangeHeader },
        autoplay: true,
        volume: playerState.volume,
        onload: function() {
          // Ajustar tiempo exacto
          if (this.seek() !== undefined) {
            const adjustedTime = newTime - 2; // Ajuste de 2 segundos
            this.seek(Math.max(0, adjustedTime));
          }
        }
      });
      
      howlRef.current = newHowl;
      
      setPlayerState(prev => ({
        ...prev,
        seekPosition: newTime,
        progress: percent
      }));
    } else {
      // Seek normal para cambios pequeños
      howlRef.current.seek(newTime);
      setPlayerState(prev => ({
        ...prev,
        seekPosition: newTime,
        progress: percent
      }));
    }
  }, [playerState.currentSong, playerState.duration, playerState.seekPosition, playerState.volume]);

  // ==================== MANEJO DE ERRORES Y RECONEXIÓN ====================
  
  const handleNetworkError = useCallback((error) => {
    console.error('Network error:', error);
    
    setPlayerState(prev => ({
      ...prev,
      error: 'Error de conexión. Intentando reconectar...',
      isBuffering: true
    }));
    
    // Intentar reconectar después de 3 segundos
    setTimeout(() => {
      if (playerState.currentSong && !playerState.isPlaying) {
        console.log('🔄 Intentando reconexión...');
        playSong(playerState.currentSong, playerState.seekPosition);
      }
    }, 3000);
  }, [playerState.currentSong, playerState.isPlaying, playerState.seekPosition]);

  // ==================== SERVICE WORKER INTEGRATION ====================
  
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/workers/audio-cache-worker.js', {
          scope: '/',
        });
        
        console.log('✅ Service Worker registrado:', registration);
        
        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'AUDIO_CACHED') {
            console.log('🎵 Audio cacheado en SW:', event.data.key);
          }
          
          if (event.data.type === 'CACHE_STATUS') {
            setPlayerState(prev => ({
              ...prev,
              cacheStatus: event.data.status
            }));
          }
        });
        
      } catch (error) {
        console.error('Error registrando Service Worker:', error);
      }
    }
  }, []);

  // ==================== EFECTOS PRINCIPALES ====================
  
  useEffect(() => {
    registerServiceWorker();
    
    // Monitorear estado de red
    const updateNetworkStatus = (status) => {
      setPlayerState(prev => ({ ...prev, networkStatus: status }));
    };
    
    network.onStatusChange(updateNetworkStatus);
    
    return () => {
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }
      clearInterval(progressInterval.current);
      clearTimeout(preloadTimeout.current);
      network.offStatusChange(updateNetworkStatus);
    };
  }, [registerServiceWorker, network]);

  // ==================== API PÚBLICA ====================
  
  return {
    // Estado
    ...playerState,
    
    // Métodos de control
    playSong: (song, startPosition = 0) => {
      const newHowl = createHowlWithRangeSupport(song, startPosition);
      if (newHowl) {
        howlRef.current = newHowl;
        setPlayerState(prev => ({
          ...prev,
          currentSong: song,
          isBuffering: true,
          seekPosition: startPosition
        }));
      }
    },
    
    seek: seekWithRange,
    togglePlay,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleLoop,
    toggleShuffle,
    playNext,
    playPrev,
    stop,
    clearError,
    formatTime,
    
    // Métodos avanzados
    cacheCurrentSong,
    preloadNextSong,
    getCacheInfo: () => cache.getInfo(),
    clearCache: () => cache.clear(),
    retryConnection: () => {
      if (playerState.currentSong) {
        playSong(playerState.currentSong, playerState.seekPosition);
      }
    },
    
    // Network
    networkStatus: network.status,
    isOnline: network.isOnline,
    
    // Cache
    isCacheSupported: cache.isSupported(),
    cacheSize: cache.getSize(),
  };
};