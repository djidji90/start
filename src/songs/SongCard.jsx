// ============================================
// src/components/songs/SongCard.jsx
// VERSIÓN PROFESIONAL - Diseño compacto estilo Spotify
// ✅ Tamaños optimizados (180px imagen)
// ✅ Metadata mínima (solo duración)
// ✅ Espaciado profesional
// ✅ Variantes de tamaño (compact/default/detailed)
// ============================================

import React, { useState, useCallback } from "react";
import {
  Card, CardContent, CardMedia, Typography,
  IconButton, Box, Chip, Tooltip, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, CircularProgress, Button,
  LinearProgress, Fade, Zoom
} from "@mui/material";
import {
  PlayArrow, Pause, Favorite, FavoriteBorder,
  Download, CheckCircle, Delete, MoreVert,
  Info, Storage as StorageIcon,
  Warning as WarningIcon, AccessTime,
  VolumeUp
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAudioPlayer } from "../components/hook/services/usePlayer";
import useDownload from "../components/hook/services/useDownload";
import { useMediaQuery } from "@mui/material";

// ============================================ //
// SISTEMA DE DISEÑO PROFESIONAL
// ============================================ //
const designTokens = {
  colors: {
    primary: '#FF6B35',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    gray: { 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563' }
  },
  shadows: {
    card: '0 2px 8px -2px rgba(0,0,0,0.1)',
    hover: '0 8px 20px -6px rgba(0,0,0,0.15)',
    button: '0 4px 12px -2px rgba(0,0,0,0.2)',
  },
  borderRadius: {
    card: 8,      // ← Más cuadrado como Spotify
    button: 999,
    menu: 8,
    chip: 4,
  }
};

const SongCard = ({ 
  song, 
  showIndex = false, 
  onLike, 
  onMoreActions,
  variant = 'compact' // 'compact' | 'default' | 'detailed'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [downloadInfoDialog, setDownloadInfoDialog] = useState(false);

  // Hooks
  const player = useAudioPlayer();
  const download = useDownload();

  // ============================================ //
  // CONFIGURACIÓN DE VARIANTES
  // ============================================ //
  const variants = {
    compact: {
      imageHeight: isMobile ? 140 : 160,
      contentPadding: 1.2,
      showGenre: false,
      showFileSize: false,
      showDuration: true,
      titleSize: '0.9rem',
      artistSize: '0.75rem',
      metadataSize: '0.65rem',
      iconSize: 'small',
      buttonSize: 44,
      spacing: 0.3,
      chipSize: 'small'
    },
    default: {
      imageHeight: isMobile ? 160 : 180,
      contentPadding: 1.5,
      showGenre: false,
      showFileSize: false,
      showDuration: true,
      titleSize: '0.95rem',
      artistSize: '0.8rem',
      metadataSize: '0.7rem',
      iconSize: 'small',
      buttonSize: 48,
      spacing: 0.4,
      chipSize: 'small'
    },
    detailed: {
      imageHeight: isMobile ? 200 : 220,
      contentPadding: 2,
      showGenre: true,
      showFileSize: true,
      showDuration: true,
      titleSize: '1rem',
      artistSize: '0.85rem',
      metadataSize: '0.75rem',
      iconSize: 'small',
      buttonSize: 52,
      spacing: 0.5,
      chipSize: 'small'
    }
  };

  const config = variants[variant] || variants.default;

  // ============================================ //
  // ESTADO DE DESCARGA
  // ============================================ //
  const songId = song?.id?.toString();
  const isDownloaded = download.isDownloaded?.(songId) || false;
  const downloadInfo = download.getDownloadInfo?.(songId);
  const isDownloading = download.downloading?.[songId];
  const downloadProgress = download.progress?.[songId] || 0;
  const downloadError = download.errors?.[songId];
  const songStatus = player.getSongStatus?.(song.id) || {};

  // ============================================ //
  // ESTADO PRINCIPAL
  // ============================================ //
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

  // ============================================ //
  // HANDLERS
  // ============================================ //
  const handleDownload = useCallback(async (e) => {
    e?.stopPropagation();
    handleMenuClose();
    setSnackbar({ open: true, message: `📥 Descargando ${song?.title}...`, severity: 'info' });
    try {
      await download.downloadSong?.(songId, song?.title, song?.artist);
      setSnackbar({ open: true, message: '✅ Canción descargada', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `❌ ${error.message}`, severity: 'error' });
    }
  }, [download, songId, song]);

  const handleCancelDownload = useCallback((e) => {
    e?.stopPropagation();
    download.cancelDownload?.(songId);
    setSnackbar({ open: true, message: '⏹️ Descarga cancelada', severity: 'warning' });
    handleMenuClose();
  }, [download, songId]);

  const handleRemoveDownload = useCallback(() => {
    setConfirmDialogOpen(false);
    download.removeDownload?.(songId);
    setSnackbar({ open: true, message: '🗑️ Eliminada del dispositivo', severity: 'success' });
  }, [download, songId]);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLike = (e) => {
    e.stopPropagation();
    const newLikedState = !liked;
    setLiked(newLikedState);
    onLike?.(song?.id, newLikedState);
  };

  const handlePlayPause = async (e) => {
    e.stopPropagation();
    if (songStatus?.isCurrent) {
      player.toggle?.();
    } else {
      setSnackbar({ open: true, message: `Cargando ${song?.title}...`, severity: 'info' });
      await player.playSongFromCard?.(song);
      setSnackbar({ open: false });
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.MuiMenu-paper')) return;
    handlePlayPause(e);
  };

  // ============================================ //
  // RENDER MENÚ
  // ============================================ //
  const renderMenu = () => {
    const menuItems = [
      !isDownloaded && !isDownloading && {
        label: 'Descargar',
        icon: <Download fontSize="small" />,
        onClick: handleDownload
      },
      isDownloading && {
        label: 'Descargando...',
        icon: <CircularProgress size={16} />,
        disabled: true,
        progress: `${downloadProgress}%`
      },
      isDownloaded && {
        label: 'Información',
        icon: <Info fontSize="small" />,
        onClick: () => setDownloadInfoDialog(true)
      },
      isDownloaded && {
        label: 'Eliminar del dispositivo',
        icon: <Delete fontSize="small" />,
        onClick: () => setConfirmDialogOpen(true),
        color: designTokens.colors.error
      },
      (isDownloaded || isDownloading) && { divider: true },
      {
        label: liked ? 'Quitar de favoritos' : 'Añadir a favoritos',
        icon: liked ? <Favorite fontSize="small" color="error" /> : <FavoriteBorder fontSize="small" />,
        onClick: handleLike
      }
    ].filter(Boolean);

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: designTokens.borderRadius.menu,
            minWidth: 200,
            boxShadow: designTokens.shadows.hover,
            mt: 0.5
          }
        }}
      >
        {menuItems.map((item, index) =>
          item.divider ? (
            <Divider key={index} sx={{ my: 0.5 }} />
          ) : (
            <MenuItem
              key={item.label}
              onClick={item.onClick}
              disabled={item.disabled}
              sx={{ py: 1, px: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {item.progress && (
                <Typography variant="caption" sx={{ ml: 1, fontWeight: 600 }}>
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
          border: `1px solid ${alpha('#000', 0.06)}`,
          boxShadow: isHovered ? designTokens.shadows.hover : designTokens.shadows.card,
          transition: 'all 0.2s ease',
          position: "relative",
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: alpha(currentColor, 0.3),
            boxShadow: designTokens.shadows.hover,
          }
        }}
      >
        {/* Barra de progreso - SOLO visible durante carga/descarga */}
        {(songStatus?.isLoading || isDownloading) && (
          <Fade in={true}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              zIndex: 20,
            }}>
              <LinearProgress
                variant="determinate"
                value={songStatus?.isLoading ? songStatus?.loadingProgress || 0 : downloadProgress}
                sx={{
                  height: '100%',
                  bgcolor: 'transparent',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: currentColor,
                  }
                }}
              />
            </Box>
          </Fade>
        )}

        {/* Badge de estado - SOLO cuando es necesario */}
        {(primaryState !== 'idle' && primaryState !== 'downloaded') && (
          <Zoom in={true}>
            <Box sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
              bgcolor: alpha(currentColor, 0.95),
              color: 'white',
              px: 1,
              py: 0.3,
              borderRadius: designTokens.borderRadius.chip,
              fontSize: '0.6rem',
              fontWeight: 600,
              boxShadow: `0 2px 8px ${alpha(currentColor, 0.3)}`,
            }}>
              {primaryState === 'loading' && <CircularProgress size={8} sx={{ color: 'white' }} />}
              {primaryState === 'downloading' && <Download sx={{ fontSize: 10 }} />}
              {primaryState === 'playing' && <VolumeUp sx={{ fontSize: 10 }} />}
              {primaryState === 'paused' && <PlayArrow sx={{ fontSize: 10 }} />}
              {primaryState === 'error' && <WarningIcon sx={{ fontSize: 10 }} />}
              <span>
                {primaryState === 'loading' && 'CARGANDO'}
                {primaryState === 'downloading' && `${downloadProgress}%`}
                {primaryState === 'playing' && 'REPRODUCIENDO'}
                {primaryState === 'paused' && 'PAUSADA'}
                {primaryState === 'error' && 'ERROR'}
              </span>
            </Box>
          </Zoom>
        )}

        {/* Imagen */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height={config.imageHeight}
            image={imageError || !song?.image_url ? "/djidji.png" : song.image_url}
            alt={song?.title}
            onError={() => setImageError(true)}
            sx={{
              objectFit: "cover",
              opacity: (songStatus?.isLoading || isDownloading) ? 0.6 : 1,
              transition: 'opacity 0.2s ease',
            }}
          />

          {/* Botón principal - aparece en hover o cuando está activo */}
          <Tooltip
            title={
              songStatus?.isLoading ? `Cargando ${songStatus?.loadingProgress}%` :
              isDownloading ? `Descargando ${downloadProgress}%` :
              songStatus?.isPlaying ? 'Pausar' : 'Reproducir'
            }
            arrow
          >
            <Zoom in={isActive || primaryState !== 'idle'}>
              <IconButton
                onClick={handlePlayPause}
                disabled={songStatus?.isLoading}
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  width: config.buttonSize,
                  height: config.buttonSize,
                  bgcolor: alpha('#FFFFFF', 0.98),
                  color: currentColor,
                  boxShadow: designTokens.shadows.button,
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${alpha(currentColor, 0.2)}`,
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'scale(1)' : 'scale(0.8)',
                  opacity: isActive ? 1 : 0.7,
                  '&:hover:not(:disabled)': {
                    bgcolor: '#FFFFFF',
                    transform: 'scale(1.05)',
                    borderColor: currentColor,
                  }
                }}
              >
                {songStatus?.isLoading ? (
                  <CircularProgress size={20} sx={{ color: currentColor }} />
                ) : isDownloading ? (
                  <Box sx={{ position: 'relative', width: 20, height: 20 }}>
                    <CircularProgress size={20} value={downloadProgress} variant="determinate" />
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '0.5rem',
                      fontWeight: 700
                    }}>
                      {downloadProgress}%
                    </Box>
                  </Box>
                ) : (
                  songStatus?.isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />
                )}
              </IconButton>
            </Zoom>
          </Tooltip>
        </Box>

        {/* Contenido - COMPACTO Y PROFESIONAL */}
        <CardContent sx={{ p: config.contentPadding, '&:last-child': { pb: config.contentPadding } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            {showIndex && (
              <Box sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: alpha(currentColor, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mt: 0.2
              }}>
                <Typography variant="caption" sx={{ color: currentColor, fontWeight: 600, fontSize: '0.65rem' }}>
                  {showIndex}
                </Typography>
              </Box>
            )}

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {/* Título */}
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: config.titleSize,
                  lineHeight: 1.3,
                  mb: config.spacing / 2,
                  color: downloadError ? designTokens.colors.error : 'text.primary',
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {song?.title}
              </Typography>

              {/* Artista */}
              <Typography
                sx={{
                  fontSize: config.artistSize,
                  color: "text.secondary",
                  mb: config.spacing,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {song?.artist}
              </Typography>

              {/* METADATOS MÍNIMOS - Solo duración visible */}
              <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {/* Duración - SIEMPRE visible */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <AccessTime sx={{ fontSize: 10, color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ fontSize: config.metadataSize, color: 'text.secondary' }}>
                      {player.formatTime?.(song?.duration || 0) || '0:00'}
                    </Typography>
                  </Box>

                  {/* Género - SOLO en modo detailed */}
                  {config.showGenre && song?.genre && (
                    <Chip
                      label={song.genre}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        bgcolor: alpha(designTokens.colors.gray[500], 0.08),
                        borderRadius: designTokens.borderRadius.chip,
                      }}
                    />
                  )}

                  {/* Tamaño - SOLO en modo detailed y si está descargada */}
                  {config.showFileSize && isDownloaded && downloadInfo?.fileSize && (
                    <Tooltip title={`${(downloadInfo.fileSize / 1024 / 1024).toFixed(1)} MB`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <StorageIcon sx={{ fontSize: 10, color: designTokens.colors.success }} />
                        <Typography variant="caption" sx={{ fontSize: config.metadataSize, color: designTokens.colors.success }}>
                          {(downloadInfo.fileSize / 1024 / 1024).toFixed(1)} MB
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                {/* ACCIONES - Siempre visibles pero compactas */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  {/* Botón de descarga compacto */}
                  {isDownloaded ? (
                    <Tooltip title="Descargada">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); setDownloadInfoDialog(true); }}
                        sx={{
                          color: designTokens.colors.success,
                          bgcolor: alpha(designTokens.colors.success, 0.1),
                          width: 28,
                          height: 28
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  ) : isDownloading ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.3,
                      bgcolor: alpha(designTokens.colors.success, 0.1),
                      borderRadius: designTokens.borderRadius.chip,
                      px: 0.8,
                      py: 0.3
                    }}>
                      <CircularProgress size={12} value={downloadProgress} variant="determinate" />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: designTokens.colors.success, fontSize: '0.6rem' }}>
                        {downloadProgress}%
                      </Typography>
                    </Box>
                  ) : (
                    <Tooltip title="Descargar">
                      <IconButton
                        size="small"
                        onClick={handleDownload}
                        sx={{
                          color: designTokens.colors.primary,
                          bgcolor: alpha(designTokens.colors.primary, 0.1),
                          width: 28,
                          height: 28,
                          '&:hover': {
                            bgcolor: designTokens.colors.primary,
                            color: 'white'
                          }
                        }}
                      >
                        <Download sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Menú de 3 puntos */}
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{ width: 28, height: 28, color: 'text.secondary' }}
                  >
                    <MoreVert sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menú */}
      {renderMenu()}

      {/* Diálogos */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>Eliminar canción</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar "{song?.title}" de tu dispositivo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleRemoveDownload} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={downloadInfoDialog} onClose={() => setDownloadInfoDialog(false)} maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>Información</DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant="body2" fontWeight={600}>{downloadInfo?.fileName || song?.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {(downloadInfo?.fileSize / 1024 / 1024).toFixed(1)} MB
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontSize: '0.85rem' }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(SongCard);