// ============================================
// src/components/songs/SongCard.jsx
// ============================================

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
  VolumeUp
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAudioPlayer } from "../components/hook/services/usePlayer";  // ✅ RUTA ORIGINAL
import useDownload from "../components/hook/services/useDownload";        // ✅ RUTA ORIGINAL
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
    gray: { 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563' }
  },
  shadows: {
    card: '0 4px 20px -2px rgba(0,0,0,0.06)',
    hover: '0 12px 28px -8px rgba(0,0,0,0.12)',
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

  // Hooks
  const player = useAudioPlayer();
  const download = useDownload();

  // ============================================ //
  // ✅ ESTADO DE DESCARGA
  // ============================================ //
  const songId = song?.id?.toString();
  
  // isDownloaded es SÍNCRONO (el hook ya está corregido)
  const isDownloaded = download.isDownloaded?.(songId) || false;
  const downloadInfo = download.getDownloadInfo?.(songId);
  const isDownloading = download.downloading?.[songId];
  const downloadProgress = download.progress?.[songId] || 0;
  const downloadError = download.errors?.[songId];

  // Log para depuración
  console.log(`🎵 ${song?.title}:`, {
    isDownloaded,
    hasFileSize: !!downloadInfo?.fileSize,
    downloadInfo,
    isDownloading,
    downloadProgress
  });

  // Estados de reproducción
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
      // Opción de descarga - SIEMPRE visible si no está descargada
      !isDownloaded && !isDownloading && {
        label: 'Descargar',
        icon: <Download fontSize="small" />,
        onClick: handleDownload
      },
      
      // Si está descargando
      isDownloading && {
        label: 'Descargando...',
        icon: <CircularProgress size={16} />,
        disabled: true,
        progress: `${downloadProgress}%`
      },
      
      // Si ya está descargada
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
      
      // Separador si hay opciones de descarga
      (isDownloaded || isDownloading) && { divider: true },
      
      // Favoritos siempre visible
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
            minWidth: 240, 
            boxShadow: designTokens.shadows.drawer,
            mt: 1
          } 
        }}
      >
        {menuItems.map((item, index) => 
          item.divider ? (
            <Divider key={index} sx={{ my: 1 }} />
          ) : (
            <MenuItem 
              key={item.label} 
              onClick={item.onClick}
              disabled={item.disabled}
              sx={{ 
                py: 1.5, 
                px: 2,
                color: item.color
              }}
            >
              <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
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
  // RENDER
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
          border: `1px solid ${alpha('#000', 0.1)}`,
          boxShadow: isHovered ? designTokens.shadows.hover : designTokens.shadows.card, 
          transition: 'all 0.3s ease', 
          position: "relative",
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: alpha(currentColor, 0.3)
          }
        }}
      >
        {/* Barra de progreso */}
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
                    borderRadius: '0 2px 2px 0'
                  }
                }}
              />
            </Box>
          </Fade>
        )}

        {/* Badge de estado */}
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
                {primaryState === 'downloading' && `DESCARGANDO ${downloadProgress}%`}
                {primaryState === 'downloaded' && 'DESCARGADA'}
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
            height={isMobile ? 200 : 240} 
            image={imageError || !song?.image_url ? "/djidji.png" : song.image_url}
            alt={song?.title}
            onError={() => setImageError(true)}
            sx={{ 
              objectFit: "cover", 
              opacity: (songStatus?.isLoading || isDownloading) ? 0.5 : 1,
              transition: 'all 0.3s ease'
            }} 
          />

          {/* Botón principal */}
          <Tooltip title={
            songStatus?.isLoading ? `Cargando ${songStatus?.loadingProgress}%` :
            isDownloading ? `Descargando ${downloadProgress}%` :
            songStatus?.isPlaying ? 'Pausar' : 'Reproducir'
          } arrow>
            <Zoom in={isActive || primaryState !== 'idle'}>
              <IconButton 
                onClick={handlePlayPause}
                disabled={songStatus?.isLoading}
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
                  border: `2px solid ${alpha(currentColor, 0.2)}`,
                  transition: 'all 0.3s ease',
                  transform: isActive ? 'scale(1)' : 'scale(0.8)',
                  opacity: isActive ? 1 : 0.8,
                  '&:hover:not(:disabled)': { 
                    bgcolor: '#FFFFFF', 
                    transform: 'scale(1.1)',
                    borderColor: currentColor
                  }
                }}
              >
                {songStatus?.isLoading ? (
                  <CircularProgress size={24} sx={{ color: currentColor }} />
                ) : isDownloading ? (
                  <Box sx={{ position: 'relative', width: 24, height: 24 }}>
                    <CircularProgress size={24} value={downloadProgress} variant="determinate" />
                    <Box sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      fontSize: '0.6rem',
                      fontWeight: 700
                    }}>
                      {downloadProgress}%
                    </Box>
                  </Box>
                ) : (
                  songStatus?.isPlaying ? <Pause /> : <PlayArrow />
                )}
              </IconButton>
            </Zoom>
          </Tooltip>
        </Box>

        {/* Contenido */}
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
                flexShrink: 0
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
                        borderRadius: designTokens.borderRadius.chip
                      }} 
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {player.formatTime?.(song?.duration || 0) || '0:00'}
                    </Typography>
                  </Box>

                  {/* INFO DE DESCARGA - SOLO SI REALMENTE ESTÁ DESCARGADA */}
                  {isDownloaded && downloadInfo?.fileSize && (
                    <Tooltip title={`${(downloadInfo.fileSize / 1024 / 1024).toFixed(1)} MB`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StorageIcon sx={{ fontSize: 12, color: designTokens.colors.success }} />
                        <Typography variant="caption" sx={{ color: designTokens.colors.success, fontWeight: 600 }}>
                          {(downloadInfo.fileSize / 1024 / 1024).toFixed(1)} MB
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                {/* ACCIONES SIEMPRE VISIBLES */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* BOTÓN DE DESCARGA - SIEMPRE VISIBLE */}
                  {isDownloaded ? (
                    <Tooltip title="Descargada - Ver información">
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); setDownloadInfoDialog(true); }}
                        sx={{ 
                          color: designTokens.colors.success,
                          bgcolor: alpha(designTokens.colors.success, 0.1)
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
                            color: 'white'
                          }
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {/* Menú de 3 puntos */}
                  <IconButton 
                    size="small" 
                    onClick={handleMenuOpen}
                    sx={{ color: 'text.secondary' }}
                  >
                    <MoreVert fontSize="small" />
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
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Eliminar canción</DialogTitle>
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

      <Dialog open={downloadInfoDialog} onClose={() => setDownloadInfoDialog(false)}>
        <DialogTitle>Información</DialogTitle>
        <DialogContent>
          <Box>
            <Typography>{downloadInfo?.fileName || song?.title}</Typography>
            <Typography variant="caption">
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
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(SongCard);