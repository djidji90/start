// src/components/music/AdvancedAudioPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Slider,
  IconButton,
  Typography,
  LinearProgress,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeOff,
  VolumeDown,
  Favorite,
  FavoriteBorder,
  PlaylistPlay,
  Repeat,
  RepeatOne,
  Shuffle,
  Download,
  MoreVert,
  Close,
  Wifi,
  WifiOff,
  Cached,
  Memory,
  Speed
} from '@mui/icons-material';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import SeekBar from './SeekBar';
import NetworkStatus from './NetworkStatus';

const AdvancedAudioPlayer = () => {
  const {
    // Estado
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    isMuted,
    loop,
    shuffle,
    playlist,
    currentIndex,
    error,
    isBuffering,
    networkStatus,
    cacheStatus,
    
    // Métodos
    playSong,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    playNext,
    playPrev,
    stop,
    clearError,
    formatTime,
    
    // Métodos avanzados
    cacheCurrentSong,
    getCacheInfo,
    clearCache,
    retryConnection,
    isCacheSupported,
    cacheSize
  } = useAudioPlayer();

  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [showCacheInfo, setShowCacheInfo] = useState(false);
  const [seekPreview, setSeekPreview] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);

  // ==================== SEEK PREVIEW ====================
  
  const handleSeekPreview = (percent) => {
    setSeekPreview({
      time: (percent / 100) * duration,
      percent
    });
  };

  const handleSeekConfirm = (percent) => {
    seek(percent);
    setSeekPreview(null);
  };

  // ==================== CACHE MANAGEMENT ====================
  
  const handleCacheCurrentSong = async () => {
    if (currentSong) {
      await cacheCurrentSong();
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ==================== RENDER ====================
  
  if (!currentSong && playlist.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Selecciona una canción para comenzar
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {isCacheSupported ? `Cache disponible: ${formatBytes(cacheSize)}` : 'Cache no soportado'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Network Status Indicator */}
      <NetworkStatus 
        status={networkStatus}
        onRetry={retryConnection}
        showDetails={showNetworkInfo}
        onToggleDetails={() => setShowNetworkInfo(!showNetworkInfo)}
      />

      {/* Player Principal */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
        {/* Loading y Cache Indicators */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
          {isBuffering && (
            <CircularProgress size={16} />
          )}
          
          {cacheStatus === 'caching' && (
            <Tooltip title="Cacheando audio">
              <Cached fontSize="small" color="info" />
            </Tooltip>
          )}
          
          {cacheStatus === 'cached' && (
            <Tooltip title="Audio en cache">
              <Memory fontSize="small" color="success" />
            </Tooltip>
          )}
        </Box>

        {/* Contenido */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Cover e Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar
              sx={{ width: 60, height: 60 }}
              src={currentSong?.image}
              variant="rounded"
            >
              🎵
            </Avatar>
            
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" noWrap fontWeight="medium">
                {currentSong?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {currentSong?.artist}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                {currentSong?.genre && (
                  <Chip label={currentSong.genre} size="small" />
                )}
                
                <Tooltip title={`Cache: ${formatBytes(cacheSize)}`}>
                  <Chip 
                    icon={<Memory />} 
                    label={formatBytes(cacheSize)}
                    size="small"
                    variant="outlined"
                    onClick={() => setShowCacheInfo(true)}
                  />
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Controles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Aleatorio">
              <IconButton 
                size="small" 
                onClick={toggleShuffle}
                color={shuffle ? "primary" : "default"}
              >
                <Shuffle />
              </IconButton>
            </Tooltip>

            <IconButton onClick={playPrev} disabled={playlist.length <= 1}>
              <SkipPrevious />
            </IconButton>

            <IconButton 
              onClick={togglePlay}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton onClick={playNext} disabled={playlist.length <= 1}>
              <SkipNext />
            </IconButton>

            <Tooltip title={loop ? "Repetir una" : "Repetir todas"}>
              <IconButton 
                size="small" 
                onClick={toggleLoop}
                color={loop ? "primary" : "default"}
              >
                {loop ? <RepeatOne /> : <Repeat />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Volumen y Acciones */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleMute}>
              {isMuted ? <VolumeOff /> : volume > 0.5 ? <VolumeUp /> : <VolumeDown />}
            </IconButton>
            
            <Slider
              value={isMuted ? 0 : volume * 100}
              onChange={(e, value) => setVolume(value / 100)}
              min={0}
              max={100}
              sx={{ width: 80 }}
            />

            <IconButton onClick={(e) => setMoreMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* SeekBar Avanzado */}
        <Box sx={{ mt: 2 }}>
          <SeekBar
            progress={progress}
            duration={duration}
            onSeekPreview={handleSeekPreview}
            onSeek={handleSeekConfirm}
            seekPreview={seekPreview}
            formatTime={formatTime}
          />
          
          {/* Seek Preview Tooltip */}
          {seekPreview && (
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                bottom: '100%',
                left: `${seekPreview.percent}%`,
                transform: 'translateX(-50%)',
                bgcolor: 'background.paper',
                p: 0.5,
                borderRadius: 0.5,
                boxShadow: 1
              }}
            >
              {formatTime(seekPreview.time)}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Menu de Opciones */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
      >
        <MenuItem onClick={handleCacheCurrentSong}>
          <Cached fontSize="small" sx={{ mr: 1 }} />
          Cachear esta canción
        </MenuItem>
        
        <MenuItem onClick={() => setShowCacheInfo(true)}>
          <Memory fontSize="small" sx={{ mr: 1 }} />
          Información del cache
        </MenuItem>
        
        <MenuItem onClick={clearCache}>
          <Close fontSize="small" sx={{ mr: 1 }} />
          Limpiar cache
        </MenuItem>
      </Menu>

      {/* Dialog de Cache Info */}
      <Dialog open={showCacheInfo} onClose={() => setShowCacheInfo(false)}>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Información del Cache
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Estado del cache:
              </Typography>
              <Chip 
                label={cacheStatus.toUpperCase()} 
                color={
                  cacheStatus === 'cached' ? 'success' :
                  cacheStatus === 'caching' ? 'info' :
                  cacheStatus === 'error' ? 'error' : 'default'
                }
                size="small"
              />
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tamaño total:
              </Typography>
              <Typography variant="body1">
                {formatBytes(cacheSize)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Canciones en cache:
              </Typography>
              <Typography variant="body1">
                {getCacheInfo().itemCount || 0}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCacheInfo(false)}>
            Cerrar
          </Button>
          <Button onClick={clearCache} color="error">
            Limpiar Cache
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedAudioPlayer;