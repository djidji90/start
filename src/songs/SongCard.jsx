// src/components/songs/SongCard.jsx - VERSIÓN CON DESCARGA INTEGRADA
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
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  VolumeUp,
  AccessTime,
  Download,
  Error as ErrorIcon,
  CheckCircle,
  Cancel,
  Delete,
  History,
  MoreVert
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAudioPlayer } from "../components/hook/services/usePlayer";
import useDownload from "../components/hook/services/useDownload"; // 🔥 IMPORTAR EL HOOK DE DESCARGA

const SongCard = ({ song, showIndex = false, onLike, onMoreActions }) => {
  const theme = useTheme();
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Hooks
  const player = useAudioPlayer();
  const download = useDownload(); // 🔥 INSTANCIAR EL HOOK DE DESCARGA

  // Estado específico de esta canción
  const songStatus = player.getSongStatus(song.id);
  const songId = song.id.toString();

  // 🔥 NUEVO: Estados de descarga
  const isDownloading = download.downloading[songId];
  const downloadProgress = download.progress[songId] || 0;
  const downloadError = download.errors[songId];
  const isDownloaded = download.isDownloaded(songId);
  const downloadInfo = isDownloaded ? download.getDownloadInfo(songId) : null;

  // 🔥 NUEVO: Manejar menú de opciones
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 🔥 NUEVO: Manejar descarga
  const handleDownload = async (event) => {
    event.stopPropagation();
    handleMenuClose();

    try {
      setSnackbar({
        open: true,
        message: `Iniciando descarga: ${song.title}`,
        severity: 'info'
      });

      const result = await download.downloadSong(
        songId,
        song.title,
        song.artist
      );

      setSnackbar({
        open: true,
        message: `✅ Descarga completada: ${song.title}`,
        severity: 'success'
      });

      console.log('Descarga exitosa:', result);

    } catch (error) {
      setSnackbar({
        open: true,
        message: `❌ Error: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // 🔥 NUEVO: Cancelar descarga
  const handleCancelDownload = (event) => {
    event.stopPropagation();
    handleMenuClose();
    download.cancelDownload(songId);
    
    setSnackbar({
      open: true,
      message: `Descarga cancelada: ${song.title}`,
      severity: 'warning'
    });
  };

  // 🔥 NUEVO: Eliminar del historial
  const handleRemoveDownload = (event) => {
    event.stopPropagation();
    handleMenuClose();
    
    if (window.confirm(`¿Eliminar "${song.title}" del historial de descargas?`)) {
      download.removeDownload(songId);
      
      setSnackbar({
        open: true,
        message: `Eliminado del historial: ${song.title}`,
        severity: 'info'
      });
    }
  };

  // 🔥 NUEVO: Reintentar descarga con error
  const handleRetryDownload = (event) => {
    event.stopPropagation();
    handleMenuClose();
    download.clearError(songId);
    handleDownload(event);
  };

  // 🔥 NUEVO: Ver información de descarga
  const handleViewDownloadInfo = (event) => {
    event.stopPropagation();
    handleMenuClose();
    
    if (downloadInfo) {
      const fileSize = (downloadInfo.fileSize / (1024 * 1024)).toFixed(2);
      const date = new Date(downloadInfo.downloadedAt).toLocaleString();
      
      setSnackbar({
        open: true,
        message: `📁 ${downloadInfo.fileName} (${fileSize} MB) - ${date}`,
        severity: 'info'
      });
    }
  };

  // 🔥 NUEVO: Obtener texto del tooltip (actualizado)
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

    if (isDownloading) {
      return `⬇️ Descargando: ${downloadProgress}%`;
    }

    if (downloadError) {
      return `❌ Error: ${downloadError}`;
    }

    if (isDownloaded) {
      return `✅ Descargada - ${new Date(downloadInfo?.downloadedAt).toLocaleDateString()}`;
    }
    
    return `🎵 ${song.title} - ${song.artist} · ${player.formatTime(song.duration)}`;
  };

  // Determinar contenido del botón basado en estado
  const getButtonContent = () => {
    const isCurrent = songStatus.isCurrent;
    const isLoading = songStatus.isLoading;
    const isPlaying = songStatus.isPlaying;

    // Prioridad: Carga > Reproducción > Descarga
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

    if (isDownloading) {
      return {
        icon: <Download />,
        color: '#4CAF50',
        tooltip: `Descargando: ${downloadProgress}%`,
        showProgress: true,
        progress: downloadProgress,
        disabled: true,
        animation: 'spin'
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
    if (!e.target.closest('button') && !e.target.closest('.MuiMenu-paper')) {
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

    if (isDownloading) {
      return `⬇️ ${downloadProgress}%`;
    }

    if (downloadError) {
      return '❌ Error';
    }

    if (isDownloaded) {
      return '✅ Descargada';
    }

    return '';
  };

  // URL de la imagen con fallback
  const imageUrl = imageError || !song.image_url ? "/djidji.png" : song.image_url;

  // 🔥 NUEVO: Renderizar menú de opciones
  const renderOptionsMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      onClick={(e) => e.stopPropagation()}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }
      }}
    >
      {!isDownloading && !downloadError && !isDownloaded && (
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <Download fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Descargar canción</ListItemText>
        </MenuItem>
      )}

      {isDownloading && (
        <MenuItem onClick={handleCancelDownload}>
          <ListItemIcon>
            <Cancel fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Cancelar descarga</ListItemText>
          <Typography variant="caption" color="text.secondary">
            {downloadProgress}%
          </Typography>
        </MenuItem>
      )}

      {downloadError && (
        <MenuItem onClick={handleRetryDownload}>
          <ListItemIcon>
            <ErrorIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Reintentar descarga</ListItemText>
        </MenuItem>
      )}

      {isDownloaded && (
        [
          <MenuItem key="info" onClick={handleViewDownloadInfo}>
            <ListItemIcon>
              <History fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText>Información</ListItemText>
          </MenuItem>,
          <MenuItem key="remove" onClick={handleRemoveDownload}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar del historial</ListItemText>
          </MenuItem>
        ]
      )}

      {(isDownloading || downloadError || isDownloaded) && (
        <Divider />
      )}

      {isDownloaded && (
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Descargar de nuevo</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <>
      <Card
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          borderRadius: 4,
          overflow: "visible",
          cursor: "pointer",
          bgcolor: songStatus.isCurrent ? alpha(buttonContent.color, 0.05) : "#FFFFFF",
          border: `2px solid ${
            downloadError ? '#f44336' :
            isDownloaded ? '#4caf50' :
            songStatus.isCurrent ? alpha(buttonContent.color, 0.3) : '#E6F2EE'
          }`,
          boxShadow: songStatus.isCurrent 
            ? `0 8px 24px ${alpha(buttonContent.color, 0.15)}`
            : downloadError
            ? '0 8px 24px rgba(244,67,54,0.15)'
            : isDownloaded
            ? '0 8px 24px rgba(76,175,80,0.15)'
            : "0 8px 24px rgba(0,0,0,0.04)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: `0 20px 45px ${
              downloadError ? alpha('#f44336', 0.35) :
              isDownloaded ? alpha('#4caf50', 0.35) :
              alpha(buttonContent.color, 0.35)
            }`,
            borderColor: downloadError ? '#f44336' : alpha(buttonContent.color, 0.5)
          }
        }}
      >
        {/* TOOLTIP PRINCIPAL */}
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
            {/* BARRA SUPERIOR: Progreso */}
            {(buttonContent.showProgress || isDownloading) && (
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
                  value={isDownloading ? downloadProgress : buttonContent.progress}
                  sx={{
                    height: '100%',
                    bgcolor: alpha(buttonContent.color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: isDownloading ? '#4CAF50' : buttonContent.color,
                      transition: songStatus.isLoading || isDownloading
                        ? 'transform 0.4s linear' 
                        : 'transform 0.5s linear'
                    }
                  }}
                />
              </Box>
            )}

            {/* INDICADOR DE ESTADO SUPERIOR */}
            {(songStatus.isCurrent || songStatus.isLoading || isDownloading || downloadError || isDownloaded) && (
              <Box
                sx={{
                  position: "absolute",
                  top: -8,
                  left: 16,
                  bgcolor: downloadError ? '#f44336' : 
                           isDownloaded ? '#4caf50' :
                           isDownloading ? '#FF9800' :
                           buttonContent.color,
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
                {(songStatus.isLoading || isDownloading) && (
                  <CircularProgress 
                    size={8} 
                    sx={{ 
                      color: "white", 
                      animation: "spin 1s linear infinite" 
                    }}
                  />
                )}
                {downloadError ? 'ERROR' :
                 isDownloaded ? 'DESCARGADA' :
                 isDownloading ? 'DESCARGANDO' :
                 songStatus.isLoading ? 
                   (songStatus.loadingStage === 'resuming' ? 'REANUDANDO' : 
                    songStatus.loadingStage === 'fetching_url' ? 'OBTENIENDO URL' : 'CARGANDO') :
                 (songStatus.isPlaying ? 'REPRODUCIENDO' : 'PAUSADA')}
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
                  filter: songStatus.isLoading || isDownloading ? "blur(2px)" : "none",
                  opacity: songStatus.isLoading || isDownloading ? 0.8 : 1,
                  transition: "all 0.3s ease",
                  backgroundColor: imageError ? alpha(theme.palette.primary.light, 0.1) : "transparent"
                }}
              />

              {/* OVERLAY DE DESCARGA/CARGA */}
              {(songStatus.isLoading || isDownloading) && (
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
                      color: isDownloading ? "#4CAF50" : "#FF9800",
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
                    {songStatus.isLoading ? songStatus.loadingMessage : 'Descargando...'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha("#ffffff", 0.8),
                      fontSize: "0.7rem"
                    }}
                  >
                    {songStatus.isLoading ? songStatus.loadingProgress : downloadProgress}%
                  </Typography>
                </Box>
              )}

              {/* OVERLAY DE REPRODUCCIÓN */}
              {songStatus.isCurrent && songStatus.isPlaying && !songStatus.isLoading && (
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

              {/* BOTÓN PLAY/PAUSE/DOWNLOAD */}
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
                  onClick={isDownloading ? handleCancelDownload : handlePlayPause}
                  disabled={buttonContent.disabled && !isDownloading}
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
                      boxShadow: `0 12px 28px ${alpha(buttonContent.color, 0.5)}`,
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 8px 20px ${alpha(buttonContent.color, 0.4)}`,
                    animation: buttonContent.animation === 'spin' 
                      ? "spin 1s linear infinite" 
                      : "none"
                  }}
                >
                  {songStatus.isLoading || isDownloading ? (
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
              {songStatus.isCurrent && songStatus.playbackDuration > 0 && !songStatus.isLoading && (
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
                      color: downloadError ? '#f44336' :
                             isDownloaded ? '#4caf50' :
                             songStatus.isCurrent ? buttonContent.color : "text.primary",
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

                    {/* ESTADO */}
                    {getStatusText() && (
                      <Box sx={{ ml: "auto" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.7rem",
                            color: downloadError ? '#f44336' :
                                   isDownloaded ? '#4caf50' :
                                   isDownloading ? '#FF9800' :
                                   buttonContent.color,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5
                          }}
                        >
                          {isDownloading && <Download sx={{ fontSize: 12 }} />}
                          {downloadError && <ErrorIcon sx={{ fontSize: 12 }} />}
                          {isDownloaded && <CheckCircle sx={{ fontSize: 12 }} />}
                          {getStatusText()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Botón de opciones */}
                <Tooltip title="Más opciones" placement="top" arrow>
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        transform: "scale(1.1)"
                      },
                      transition: "all 0.2s"
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Box>
        </Tooltip>
      </Card>

      {/* Menú de opciones */}
      {renderOptionsMenu()}

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
    </>
  );
};

export default React.memo(SongCard);