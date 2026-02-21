// src/components/songs/SongCard.jsx - VERSIÓN HÍBRIDA PREMIUM CON FEEDBACK
import React, { useState, useCallback } from "react";
import { 
  Card, CardContent, CardMedia, Typography, 
  IconButton, Box, Chip, Tooltip, Menu, MenuItem, 
  ListItemIcon, ListItemText, Divider, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Drawer, CircularProgress, Button,
  LinearProgress, Fade, Zoom
} from "@mui/material";
import { 
  PlayArrow, Pause, Favorite, FavoriteBorder, 
  Download, CheckCircle, Cancel, Delete, MoreVert,
  Info, Refresh, CalendarToday, Storage as StorageIcon,
  Close as CloseIcon, Warning as WarningIcon, AccessTime,
  CloudDownload, CloudDone, CloudOff, VolumeUp
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAudioPlayer } from "../components/hook/services/usePlayer";
import useDownload from "../components/hook/services/useDownload";
import { useMediaQuery } from "@mui/material";

// ============================================ //
// SISTEMA DE DISEÑO MEJORADO
// ============================================ //
const designTokens = {
  colors: {
    primary: '#FF6B35',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  shadows: {
    card: '0 4px 20px -2px rgba(0,0,0,0.06)',
    hover: '0 20px 30px -10px rgba(0,0,0,0.15)',
    button: '0 8px 20px -4px rgba(0,0,0,0.15)',
    drawer: '0 -8px 32px rgba(0,0,0,0.08)'
  },
  borderRadius: {
    card: 20,
    button: 999,
    menu: 12,
    dialog: 24,
    chip: 8
  }
};

const SongCard = ({ song, showIndex = false, onLike, onMoreActions }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [downloadInfoDialog, setDownloadInfoDialog] = useState(false);

  // Hooks con manejo de errores
  const player = useAudioPlayer?.() || { 
    getSongStatus: () => ({}), 
    formatTime: (t) => t || '0:00',
    toggle: () => {},
    playSongFromCard: () => {}
  };
  
  const download = useDownload?.() || { 
    downloading: {}, 
    progress: {}, 
    errors: {},
    isDownloaded: () => false,
    getDownloadInfo: () => null,
    downloadSong: () => {},
    cancelDownload: () => {},
    clearError: () => {},
    removeDownload: () => {}
  };

  // Estados de la canción
  const songStatus = player.getSongStatus?.(song.id) || {};
  const songId = song?.id?.toString() || '';
  const isDownloading = download.downloading?.[songId];
  const downloadProgress = download.progress?.[songId] || 0;
  const downloadError = download.errors?.[songId];
  const isDownloaded = download.isDownloaded?.(songId) || false;
  const downloadInfo = isDownloaded ? download.getDownloadInfo?.(songId) : null;

  // Determinar estado principal
  const getPrimaryState = useCallback(() => {
    if (songStatus?.isLoading) return 'loading';
    if (isDownloading) return 'downloading';
    if (downloadError) return 'error';
    if (isDownloaded) return 'downloaded';
    if (songStatus?.isCurrent) return songStatus?.isPlaying ? 'playing' : 'paused';
    return 'idle';
  }, [songStatus, isDownloading, downloadError, isDownloaded]);

  const primaryState = getPrimaryState();
  const isActive = primaryState !== 'idle' || isHovered;

  // Colores por estado
  const stateColors = {
    idle: designTokens.colors.primary,
    playing: '#F50057',
    paused: '#00838F',
    loading: designTokens.colors.warning,
    downloading: designTokens.colors.success,
    downloaded: designTokens.colors.success,
    error: designTokens.colors.error
  };
  const currentColor = stateColors[primaryState] || designTokens.colors.primary;

  // Tooltip por estado (MEJORADO)
  const getTooltipText = useCallback(() => {
    switch (primaryState) {
      case 'loading': 
        return `${songStatus?.loadingMessage || 'Cargando'} ${songStatus?.loadingProgress || 0}%`;
      case 'playing': 
        const current = player.formatTime?.(songStatus?.playbackCurrentTime || 0) || '0:00';
        const total = player.formatTime?.(songStatus?.playbackDuration || 0) || '0:00';
        return `▶️ Reproduciendo: ${current} / ${total}`;
      case 'paused': 
        return '⏸️ Pausada';
      case 'downloading': 
        return `⬇️ Descargando ${downloadProgress}%`;
      case 'error': 
        return `❌ Error: ${downloadError}`;
      case 'downloaded': 
        const date = downloadInfo ? new Date(downloadInfo.downloadedAt).toLocaleDateString() : '';
        return `✅ Descargada el ${date}`;
      default: 
        return `🎵 ${song?.title || ''} · ${song?.artist || ''}`;
    }
  }, [primaryState, songStatus, downloadProgress, downloadError, downloadInfo, song, player]);

  // Handlers
  const handleCardClick = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('.MuiMenu-paper')) return;
    handleMainButtonClick(e);
  }, []);

  const handleMainButtonClick = useCallback(async (e) => {
    e.stopPropagation();
    
    if (isDownloading) {
      handleCancelDownload(e);
      return;
    }

    if (downloadError) {
      handleRetryDownload(e);
      return;
    }

    // Mostrar feedback inmediato de que se está procesando
    setSnackbar({ open: true, message: `Cargando ${song?.title}...`, severity: 'info' });
    
    if (songStatus?.isCurrent) {
      player.toggle?.();
      setSnackbar({ open: false }); // Cerrar snackbar
    } else {
      await player.playSongFromCard?.(song);
      setSnackbar({ open: false }); // Cerrar snackbar
    }
  }, [isDownloading, downloadError, songStatus, player, song]);

  // Handlers de descarga
  const handleDownload = useCallback(async (e) => {
    e?.stopPropagation();
    handleMenuClose();
    
    // Feedback inmediato
    setSnackbar({ open: true, message: `📥 Iniciando descarga: ${song?.title}`, severity: 'info' });
    
    try {
      await download.downloadSong?.(songId, song?.title, song?.artist);
      setSnackbar({ open: true, message: '✅ Canción descargada', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Error en descarga', severity: 'error' });
    }
  }, [download, songId, song]);

  const handleCancelDownload = useCallback((e) => {
    e?.stopPropagation();
    download.cancelDownload?.(songId);
    setSnackbar({ open: true, message: '⏹️ Descarga cancelada', severity: 'warning' });
    handleMenuClose();
  }, [download, songId]);

  const handleRetryDownload = useCallback((e) => {
    e?.stopPropagation();
    download.clearError?.(songId);
    handleDownload(e);
  }, [download, songId, handleDownload]);

  const handleRemoveDownload = useCallback(() => {
    setConfirmDialogOpen(false);
    download.removeDownload?.(songId);
    setSnackbar({ open: true, message: '🗑️ Eliminada del dispositivo', severity: 'success' });
  }, [download, songId]);

  // Menú
  const handleMenuOpen = useCallback((event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);
  
  const handleMenuClose = useCallback(() => setAnchorEl(null), []);

  const handleLike = useCallback((e) => {
    e.stopPropagation();
    const newLikedState = !liked;
    setLiked(newLikedState);
    onLike?.(song?.id, newLikedState);
    if (onMoreActions) onMoreActions('like', { id: song?.id, liked: newLikedState });
    
    // Feedback sutil
    setSnackbar({ 
      open: true, 
      message: newLikedState ? '❤️ Añadida a favoritos' : '💔 Eliminada de favoritos', 
      severity: 'success' 
    });
  }, [liked, onLike, onMoreActions, song?.id]);

  // Datos de descarga
  const fileSize = downloadInfo ? (downloadInfo.fileSize / (1024 * 1024)).toFixed(1) : '0';
  const downloadDate = downloadInfo ? new Date(downloadInfo.downloadedAt).toLocaleString() : '';
  const imageUrl = imageError || !song?.image_url ? "/djidji.png" : song.image_url;

  if (!song) return null;

  // ============================================ //
  // RENDER MENÚ
  // ============================================ //
  const renderMenu = () => {
    const menuItems = [
      !isDownloading && !downloadError && !isDownloaded && {
        label: 'Descargar',
        icon: <Download fontSize="small" />,
        onClick: handleDownload
      },
      isDownloading && {
        label: 'Cancelar descarga',
        icon: <Cancel fontSize="small" />,
        onClick: handleCancelDownload,
        color: designTokens.colors.error,
        progress: `${downloadProgress}%`
      },
      downloadError && {
        label: 'Reintentar',
        icon: <Refresh fontSize="small" />,
        onClick: handleRetryDownload,
        color: designTokens.colors.warning
      },
      isDownloaded && {
        label: 'Información',
        icon: <Info fontSize="small" />,
        onClick: () => { setDownloadInfoDialog(true); handleMenuClose(); }
      },
      isDownloaded && {
        label: 'Eliminar del dispositivo',
        icon: <Delete fontSize="small" />,
        onClick: () => { setConfirmDialogOpen(true); handleMenuClose(); },
        color: designTokens.colors.error
      },
      (isDownloading || downloadError || isDownloaded) && { divider: true },
      {
        label: liked ? 'Quitar de favoritos' : 'Añadir a favoritos',
        icon: liked ? <Favorite fontSize="small" color="error" /> : <FavoriteBorder fontSize="small" />,
        onClick: handleLike
      }
    ].filter(Boolean);

    if (isMobile) {
      return (
        <Drawer 
          anchor="bottom" 
          open={Boolean(anchorEl)} 
          onClose={handleMenuClose}
          PaperProps={{ 
            sx: { 
              borderTopLeftRadius: designTokens.borderRadius.dialog, 
              borderTopRightRadius: designTokens.borderRadius.dialog, 
              maxWidth: 480, 
              mx: 'auto' 
            } 
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Opciones</Typography>
              <IconButton onClick={handleMenuClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            {menuItems.map((item, index) => 
              item.divider ? (
                <Divider key={`divider-${index}`} sx={{ my: 1.5 }} />
              ) : (
                <Box 
                  key={item.label} 
                  onClick={item.onClick} 
                  role="menuitem"
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2, 
                    borderRadius: designTokens.borderRadius.menu, 
                    cursor: 'pointer', 
                    color: item.color,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      bgcolor: alpha(item.color || designTokens.colors.primary, 0.08),
                      transform: 'translateX(4px)'
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: item.color }}>{item.icon}</ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{ fontWeight: 500 }} 
                    />
                  </Box>
                  {item.progress && (
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {item.progress}
                    </Typography>
                  )}
                </Box>
              )
            )}
          </Box>
        </Drawer>
      );
    }

    return (
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleMenuClose}
        PaperProps={{ 
          sx: { 
            borderRadius: designTokens.borderRadius.menu, 
            minWidth: 240, 
            boxShadow: designTokens.shadows.drawer, 
            mt: 1,
            overflow: 'hidden'
          } 
        }}
      >
        {menuItems.map((item, index) => 
          item.divider ? (
            <Divider key={`divider-${index}`} sx={{ my: 1 }} />
          ) : (
            <MenuItem 
              key={item.label} 
              onClick={item.onClick} 
              sx={{ 
                py: 1.5, 
                px: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(item.color || designTokens.colors.primary, 0.08),
                  pl: 3
                }
              }}
            >
              <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 500 }} 
              />
              {item.progress && (
                <Typography variant="caption" sx={{ ml: 2, fontWeight: 600 }}>
                  {item.progress}
                </Typography>
              )}
            </MenuItem>
          )
        )}
      </Menu>
    );
  };

  // ============================================ //
  // DIÁLOGOS
  // ============================================ //
  const renderDialogs = () => (
    <>
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{ 
          sx: { 
            borderRadius: designTokens.borderRadius.dialog, 
            maxWidth: 400, 
            p: 2 
          } 
        }}
      >
        <DialogTitle sx={{ p: 0, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              bgcolor: alpha(designTokens.colors.error, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Delete sx={{ color: designTokens.colors.error, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Eliminar canción</Typography>
              <Typography variant="caption" color="text.secondary">Esta acción no se puede deshacer</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, pb: 3 }}>
          <DialogContentText>
            ¿Eliminar <strong>"{song?.title}"</strong> de tu dispositivo? Podrás volver a descargarla cuando quieras.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 0, gap: 1 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ borderRadius: designTokens.borderRadius.button }}
          >
            Cancelar
          </Button>
          <Button 
            fullWidth 
            variant="contained" 
            color="error" 
            onClick={handleRemoveDownload}
            sx={{ 
              borderRadius: designTokens.borderRadius.button,
              boxShadow: `0 8px 16px -4px ${alpha(designTokens.colors.error, 0.3)}`
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={downloadInfoDialog} 
        onClose={() => setDownloadInfoDialog(false)}
        PaperProps={{ 
          sx: { 
            borderRadius: designTokens.borderRadius.dialog, 
            maxWidth: 400 
          } 
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Información de descarga</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(designTokens.colors.success, 0.05), 
              borderRadius: designTokens.borderRadius.chip,
              border: `1px solid ${alpha(designTokens.colors.success, 0.1)}`
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{downloadInfo?.fileName || song?.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StorageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{fileSize} MB</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{downloadDate}</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );

  // ============================================ //
  // RENDER PRINCIPAL
  // ============================================ //
  return (
    <>
      <Card 
        onClick={handleCardClick} 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
        sx={{ 
          borderRadius: designTokens.borderRadius.card, 
          overflow: "hidden", 
          cursor: "pointer", 
          bgcolor: "#FFFFFF", 
          border: `1px solid ${alpha(designTokens.colors.gray[300], 0.2)}`,
          boxShadow: isHovered ? designTokens.shadows.hover : designTokens.shadows.card, 
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          position: "relative",
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: alpha(currentColor, 0.3)
          }
        }}
      >
        {/* BARRA DE PROGRESO SUPERIOR (para descarga/carga) */}
        {(songStatus?.isLoading || isDownloading) && (
          <Fade in={true}>
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              zIndex: 20,
              bgcolor: alpha(currentColor, 0.1)
            }}>
              <LinearProgress
                variant="determinate"
                value={songStatus?.isLoading ? songStatus?.loadingProgress || 0 : downloadProgress}
                sx={{
                  height: '100%',
                  bgcolor: 'transparent',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: currentColor,
                    backgroundImage: `linear-gradient(90deg, ${alpha(currentColor, 0.8)} 0%, ${currentColor} 100%)`,
                    borderRadius: '0 2px 2px 0'
                  }
                }}
              />
            </Box>
          </Fade>
        )}

        {/* BADGE DE ESTADO SUPERIOR (visible siempre) */}
        {(primaryState !== 'idle') && (
          <Zoom in={true}>
            <Box sx={{ 
              position: 'absolute', 
              top: 12, 
              left: 12, 
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: alpha(currentColor, 0.95),
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: designTokens.borderRadius.chip,
              fontSize: '0.7rem',
              fontWeight: 700,
              boxShadow: `0 4px 12px ${alpha(currentColor, 0.3)}`,
              backdropFilter: 'blur(4px)'
            }}>
              {primaryState === 'loading' && <CircularProgress size={10} sx={{ color: 'white' }} />}
              {primaryState === 'downloading' && <Download sx={{ fontSize: 12 }} />}
              {primaryState === 'downloaded' && <CheckCircle sx={{ fontSize: 12 }} />}
              {primaryState === 'playing' && <VolumeUp sx={{ fontSize: 12 }} />}
              {primaryState === 'paused' && <PlayArrow sx={{ fontSize: 12 }} />}
              {primaryState === 'error' && <WarningIcon sx={{ fontSize: 12 }} />}
              <span>
                {primaryState === 'loading' && 'CARGANDO'}
                {primaryState === 'downloading' && 'DESCARGANDO'}
                {primaryState === 'downloaded' && 'DESCARGADA'}
                {primaryState === 'playing' && 'REPRODUCIENDO'}
                {primaryState === 'paused' && 'PAUSADA'}
                {primaryState === 'error' && 'ERROR'}
              </span>
            </Box>
          </Zoom>
        )}

        <Box sx={{ position: "relative" }}>
          <CardMedia 
            component="img" 
            height={isMobile ? 200 : 240} 
            image={imageUrl} 
            alt={song?.title}
            onError={() => setImageError(true)}
            sx={{ 
              objectFit: "cover", 
              opacity: (songStatus?.isLoading || isDownloading) ? 0.5 : 1,
              filter: (songStatus?.isLoading || isDownloading) ? 'brightness(0.7)' : 'none',
              transition: 'all 0.3s ease'
            }} 
          />

          {/* OVERLAY DE CARGA (para feedback claro) */}
          {(songStatus?.isLoading) && (
            <Fade in={true}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha('#000', 0.5),
                backdropFilter: 'blur(2px)',
                zIndex: 10
              }}>
                <CircularProgress size={48} sx={{ color: 'white', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Cargando {songStatus?.loadingProgress || 0}%
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
                  {songStatus?.loadingMessage || 'Preparando reproducción...'}
                </Typography>
              </Box>
            </Fade>
          )}

          {/* OVERLAY DE REPRODUCCIÓN (cuando está sonando) */}
          {primaryState === 'playing' && !songStatus?.isLoading && (
            <Fade in={true}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha('#F50057', 0.1),
                backdropFilter: 'blur(1px)',
                zIndex: 5
              }}>
                <Box sx={{ 
                  display: 'flex',
                  gap: 0.5,
                  '& span': {
                    width: 8,
                    height: 24,
                    bgcolor: '#F50057',
                    borderRadius: 4,
                    animation: 'playing 1s ease-in-out infinite',
                    transformOrigin: 'center'
                  },
                  '& span:nth-of-type(2)': { animationDelay: '0.2s' },
                  '& span:nth-of-type(3)': { animationDelay: '0.4s' },
                  '& span:nth-of-type(4)': { animationDelay: '0.3s' },
                  '& span:nth-of-type(5)': { animationDelay: '0.1s' },
                  '@keyframes playing': {
                    '0%, 100%': { transform: 'scaleY(0.5)' },
                    '50%': { transform: 'scaleY(1.5)' }
                  }
                }}>
                  <span /><span /><span /><span /><span />
                </Box>
              </Box>
            </Fade>
          )}

          {/* BOTÓN PRINCIPAL (mejorado) */}
          <Tooltip title={getTooltipText()} arrow placement="top">
            <Zoom in={isActive || primaryState !== 'idle'}>
              <IconButton 
                onClick={handleMainButtonClick}
                disabled={songStatus?.isLoading}
                sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  right: 16, 
                  width: 60, 
                  height: 60,
                  bgcolor: alpha('#FFFFFF', 0.98), 
                  color: currentColor, 
                  boxShadow: designTokens.shadows.button,
                  backdropFilter: 'blur(8px)', 
                  border: `2px solid ${alpha(currentColor, 0.2)}`,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isActive ? 'scale(1)' : 'scale(0.8)',
                  opacity: isActive ? 1 : 0.8,
                  '&:hover:not(:disabled)': { 
                    bgcolor: '#FFFFFF', 
                    transform: 'scale(1.1)',
                    borderColor: currentColor,
                    boxShadow: `0 12px 28px ${alpha(currentColor, 0.4)}`
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    bgcolor: alpha('#FFFFFF', 0.9)
                  }
                }}
              >
                {(songStatus?.isLoading) ? (
                  <CircularProgress size={28} sx={{ color: currentColor }} />
                ) : isDownloading ? (
                  <Box sx={{ position: 'relative', width: 28, height: 28 }}>
                    <CircularProgress 
                      size={28} 
                      value={downloadProgress} 
                      variant="determinate" 
                      sx={{ color: currentColor, position: 'absolute' }} 
                    />
                    <Box sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {downloadProgress}%
                    </Box>
                  </Box>
                ) : (
                  {
                    'playing': <Pause sx={{ fontSize: 32 }} />,
                    'paused': <PlayArrow sx={{ fontSize: 32 }} />,
                    'error': <Refresh sx={{ fontSize: 32 }} />,
                    'downloaded': <PlayArrow sx={{ fontSize: 32 }} />,
                    'idle': <PlayArrow sx={{ fontSize: 32 }} />
                  }[primaryState] || <PlayArrow sx={{ fontSize: 32 }} />
                )}
              </IconButton>
            </Zoom>
          </Tooltip>

          {/* BARRA DE PROGRESO DE REPRODUCCIÓN (inferior) */}
          {songStatus?.isCurrent && songStatus?.playbackDuration > 0 && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: alpha('#000', 0.1),
              zIndex: 10
            }}>
              <Box sx={{ 
                height: '100%', 
                width: `${songStatus.playbackPercentage || 0}%`, 
                bgcolor: primaryState === 'playing' ? '#00FF9D' : currentColor,
                transition: 'width 0.3s linear',
                boxShadow: `0 0 8px ${alpha(primaryState === 'playing' ? '#00FF9D' : currentColor, 0.5)}`
              }} />
            </Box>
          )}
        </Box>

        {/* CONTENIDO */}
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            {showIndex && (
              <Box sx={{ 
                width: 28, 
                height: 28, 
                borderRadius: "50%", 
                bgcolor: alpha(currentColor, 0.1),
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexShrink: 0,
                border: `1px solid ${alpha(currentColor, 0.2)}`
              }}>
                <Typography variant="caption" sx={{ color: currentColor, fontWeight: 700 }}>
                  {showIndex}
                </Typography>
              </Box>
            )}

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 700, 
                  lineHeight: 1.2, 
                  mb: 0.5,
                  color: downloadError ? designTokens.colors.error : 'text.primary',
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}
              >
                {song?.title}
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "text.secondary", 
                  mb: 1.5,
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}
              >
                {song?.artist}
              </Typography>

              {/* METADATOS + ACCIONES */}
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {song?.genre && (
                    <Chip 
                      label={song.genre} 
                      size="small" 
                      sx={{ 
                        height: 24, 
                        fontSize: '0.7rem',
                        bgcolor: alpha(designTokens.colors.gray[500], 0.08),
                        borderRadius: designTokens.borderRadius.chip,
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {player.formatTime?.(song?.duration || 0) || '0:00'}
                    </Typography>
                  </Box>

                  {/* Indicador de tamaño si está descargada */}
                  {isDownloaded && (
                    <Tooltip title={`${fileSize} MB - ${downloadDate}`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StorageIcon sx={{ fontSize: 12, color: designTokens.colors.success }} />
                        <Typography variant="caption" sx={{ color: designTokens.colors.success, fontWeight: 600 }}>
                          {fileSize} MB
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                {/* ACCIONES DE DESCARGA - MUY VISIBLES */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isDownloaded ? (
                    <Tooltip title="Descargada - Ver información">
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); setDownloadInfoDialog(true); }}
                        sx={{ 
                          color: designTokens.colors.success,
                          bgcolor: alpha(designTokens.colors.success, 0.1),
                          '&:hover': { bgcolor: alpha(designTokens.colors.success, 0.2) }
                        }}
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : isDownloading ? (
                    <Tooltip title={`Descargando ${downloadProgress}%`}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        bgcolor: alpha(designTokens.colors.success, 0.1),
                        borderRadius: designTokens.borderRadius.chip,
                        px: 1,
                        py: 0.5
                      }}>
                        <CircularProgress size={16} value={downloadProgress} variant="determinate" />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: designTokens.colors.success }}>
                          {downloadProgress}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Descargar canción">
                      <IconButton 
                        size="small" 
                        onClick={handleDownload}
                        sx={{ 
                          color: designTokens.colors.primary,
                          bgcolor: alpha(designTokens.colors.primary, 0.1),
                          '&:hover': { 
                            bgcolor: designTokens.colors.primary,
                            color: 'white',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {/* Menú de 3 puntos */}
                  <Tooltip title="Más opciones">
                    <IconButton 
                      size="small" 
                      onClick={handleMenuOpen}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha(designTokens.colors.primary, 0.1) }
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {renderMenu()}
      {renderDialogs()}

      {/* SNACKBAR MEJORADO */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            borderRadius: designTokens.borderRadius.button,
            boxShadow: designTokens.shadows.drawer,
            fontWeight: 500,
            '& .MuiAlert-icon': { alignItems: 'center' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ANIMACIONES GLOBALES */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default React.memo(SongCard);