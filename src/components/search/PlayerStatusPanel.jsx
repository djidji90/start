// src/components/player/PlayerStatusPanel.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  QueueMusic,
  Storage,
  Speed,
  Error as ErrorIcon,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Cached,
  Download,
  NetworkCheck,
  VolumeUp
} from '@mui/icons-material';
import { usePlayer, PlayerStatus, ErrorTypes } from '../PlayerContext';

const PlayerStatusPanel = ({ 
  compact = false,
  showDetails = true,
  showCacheStats = true,
  showQueueInfo = true,
  elevation = 1,
  onPlayClick,
  onPauseClick,
  className = ''
}) => {
  const theme = useTheme();
  const player = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const totalRequests = player.cacheStats.hits + player.cacheStats.misses;
    const cacheHitRate = totalRequests > 0 
      ? Math.round((player.cacheStats.hits / totalRequests) * 100)
      : 0;

    return {
      cacheHitRate,
      totalRequests,
      isLoading: player.status === PlayerStatus.FETCHING_URL || 
                 player.status === PlayerStatus.LOADING_AUDIO,
      isBuffering: player.status === PlayerStatus.BUFFERING,
      hasError: player.error.type !== null,
      isActive: player.currentSong !== null,
      queueSize: player.queue.length,
      progressPercent: player.progress.duration > 0 
        ? (player.progress.current / player.progress.duration) * 100
        : 0
    };
  }, [player]);

  // Color basado en estado
  const getStatusColor = () => {
    if (player.error.type) return '#f44336';
    
    switch (player.status) {
      case PlayerStatus.FETCHING_URL:
      case PlayerStatus.LOADING_AUDIO:
        return '#FF9800';
      case PlayerStatus.BUFFERING:
        return '#9C27B0';
      case PlayerStatus.PLAYING:
        return '#4CAF50';
      case PlayerStatus.PAUSED:
        return '#607D8B';
      case PlayerStatus.READY:
        return '#00BCD4';
      default:
        return '#757575';
    }
  };

  // Icono basado en estado
  const getStatusIcon = () => {
    if (player.error.type) return <ErrorIcon />;
    
    switch (player.status) {
      case PlayerStatus.FETCHING_URL:
        return <Download />;
      case PlayerStatus.LOADING_AUDIO:
        return <Download />;
      case PlayerStatus.BUFFERING:
        return <NetworkCheck />;
      case PlayerStatus.PLAYING:
        return <PlayArrow />;
      case PlayerStatus.PAUSED:
        return <Pause />;
      case PlayerStatus.READY:
        return <CheckCircle />;
      default:
        return <CheckCircle />;
    }
  };

  // Texto descriptivo del estado
  const getStatusText = () => {
    if (player.error.type) {
      return `Error: ${player.error.message || 'Desconocido'}`;
    }
    
    switch (player.status) {
      case PlayerStatus.FETCHING_URL:
        return 'Obteniendo URL de audio...';
      case PlayerStatus.LOADING_AUDIO:
        return 'Cargando audio...';
      case PlayerStatus.BUFFERING:
        return 'Buffering...';
      case PlayerStatus.PLAYING:
        return 'Reproduciendo';
      case PlayerStatus.PAUSED:
        return 'Pausado';
      case PlayerStatus.READY:
        return 'Listo para reproducir';
      default:
        return player.currentSong ? 'Canción cargada' : 'Inactivo';
    }
  };

  // Texto de la canción actual
  const getSongInfo = () => {
    if (!player.currentSong) return null;
    
    const duration = player.currentSong.duration 
      ? `${Math.floor(player.currentSong.duration / 60)}:${(player.currentSong.duration % 60).toString().padStart(2, '0')}`
      : '--:--';
    
    return `${player.currentSong.title} • ${player.currentSong.artist} • ${duration}`;
  };

  // Manejar clic en play/pause
  const handlePlayPause = () => {
    if (player.status === PlayerStatus.PLAYING) {
      player.pause();
      onPauseClick?.();
    } else if (player.currentSong && 
              (player.status === PlayerStatus.READY || 
               player.status === PlayerStatus.PAUSED)) {
      player.play();
      onPlayClick?.();
    }
  };

  // Manejar limpiar cache
  const handleClearCache = () => {
    player.clearCache();
  };

  // Auto-colapsar detalles después de error resuelto
  useEffect(() => {
    if (player.error.type && !showErrorDetails) {
      setShowErrorDetails(true);
    }
    
    if (!player.error.type && showErrorDetails) {
      const timer = setTimeout(() => setShowErrorDetails(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [player.error.type, showErrorDetails]);

  // Si está compacto y no hay actividad, no mostrar
  if (compact && !stats.isActive && !stats.hasError) {
    return null;
  }

  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();
  const statusText = getStatusText();
  const songInfo = getSongInfo();

  return (
    <Paper
      elevation={elevation}
      className={`player-status-panel ${className}`}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(statusColor, 0.2)}`,
        backgroundColor: alpha(statusColor, 0.05),
        transition: 'all 0.3s ease',
        width: '100%',
        '&:hover': {
          borderColor: alpha(statusColor, 0.3),
          boxShadow: `0 4px 20px ${alpha(statusColor, 0.1)}`
        }
      }}
    >
      {/* Header principal */}
      <Box
        sx={{
          p: compact ? 1.5 : 2,
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 1 : 2,
          cursor: showDetails ? 'pointer' : 'default',
          minHeight: compact ? 56 : 64,
          '&:hover': showDetails ? {
            backgroundColor: alpha(statusColor, 0.03)
          } : {}
        }}
        onClick={showDetails ? () => setExpanded(!expanded) : undefined}
      >
        {/* Icono de estado */}
        <Box
          sx={{
            color: statusColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: compact ? 36 : 44,
            height: compact ? 36 : 44,
            borderRadius: '12px',
            backgroundColor: alpha(statusColor, 0.1),
            flexShrink: 0,
            position: 'relative'
          }}
        >
          {statusIcon}
          
          {/* Indicador de actividad */}
          {(player.status === PlayerStatus.PLAYING || 
            player.status === PlayerStatus.BUFFERING) && (
            <Box
              sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: statusColor,
                animation: 'pulse 1.5s infinite'
              }}
            />
          )}
        </Box>

        {/* Información principal */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {player.currentSong ? (
            <>
              <Typography
                variant={compact ? "body2" : "subtitle2"}
                sx={{
                  fontWeight: 600,
                  color: statusColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.25
                }}
              >
                {player.currentSong.title}
              </Typography>
              
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {player.currentSong.artist}
                {player.currentSong.genre && ` • ${player.currentSong.genre}`}
              </Typography>
            </>
          ) : (
            <Typography
              variant={compact ? "body2" : "subtitle2"}
              sx={{
                color: statusColor,
                fontWeight: 500
              }}
            >
              {statusText}
            </Typography>
          )}

          {/* Barra de progreso */}
          {player.currentSong && player.status === PlayerStatus.PLAYING && (
            <LinearProgress
              variant="determinate"
              value={stats.progressPercent}
              sx={{
                mt: 1,
                height: 2,
                borderRadius: 1,
                backgroundColor: alpha(statusColor, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: statusColor,
                  borderRadius: 1
                }
              }}
            />
          )}
        </Box>

        {/* Controles y badges */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          flexShrink: 0 
        }}>
          {/* Badge de cache hit */}
          {showCacheStats && stats.cacheHitRate > 0 && !compact && (
            <Tooltip title={`Cache: ${stats.cacheHitRate}% hits`}>
              <Chip
                icon={<Storage fontSize="small" />}
                label={`${stats.cacheHitRate}%`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  backgroundColor: alpha('#4CAF50', 0.1),
                  color: '#2E7D32'
                }}
              />
            </Tooltip>
          )}

          {/* Badge de cola */}
          {showQueueInfo && player.queue.length > 0 && !compact && (
            <Tooltip title={`${player.queue.length} en cola`}>
              <Chip
                icon={<QueueMusic fontSize="small" />}
                label={player.queue.length}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  backgroundColor: alpha('#2196F3', 0.1),
                  color: '#1565C0'
                }}
              />
            </Tooltip>
          )}

          {/* Botón play/pause */}
          {player.currentSong && (
            <Tooltip title={
              player.status === PlayerStatus.PLAYING ? 'Pausar' : 
              player.status === PlayerStatus.PAUSED ? 'Reanudar' : 
              'Reproducir'
            }>
              <IconButton
                size={compact ? "small" : "medium"}
                onClick={handlePlayPause}
                disabled={stats.isLoading || stats.isBuffering}
                sx={{
                  color: statusColor,
                  backgroundColor: alpha(statusColor, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(statusColor, 0.2)
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                {player.status === PlayerStatus.PLAYING ? 
                  <Pause fontSize={compact ? "small" : "medium"} /> : 
                  <PlayArrow fontSize={compact ? "small" : "medium"} />
                }
              </IconButton>
            </Tooltip>
          )}

          {/* Botón expandir/colapsar */}
          {showDetails && (
            <IconButton
              size="small"
              sx={{ color: 'text.secondary' }}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Detalles expandidos */}
      <Collapse in={expanded && showDetails}>
        <Divider sx={{ borderColor: alpha(statusColor, 0.1) }} />
        
        <Box sx={{ p: 2 }}>
          {/* Sección de estado detallado */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary', 
              display: 'block', 
              mb: 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Estado del Sistema
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 1 
            }}>
              <StatItem
                label="Estado"
                value={statusText}
                color={statusColor}
                icon={statusIcon}
              />
              
              {player.currentSong && (
                <StatItem
                  label="Duración"
                  value={player.currentSong.duration 
                    ? `${Math.floor(player.currentSong.duration / 60)}:${(player.currentSong.duration % 60).toString().padStart(2, '0')}`
                    : '--:--'
                  }
                  color="#9C27B0"
                  icon={<AccessTime fontSize="small" />}
                />
              )}
              
              {player.currentSong && player.status === PlayerStatus.PLAYING && (
                <StatItem
                  label="Progreso"
                  value={`${Math.floor(player.progress.current)}s / ${Math.floor(player.progress.duration)}s`}
                  color="#4CAF50"
                  icon={<Speed fontSize="small" />}
                />
              )}
              
              <StatItem
                label="Volumen"
                value={`${Math.round(player.volume * 100)}%`}
                color="#2196F3"
                icon={<VolumeUp fontSize="small" />}
              />
            </Box>
          </Box>

          {/* Sección de cache */}
          {showCacheStats && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Cache de Audio
                </Typography>
                
                <Tooltip title="Limpiar cache">
                  <IconButton 
                    size="small" 
                    onClick={handleClearCache}
                    sx={{ color: '#4CAF50' }}
                  >
                    <Cached fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 1 
              }}>
                <StatItem
                  label="URLs en cache"
                  value={player.cacheStats.size}
                  color="#4CAF50"
                  icon={<Storage fontSize="small" />}
                />
                
                <StatItem
                  label="Cache Hits"
                  value={player.cacheStats.hits}
                  color="#4CAF50"
                  icon={<CheckCircle fontSize="small" />}
                />
                
                <StatItem
                  label="Cache Misses"
                  value={player.cacheStats.misses}
                  color="#FF9800"
                  icon={<ErrorIcon fontSize="small" />}
                />
                
                <StatItem
                  label="Tasa de Hits"
                  value={`${stats.cacheHitRate}%`}
                  color={stats.cacheHitRate > 70 ? "#4CAF50" : "#FF9800"}
                  icon={<Speed fontSize="small" />}
                />
              </Box>
            </Box>
          )}

          {/* Sección de cola */}
          {showQueueInfo && player.queue.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary', 
                display: 'block', 
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Cola de Reproducción ({player.queue.length})
              </Typography>
              
              <Box sx={{ 
                maxHeight: 120, 
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '4px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha('#000', 0.05),
                  borderRadius: '2px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha('#000', 0.2),
                  borderRadius: '2px'
                }
              }}>
                {player.queue.slice(0, 5).map((song, index) => (
                  <Box
                    key={song.id}
                    sx={{
                      p: 1,
                      mb: 0.5,
                      borderRadius: 1,
                      backgroundColor: index === 0 ? 
                        alpha('#2196F3', 0.05) : 
                        alpha('#000', 0.02),
                      border: index === 0 ? 
                        `1px solid ${alpha('#2196F3', 0.2)}` : 
                        '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary', 
                      minWidth: 20,
                      fontWeight: index === 0 ? 600 : 400
                    }}>
                      {index + 1}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.8rem'
                    }}>
                      {song.title}
                    </Typography>
                    
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      {song.artist}
                    </Typography>
                  </Box>
                ))}
                
                {player.queue.length > 5 && (
                  <Typography variant="caption" sx={{ 
                    color: 'text.secondary', 
                    display: 'block',
                    textAlign: 'center',
                    mt: 1
                  }}>
                    +{player.queue.length - 5} más en cola
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Sección de error detallada */}
          {player.error.type && showErrorDetails && (
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 1,
              backgroundColor: alpha('#f44336', 0.05),
              border: `1px solid ${alpha('#f44336', 0.2)}`
            }}>
              <Typography variant="caption" sx={{ 
                color: '#f44336', 
                display: 'block', 
                mb: 0.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Error Detallado
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <ErrorIcon sx={{ color: '#f44336', fontSize: 16, mt: 0.25 }} />
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#f44336', mb: 0.25 }}>
                    Tipo: {player.error.type}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {player.error.message}
                  </Typography>
                  
                  {player.error.original && (
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary',
                      display: 'block',
                      mt: 0.5,
                      fontFamily: 'monospace',
                      fontSize: '0.7rem'
                    }}>
                      {typeof player.error.original === 'string' 
                        ? player.error.original
                        : JSON.stringify(player.error.original, null, 2)}
                    </Typography>
                  )}
                </Box>
                
                <Tooltip title="Limpiar error">
                  <IconButton 
                    size="small" 
                    onClick={() => player.clearError()}
                    sx={{ color: '#f44336' }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}

          {/* Sección de sistema */}
          <Box sx={{ mt: 2, pt: 1, borderTop: `1px solid ${alpha('#000', 0.05)}` }}>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary', 
              display: 'block', 
              mb: 0.5
            }}>
              Sistema de Audio {player.audioEngineAvailable ? '✅' : '❌'} • 
              Stream Manager {player.streamManagerAvailable ? '✅' : '❌'}
            </Typography>
          </Box>
        </Box>
      </Collapse>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Paper>
  );
};

/* -------------------- COMPONENTES AUXILIARES -------------------- */

const StatItem = ({ label, value, color, icon }) => (
  <Box sx={{ 
    p: 1, 
    borderRadius: 1, 
    backgroundColor: alpha(color, 0.05),
    border: `1px solid ${alpha(color, 0.1)}`,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }}>
    <Box sx={{ color, display: 'flex' }}>
      {icon}
    </Box>
    
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ 
        color: 'text.secondary', 
        display: 'block',
        fontSize: '0.7rem'
      }}>
        {label}
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color, 
        fontWeight: 600,
        fontSize: '0.9rem'
      }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const AccessTime = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const Close = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

// Propiedades por defecto
PlayerStatusPanel.defaultProps = {
  compact: false,
  showDetails: true,
  showCacheStats: true,
  showQueueInfo: true,
  elevation: 1,
  className: ''
};

export default React.memo(PlayerStatusPanel);