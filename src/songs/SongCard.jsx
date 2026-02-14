// src/components/songs/SongCard.jsx - VERSIÓN COMPLETA CON MEJORAS
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
  LinearProgress
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  VolumeUp,
  AccessTime,
  Download,
  Error as ErrorIcon
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAudioPlayer } from "../components/hook/services/usePlayer";

const SongCard = ({ song, showIndex = false, onLike, onMoreActions }) => {
  const theme = useTheme();
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Hook de audio
  const player = useAudioPlayer();

  // Estado específico de esta canción
  const songStatus = player.getSongStatus(song.id);

  // 🔥 NUEVO: Obtener texto del tooltip
  const getTooltipText = () => {
    if (songStatus.isLoading) {
      return `${songStatus.loadingMessage || 'Cargando'} (${songStatus.loadingProgress}%)`;
    }
    
    if (songStatus.isCurrent) {
      const currentTime = player.formatTime(songStatus.playbackCurrentTime);
      const duration = player.formatTime(songStatus.playbackDuration);
      
      if (songStatus.isPlaying) {
        return `▶️ Reproduciendo: ${currentTime} / ${duration}`;
      } else {
        return `⏸️ Pausada: ${currentTime} / ${duration}`;
      }
    }
    
    return `🎵 ${song.title} - ${song.artist} · ${player.formatTime(song.duration)}`;
  };

  // Determinar contenido del botón basado en estado
  const getButtonContent = () => {
    const isCurrent = songStatus.isCurrent;
    const isLoading = songStatus.isLoading;
    const isPlaying = songStatus.isPlaying;

    if (isLoading) {
      return {
        icon: <Download />,
        color: '#FF9800',
        tooltip: songStatus.loadingMessage || 'Cargando...',
        showProgress: true,
        progress: songStatus.loadingProgress,
        disabled: false,
        animation: 'spin'
      };
    }

    if (isCurrent && isPlaying) {
      return {
        icon: <Pause />,
        color: '#f50057',
        tooltip: 'Pausar',
        showProgress: true,
        progress: songStatus.playbackPercentage,
        disabled: false,
        animation: 'none'
      };
    }

    if (isCurrent && !isPlaying) {
      return {
        icon: <PlayArrow />,
        color: '#00838F',
        tooltip: 'Reanudar',
        showProgress: true,
        progress: songStatus.playbackPercentage,
        disabled: false,
        animation: 'none'
      };
    }

    return {
      icon: <PlayArrow />,
      color: theme.palette.primary.main,
      tooltip: `Reproducir: ${song.title}`,
      showProgress: false,
      progress: 0,
      disabled: false,
      animation: 'none'
    };
  };

  const buttonContent = getButtonContent();

  // Manejar clic en play/pause
  const handlePlayPause = async (e) => {
    e.stopPropagation();

    console.log('🎵 SongCard click:', {
      songId: song.id,
      songTitle: song.title,
      isCurrent: songStatus.isCurrent,
      isPlaying: songStatus.isPlaying,
      isLoading: songStatus.isLoading
    });

    if (songStatus.isCurrent) {
      player.toggle();
    } else {
      await player.playSongFromCard(song);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const newLikedState = !liked;
    setLiked(newLikedState);
    onLike?.(song.id, newLikedState);
  };

  const handleCardClick = (e) => {
    if (!e.target.closest('button')) {
      handlePlayPause(e);
    }
  };

  const formatDuration = (seconds) => {
    return player.formatTime(seconds);
  };

  // Determinar texto de estado
  const getStatusText = () => {
    if (songStatus.isLoading) {
      return `${songStatus.loadingProgress}% - ${songStatus.loadingMessage}`;
    }

    if (songStatus.isCurrent && songStatus.isPlaying) {
      return `${player.formatTime(songStatus.playbackCurrentTime)} / ${player.formatTime(songStatus.playbackDuration)}`;
    }

    if (songStatus.isCurrent && !songStatus.isPlaying) {
      return 'Pausada';
    }

    return '';
  };

  // URL de la imagen con fallback
  const imageUrl = imageError || !song.image_url ? "/djidji.png" : song.image_url;

  return (
    <Card
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 4,
        overflow: "visible",
        cursor: "pointer",
        bgcolor: songStatus.isCurrent ? alpha(buttonContent.color, 0.05) : "#FFFFFF",
        border: `2px solid ${songStatus.isCurrent ? alpha(buttonContent.color, 0.3) : '#E6F2EE'}`,
        boxShadow: songStatus.isCurrent 
          ? `0 8px 24px ${alpha(buttonContent.color, 0.15)}`
          : "0 8px 24px rgba(0,0,0,0.04)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        "&:hover": {
          transform: "translateY(-6px)",
          // 🔥 SOMBRA MEJORADA - más intensa y grande
          boxShadow: `0 20px 45px ${alpha(buttonContent.color, 0.35)}`,
          borderColor: alpha(buttonContent.color, 0.5)
        }
      }}
    >
      {/* 🔥 TOOLTIP PRINCIPAL - Toda la card */}
      <Tooltip
        title={getTooltipText()}
        placement="top"
        arrow
        enterDelay={800}
        enterNextDelay={500}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: theme.palette.grey[900],
              color: 'white',
              fontSize: '0.75rem',
              padding: '6px 12px',
              borderRadius: '6px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              '& .MuiTooltip-arrow': {
                color: theme.palette.grey[900]
              }
            }
          }
        }}
      >
        <Box sx={{ width: '100%', height: '100%' }}>
          {/* BARRA SUPERIOR: Carga o reproducción */}
          {buttonContent.showProgress && (
            <Box sx={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0,
              height: 4,
              zIndex: 10,
              borderRadius: '4px 4px 0 0'
            }}>
              <LinearProgress 
                variant="determinate" 
                value={buttonContent.progress}
                sx={{
                  height: '100%',
                  bgcolor: alpha(buttonContent.color, 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: buttonContent.color,
                    transition: songStatus.isLoading 
                      ? 'transform 0.4s linear' 
                      : 'transform 0.5s linear'
                  }
                }}
              />
            </Box>
          )}

          {/* INDICADOR DE ESTADO SUPERIOR */}
          {(songStatus.isCurrent || songStatus.isLoading) && (
            <Box
              sx={{
                position: "absolute",
                top: -8,
                left: 16,
                bgcolor: buttonContent.color,
                color: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: "12px 12px 0 0",
                fontSize: "0.7rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                zIndex: 1
              }}
            >
              {songStatus.isLoading && (
                <CircularProgress 
                  size={8} 
                  sx={{ 
                    color: "white", 
                    animation: "spin 1s linear infinite" 
                  }}
                />
              )}
              {songStatus.isLoading 
                ? (songStatus.loadingStage === 'resuming' ? 'REANUDANDO' : 
                  songStatus.loadingStage === 'fetching_url' ? 'OBTENIENDO URL' : 'CARGANDO')
                : (songStatus.isPlaying ? 'REPRODUCIENDO' : 'PAUSADA')}
            </Box>
          )}

          {/* Cover con overlays */}
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              height="220"
              image={imageUrl}
              alt={song.title}
              onError={() => setImageError(true)}
              sx={{
                objectFit: "cover",
                filter: songStatus.isLoading ? "blur(2px)" : "none",
                opacity: songStatus.isLoading ? 0.8 : 1,
                transition: "all 0.3s ease",
                backgroundColor: imageError ? alpha(theme.palette.primary.light, 0.1) : "transparent"
              }}
            />

            {/* OVERLAY DE CARGA */}
            {songStatus.isLoading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: alpha("#000000", 0.4),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1
                }}
              >
                <CircularProgress
                  size={40}
                  sx={{ 
                    color: "#FF9800",
                    animation: "spin 1s linear infinite"
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    textAlign: "center",
                    maxWidth: "80%"
                  }}
                >
                  {songStatus.loadingMessage}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha("#ffffff", 0.8),
                    fontSize: "0.7rem"
                  }}
                >
                  {songStatus.loadingProgress}%
                </Typography>
              </Box>
            )}

            {/* OVERLAY DE REPRODUCCIÓN */}
            {songStatus.isCurrent && songStatus.isPlaying && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: alpha("#f50057", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: alpha("#f50057", 0.8),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "pulse 2s infinite"
                  }}
                >
                  <VolumeUp sx={{ color: "white", fontSize: 30 }} />
                </Box>
              </Box>
            )}

            {/* 🔥 BOTÓN PLAY/PAUSE CON TOOLTIP Y SOMBRA MEJORADA */}
            <Tooltip
              title={buttonContent.tooltip}
              placement="top"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: buttonContent.color,
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    padding: '4px 8px'
                  }
                }
              }}
            >
              <IconButton
                onClick={handlePlayPause}
                disabled={buttonContent.disabled}
                sx={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  bgcolor: alpha(buttonContent.color, 0.95),
                  color: "#fff",
                  width: 56,
                  height: 56,
                  "&:hover": {
                    bgcolor: buttonContent.color,
                    transform: "scale(1.1)",
                    // 🔥 SOMBRA DEL BOTÓN MEJORADA
                    boxShadow: `0 12px 28px ${alpha(buttonContent.color, 0.5)}`,
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  // 🔥 SOMBRA BASE DEL BOTÓN MEJORADA
                  boxShadow: `0 8px 20px ${alpha(buttonContent.color, 0.4)}`,
                  animation: buttonContent.animation === 'spin' 
                    ? "spin 1s linear infinite" 
                    : "none"
                }}
              >
                {songStatus.isLoading ? (
                  <CircularProgress 
                    size={24} 
                    color="inherit" 
                    sx={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  buttonContent.icon
                )}
              </IconButton>
            </Tooltip>

            {/* BARRA INFERIOR: Progreso de reproducción */}
            {songStatus.isCurrent && songStatus.playbackDuration > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: alpha("#000000", 0.2)
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${songStatus.playbackPercentage}%`,
                    bgcolor: songStatus.isPlaying ? "#00FF9D" : buttonContent.color,
                    transition: "width 0.5s linear"
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Content */}
          <CardContent sx={{ p: 2.5, position: "relative" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              {/* Número/Índice */}
              {showIndex && (
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: songStatus.isCurrent 
                      ? alpha(buttonContent.color, 0.1) 
                      : alpha("#000000", 0.05),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: songStatus.isCurrent ? buttonContent.color : "text.secondary",
                      fontWeight: songStatus.isCurrent ? 700 : 500,
                      fontSize: "0.8rem"
                    }}
                  >
                    {showIndex}
                  </Typography>
                </Box>
              )}

              {/* Información de la canción */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: songStatus.isCurrent ? 800 : 700,
                    lineHeight: 1.2,
                    mb: 0.5,
                    color: songStatus.isCurrent ? buttonContent.color : "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical"
                  }}
                >
                  {song.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: songStatus.isCurrent ? "#006064" : "text.secondary",
                    fontWeight: songStatus.isCurrent ? 500 : 400,
                    mb: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical"
                  }}
                >
                  {song.artist}
                </Typography>

                {/* Metadatos */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {song.genre && (
                    <Chip
                      label={song.genre}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: "0.7rem",
                        borderColor: songStatus.isCurrent 
                          ? alpha(buttonContent.color, 0.3) 
                          : undefined,
                        color: songStatus.isCurrent ? buttonContent.color : undefined
                      }}
                    />
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                    <AccessTime sx={{ fontSize: 14, mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                      {formatDuration(song.duration)}
                    </Typography>
                  </Box>

                  {/* ESTADO DE CARGA O PROGRESO */}
                  {(songStatus.isCurrent || songStatus.isLoading) && (
                    <Box sx={{ ml: "auto" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.7rem",
                          color: buttonContent.color,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5
                        }}
                      >
                        {songStatus.isLoading && <Download sx={{ fontSize: 12 }} />}
                        {getStatusText()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Botón Like */}
              <Tooltip
                title={liked ? "Quitar de favoritos" : "Añadir a favoritos"}
                placement="top"
                arrow
              >
                <IconButton
                  size="small"
                  onClick={handleLike}
                  sx={{
                    color: liked ? "#FF4081" : "text.secondary",
                    "&:hover": {
                      bgcolor: alpha(liked ? "#FF4081" : buttonContent.color, 0.1),
                      transform: "scale(1.1)"
                    },
                    transition: "all 0.2s"
                  }}
                >
                  {liked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Box>
      </Tooltip>

      {/* ANIMACIONES CSS */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .song-card {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </Card>
  );
};

export default React.memo(SongCard);