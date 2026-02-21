// src/components/songs/SongCard.jsx - VERSIÓN CORREGIDA Y COMPATIBLE
import React, { useState, useCallback } from "react";
import { 
  Card, CardContent, CardMedia, Typography, 
  IconButton, Box, Chip, Tooltip, Menu, MenuItem, 
  ListItemIcon, ListItemText, Divider, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Drawer, Fade, CircularProgress,
  Button
} from "@mui/material";
import { 
  PlayArrow, Pause, Favorite, FavoriteBorder, 
  Download, CheckCircle, Cancel, Delete, MoreVert,
  Info, Refresh, CalendarToday, Storage as StorageIcon,
  Close as CloseIcon, Warning as WarningIcon,
  GraphicEq as QualityIcon, Speed as SpeedIcon,
  AccessTime
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAudioPlayer } from "../components/hook/services/usePlayer";
import useDownload from "../components/hook/services/useDownload";
import { useMediaQuery } from "@mui/material";

// ============================================ //
// SISTEMA DE DISEÑO
// ============================================ //
const designTokens = {
  colors: {
    primary: '#FF6B35',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    gray: {
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      800: '#1F2937'
    }
  },
  shadows: {
    card: '0 4px 20px -2px rgba(0,0,0,0.06)',
    hover: '0 12px 28px -8px rgba(0,0,0,0.12)',
    button: '0 4px 12px rgba(0,0,0,0.08)',
    drawer: '0 -8px 32px rgba(0,0,0,0.08)'
  },
  borderRadius: {
    card: 16,
    button: 999,
    menu: 12,
    dialog: 20,
    chip: 6
  },
  animation: {
    default: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
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
    getDownloadInfo: () => null
  };

  // Estados de la canción con valores por defecto
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

  // Tooltip por estado
  const getTooltipText = useCallback(() => {
    switch (primaryState) {
      case 'loading': 
        return `${songStatus?.loadingMessage || 'Cargando'} ${songStatus?.loadingProgress || 0}%`;
      case 'playing': 
        const current = player.formatTime?.(songStatus?.playbackCurrentTime || 0) || '0:00';
        const total = player.formatTime?.(songStatus?.playbackDuration || 0) || '0:00';
        return `${current} / ${total}`;
      case 'paused': 
        return 'Pausada';
      case 'downloading': 
        return `Descargando ${downloadProgress}%`;
      case 'error': 
        return `Error: ${downloadError}`;
      case 'downloaded': 
        const date = downloadInfo ? new Date(downloadInfo.downloadedAt).toLocaleDateString() : '';
        return `Descargada el ${date}`;
      default: 
        return `${song?.title || ''} · ${song?.artist || ''}`;
    }
  }, [primaryState, songStatus, downloadProgress, downloadError, downloadInfo, song, player]);

  // Determinar ícono del botón principal
  const getButtonIcon = useCallback(() => {
    if (songStatus?.isLoading || isDownloading) return null;
    if (primaryState === 'playing') return <Pause />;
    if (primaryState === 'paused') return <PlayArrow />;
    if (downloadError) return <Refresh />;
    return <PlayArrow />;
  }, [primaryState, songStatus, isDownloading, downloadError]);

  // Manejar clic en card
  const handleCardClick = useCallback((e) => {
    // Evitar que el clic en botones o menús active el card
    if (e.target.closest('button') || e.target.closest('.MuiMenu-paper')) {
      return;
    }
    handleMainButtonClick(e);
  }, []);

  // Manejar clic en botón principal
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

    if (songStatus?.isCurrent) {
      player.toggle?.();
    } else {
      await player.playSongFromCard?.(song);
    }
  }, [isDownloading, downloadError, songStatus, player, song]);

  // Handlers de descarga
  const handleDownload = useCallback(async (e) => {
    e?.stopPropagation();
    handleMenuClose();

    try {
      setSnackbar({ open: true, message: `Descargando ${song?.title}...`, severity: 'info' });
      await download.downloadSong?.(songId, song?.title, song?.artist);
      setSnackbar({ open: true, message: 'Canción descargada', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error en descarga', severity: 'error' });
    }
  }, [download, songId, song]);

  const handleCancelDownload = useCallback((e) => {
    e?.stopPropagation();
    download.cancelDownload?.(songId);
    setSnackbar({ open: true, message: 'Descarga cancelada', severity: 'info' });
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
    setSnackbar({ open: true, message: 'Eliminada del dispositivo', severity: 'success' });
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
    if (onMoreActions) {
      onMoreActions('like', { id: song?.id, liked: newLikedState });
    }
  }, [liked, onLike, onMoreActions, song?.id]);

  // Información de descarga
  const fileSize = downloadInfo ? (downloadInfo.fileSize / (1024 * 1024)).toFixed(1) : '0';
  const downloadDate = downloadInfo ? new Date(downloadInfo.downloadedAt).toLocaleString() : '';

  // URL de imagen
  const imageUrl = imageError || !song?.image_url ? "/djidji.png" : song.image_url;

  // Metadata adicional
  const bitrate = song?.bitrate || '320kbps';
  const quality = song?.quality || 'HD';

  // Si no hay canción, no renderizar
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
        onClick: () => {
          setDownloadInfoDialog(true);
          handleMenuClose();
        }
      },
      isDownloaded && {
        label: 'Eliminar del dispositivo',
        icon: <Delete fontSize="small" />,
        onClick: () => {
          setConfirmDialogOpen(true);
          handleMenuClose();
        },
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Opciones</Typography>
              <IconButton onClick={handleMenuClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            
            {menuItems.map((item, index) => (
              item.divider ? (
                <Divider key={`divider-${index}`} sx={{ my: 1.5 }} />
              ) : (
                <Box
                  key={item.label}
                  onClick={item.onClick}
                  role="menuitem"
                  tabIndex={0}
                  aria-label={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: designTokens.borderRadius.menu,
                    cursor: 'pointer',
                    color: item.color,
                    '&:hover': { bgcolor: alpha(item.color || designTokens.colors.primary, 0.04) }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: item.color }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </Box>
                  {item.progress && (
                    <Typography variant="caption" color="text.secondary">
                      {item.progress}
                    </Typography>
                  )}
                </Box>
              )
            ))}
          </Box>
        </Drawer>
      );
    }

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: designTokens.borderRadius.menu,
            minWidth: 220,
            boxShadow: designTokens.shadows.drawer,
            mt: 1
          }
        }}
      >
        {menuItems.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} sx={{ my: 1 }} />
          ) : (
            <MenuItem 
              key={item.label} 
              onClick={item.onClick}
              sx={{ py: 1.5, px: 2 }}
              aria-label={item.label}
            >
              <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              {item.progress && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  {item.progress}
                </Typography>
              )}
            </MenuItem>
          )
        ))}
      </Menu>
    );
  };

  // ============================================ //
  // RENDER DIÁLOGOS
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
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete sx={{ color: designTokens.colors.error }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Eliminar canción</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar "{song?.title}" de tu dispositivo?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleRemoveDownload} variant="contained" color="error">
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
        <DialogTitle>Información</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">{downloadInfo?.fileName || song?.title}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption">{fileSize} MB</Typography>
              <Typography variant="caption">{downloadDate}</Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );

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
          border: `1px solid ${alpha('#000', 0.1)}`,
          boxShadow: isHovered ? designTokens.shadows.hover : designTokens.shadows.card,
          transition: `all ${designTokens.animation.default}`,
          position: "relative"
        }}
      >
        {/* Barra de progreso */}
        {(songStatus?.isLoading || isDownloading) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              zIndex: 10,
              bgcolor: alpha(currentColor, 0.1)
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${songStatus?.isLoading ? songStatus?.loadingProgress || 0 : downloadProgress}%`,
                bgcolor: currentColor,
                transition: 'width 0.3s linear'
              }}
            />
          </Box>
        )}

        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height={isMobile ? 180 : 220}
            image={imageUrl}
            alt={song?.title}
            onError={() => setImageError(true)}
            sx={{
              objectFit: "cover",
              opacity: (songStatus?.isLoading || isDownloading) ? 0.7 : 1
            }}
          />

          {/* Botón principal */}
          <Tooltip title={getTooltipText()} arrow>
            <IconButton
              onClick={handleMainButtonClick}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                width: 56,
                height: 56,
                bgcolor: alpha('#FFFFFF', 0.98),
                color: currentColor,
                boxShadow: designTokens.shadows.button,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha(currentColor, 0.2)}`,
                transition: `all ${designTokens.animation.bounce}`,
                transform: isActive ? 'scale(1)' : 'scale(0.9)',
                opacity: isActive ? 1 : 0,
                '&:hover': {
                  bgcolor: '#FFFFFF',
                  transform: 'scale(1.08)'
                }
              }}
            >
              {(songStatus?.isLoading || isDownloading) ? (
                <CircularProgress
                  size={24}
                  value={songStatus?.isLoading ? songStatus?.loadingProgress || 0 : downloadProgress}
                  variant="determinate"
                  sx={{ color: currentColor }}
                />
              ) : (
                getButtonIcon()
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Contenido */}
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            {showIndex && (
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: alpha(currentColor, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Typography variant="caption" sx={{ color: currentColor, fontWeight: 600 }}>
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
                  mb: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {song?.artist}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {song?.genre && (
                  <Chip label={song.genre} size="small" />
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {player.formatTime?.(song?.duration || 0) || '0:00'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ color: "text.secondary" }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {renderMenu()}
      {renderDialogs()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(SongCard);