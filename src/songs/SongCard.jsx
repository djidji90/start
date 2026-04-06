// src/components/songs/SongCard.jsx
// VERSIÓN CORREGIDA - SIN MODAL LOCAL
// ✅ Usa TopUpContext global para recargas
// ✅ Elimina parpadeo y conflictos

import React, { useState, useCallback, useEffect } from "react";

import {
  Card, CardContent, CardMedia, Typography,
  IconButton, Box, Chip, Tooltip, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, CircularProgress, Button,
  LinearProgress, Fade, Zoom,
} from "@mui/material";
import {
  PlayArrow, Pause, Favorite, FavoriteBorder,
  Download, CheckCircle, Delete, MoreVert,
  Info, Storage, Warning, AccessTime,
  Repeat, RepeatOne, VolumeUp
} from '@mui/icons-material';
import { useTheme, alpha } from "@mui/material/styles";
import { useAudioPlayer } from "../components/hook/services/usePlayer";
import useDownload from "../components/hook/services/useDownload";
import useLike from "../components/hook/services/useLike";
import { useMediaQuery } from "@mui/material";
import MiniComments from "../components/comments/MiniComments";
import { useSongComments } from "../components/hook/services/useSongComments";

// ========== IMPORTS DEL WALLET ==========
import useWallet from "../components/hook/useWallet";
import { usePurchase } from "../components/hook/usePurchase";
// ❌ ELIMINADO: import TopUpModal from "../components/wallet/TopUpModal";

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
    card: 8,
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
  variant = 'compact'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [downloadInfoDialog, setDownloadInfoDialog] = useState(false);
  
  // ❌ ELIMINADO: const [showTopUpModal, setShowTopUpModal] = useState(false);
  
  // Optimistic update para contador de descargas
  const [optimisticDownloads, setOptimisticDownloads] = useState(null);
  
  useEffect(() => {
    setOptimisticDownloads(null);
  }, [song?.id]);

  // Hooks existentes
  const player = useAudioPlayer();
  const download = useDownload();
  const like = useLike(
    song?.id, 
    song?.likes_count,
    song?.is_liked
  );
  const { totalCount: totalComments, isLoading: commentsLoading } = 
    useSongComments(song?.id?.toString());

  // ========== WALLET HOOKS ==========
  const { refresh: refreshBalance } = useWallet();
  const { 
    handleDownload: walletHandleDownload, 
    isPurchasing, 
    purchaseError,
    isAlreadyDownloaded,
    buttonText,
    showTopUpRequired,
    topUpInfo,
    clearPurchaseError
  } = usePurchase(song);

  // ❌ ELIMINADO: useEffect que abría el modal local
  // El modal ahora es global, manejado por TopUpContext

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
      chipSize: 'small',
      showDownloads: true,
      showLikes: true,
      showComments: true
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
      chipSize: 'small',
      showDownloads: true,
      showLikes: true,
      showComments: true
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
      chipSize: 'small',
      showDownloads: true,
      showLikes: true,
      showComments: true
    }
  };

  const config = variants[variant] || variants.default;

  // ============================================ //
  // UTILIDADES
  // ============================================ //
  const formatNumber = (count) => {
    if (!count && count !== 0) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================ //
  // ESTADOS DE DESCARGA
  // ============================================ //
  const songId = song?.id?.toString();
  const isDownloaded = download.isDownloaded?.(songId) || false;
  const downloadInfo = download.getDownloadInfo?.(songId);
  const isDownloading = download.downloading?.[songId];
  const downloadProgress = download.progress?.[songId] || 0;
  const downloadError = download.errors?.[songId];
  const songStatus = player.getSongStatus?.(song.id) || {};

  const realDownloads = song?.downloads_count || 0;
  const displayDownloads = optimisticDownloads !== null ? optimisticDownloads : realDownloads;
  const hasDownloads = displayDownloads > 0;
  const durationFormatted = formatDuration(song?.duration);

  // ============================================ //
  // ESTADO PRINCIPAL
  // ============================================ //
  const getPrimaryState = useCallback(() => {
    if (songStatus?.isLoading) return 'loading';
    if (isPurchasing) return 'purchasing';
    if (isDownloading) return 'downloading';
    if (downloadError) return 'error';
    if (isDownloaded) return 'downloaded';
    if (songStatus?.isCurrent) return songStatus?.isPlaying ? 'playing' : 'paused';
    return 'idle';
  }, [songStatus, isPurchasing, isDownloading, downloadError, isDownloaded]);

  const primaryState = getPrimaryState();
  const isActive = primaryState !== 'idle' || isHovered;

  const stateColors = {
    idle: designTokens.colors.primary,
    playing: '#F50057',
    paused: '#00838F',
    loading: designTokens.colors.warning,
    purchasing: designTokens.colors.primary,
    downloading: designTokens.colors.success,
    downloaded: designTokens.colors.success,
    error: designTokens.colors.error
  };
  const currentColor = stateColors[primaryState] || designTokens.colors.primary;

  // ============================================ //
  // HANDLERS
  // ============================================ //
  const handleLocalDownload = useCallback(async (e) => {
    e?.stopPropagation();
    handleMenuClose();
    
    setOptimisticDownloads(realDownloads + 1);
    setSnackbar({ open: true, message: `📥 Preparando descarga de ${song?.title}...`, severity: 'info' });
    
    try {
      await walletHandleDownload();
      setSnackbar({ open: true, message: '✅ Canción descargada', severity: 'success' });
    } catch (error) {
      setOptimisticDownloads(realDownloads);
      // El error ya es manejado por usePurchase (muestra modal global si es 402)
      if (error.response?.status !== 402) {
        setSnackbar({ open: true, message: `❌ ${error.message}`, severity: 'error' });
      }
    }
  }, [walletHandleDownload, song, realDownloads]);

  const handleLike = useCallback((e) => {
    e?.stopPropagation();
    like.handleLike();
  }, [like]);

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

  // ❌ ELIMINADO: handleTopUpSuccess (ahora está en TopUpContext)

  // ============================================ //
  // RENDER MENÚ
  // ============================================ //
  const renderMenu = () => {
    const menuItems = [
      !isDownloaded && !isDownloading && !isPurchasing && {
        label: 'Descargar',
        icon: <Download fontSize="small" />,
        onClick: handleLocalDownload
      },
      isPurchasing && {
        label: 'Procesando compra...',
        icon: <CircularProgress size={16} />,
        disabled: true
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
        label: like.userLiked ? 'Quitar like' : 'Dar like',
        icon: like.userLiked ? 
          <Favorite fontSize="small" color="error" /> : 
          <FavoriteBorder fontSize="small" />,
        onClick: handleLike,
        disabled: like.isToggling,
        endIcon: like.isToggling && <CircularProgress size={12} />
      },
      { divider: true },
      {
        label: 'Compartir',
        icon: <Info fontSize="small" />,
        onClick: () => setSnackbar({ open: true, message: 'Compartir no implementado', severity: 'info' })
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
        {/* Barra de progreso */}
        {(songStatus?.isLoading || isDownloading || isPurchasing) && (
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
                variant={isPurchasing ? "indeterminate" : "determinate"}
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

        {/* Badge de estado */}
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
              {primaryState === 'purchasing' && <Download sx={{ fontSize: 10 }} />}
              {primaryState === 'downloading' && <Download sx={{ fontSize: 10 }} />}
              {primaryState === 'playing' && <VolumeUp sx={{ fontSize: 10 }} />}
              {primaryState === 'paused' && <PlayArrow sx={{ fontSize: 10 }} />}
              {primaryState === 'error' && <Warning sx={{ fontSize: 10 }} />}
              <span>
                {primaryState === 'loading' && 'CARGANDO'}
                {primaryState === 'purchasing' && 'COMPRANDO'}
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
              opacity: (songStatus?.isLoading || isDownloading || isPurchasing) ? 0.6 : 1,
              transition: 'opacity 0.2s ease',
            }}
          />

          {/* Botón principal */}
          <Tooltip
            title={
              songStatus?.isLoading ? `Cargando ${songStatus?.loadingProgress}%` :
              isPurchasing ? 'Procesando compra...' :
              isDownloading ? `Descargando ${downloadProgress}%` :
              songStatus?.isPlaying ? 'Pausar' : 'Reproducir'
            }
            arrow
          >
            <Zoom in={isActive || primaryState !== 'idle'}>
              <IconButton
                onClick={handlePlayPause}
                disabled={songStatus?.isLoading || isPurchasing}
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
                ) : isPurchasing ? (
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

        {/* Contenido */}
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

              {/* METADATOS */}
              <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 0.5
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {durationFormatted && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <AccessTime sx={{ fontSize: 10, color: 'text.disabled' }} />
                      <Typography variant="caption" sx={{ fontSize: config.metadataSize, color: 'text.secondary' }}>
                        {durationFormatted}
                      </Typography>
                    </Box>
                  )}

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

                  {config.showFileSize && isDownloaded && downloadInfo?.fileSize && (
                    <Tooltip title={`${(downloadInfo.fileSize / 1024 / 1024).toFixed(1)} MB`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <Storage sx={{ fontSize: 10, color: designTokens.colors.success }} />
                        <Typography variant="caption" sx={{ fontSize: config.metadataSize, color: designTokens.colors.success }}>
                          {(downloadInfo.fileSize / 1024 / 1024).toFixed(1)} MB
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                {/* ACCIONES */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  
                  {/* 🆕 BOTÓN DE REPETIR CANCIÓN/PLAYLIST */}
                  <Tooltip title={
                    player.repeatMode === 'one' ? 'Repetir canción activado' :
                    player.repeatMode === 'all' ? 'Repetir playlist activado' :
                    'Sin repetición'
                  } arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        player.toggleRepeat?.();
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: player.repeatMode ? alpha(designTokens.colors.primary, 0.15) : '#E5E7EB',
                        color: player.repeatMode ? designTokens.colors.primary : '#6B7280',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: player.repeatMode ? alpha(designTokens.colors.primary, 0.25) : '#D1D5DB',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      {player.repeatMode === 'one' ? (
                        <RepeatOne sx={{ fontSize: 16 }} />
                      ) : (
                        <Repeat sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                  
                  {/* LIKE BUTTON */}
                  <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <Tooltip title={like.userLiked ? 'Quitar like' : 'Dar like'} arrow>
                      <IconButton
                        size="small"
                        onClick={handleLike}
                        disabled={like.isLoading || like.isToggling}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: '#E5E7EB',
                          color: like.userLiked ? designTokens.colors.error : '#6B7280',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: '#D1D5DB',
                            transform: 'scale(1.05)'
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#F3F4F6',
                            opacity: 0.7
                          }
                        }}
                      >
                        {like.isLoading || like.isToggling ? (
                          <CircularProgress size={18} sx={{ color: like.userLiked ? designTokens.colors.error : '#6B7280' }} />
                        ) : like.userLiked ? (
                          <Favorite sx={{ fontSize: 18 }} />
                        ) : (
                          <FavoriteBorder sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </Tooltip>

                    {like.likesCount > 0 && (
                      <Tooltip title={`${like.likesCount} likes`} arrow>
                        <Typography
                          variant="caption"
                          sx={{
                            position: 'absolute',
                            right: -8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#4B5563',
                            bgcolor: 'white',
                            borderRadius: '10px',
                            px: 0.5,
                            minWidth: 22,
                            textAlign: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            border: '1px solid #E5E7EB',
                            zIndex: 2
                          }}
                        >
                          {like.formatLikes(like.likesCount)}
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>

                  {/* BOTÓN DE DESCARGA/COMPRA */}
                  {isDownloaded ? (
                    <Tooltip title="Descargada">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); setDownloadInfoDialog(true); }}
                        sx={{
                          color: designTokens.colors.success,
                          bgcolor: alpha(designTokens.colors.success, 0.1),
                          width: 32,
                          height: 32,
                          position: 'relative'
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  ) : isPurchasing ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.3,
                      bgcolor: alpha(designTokens.colors.primary, 0.1),
                      borderRadius: designTokens.borderRadius.chip,
                      px: 0.8,
                      py: 0.3
                    }}>
                      <CircularProgress size={12} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: designTokens.colors.primary, fontSize: '0.6rem' }}>
                        Comprando...
                      </Typography>
                    </Box>
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
                    <Tooltip title={buttonText} arrow>
                      <IconButton
                        size="small"
                        onClick={handleLocalDownload}
                        sx={{
                          color: designTokens.colors.primary,
                          bgcolor: alpha(designTokens.colors.primary, 0.1),
                          width: 32,
                          height: 32,
                          position: 'relative',
                          '&:hover': {
                            bgcolor: designTokens.colors.primary,
                            color: 'white'
                          }
                        }}
                      >
                        <Download sx={{ fontSize: 14 }} />
                        {hasDownloads && (
                          <Typography
                            component="span"
                            sx={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              fontSize: '0.5rem',
                              fontWeight: 700,
                              bgcolor: optimisticDownloads !== null ? designTokens.colors.primary : designTokens.colors.gray[600],
                              color: 'white',
                              borderRadius: '4px',
                              px: 0.3,
                              py: 0.1,
                              lineHeight: 1.2,
                              minWidth: 12,
                              textAlign: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              zIndex: 2
                            }}
                          >
                            {formatNumber(displayDownloads)}
                          </Typography>
                        )}
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

              {/* SECCIÓN DE COMENTARIOS */}
              {config.showComments && !isDownloading && !isPurchasing && (
                <Box sx={{ mt: config.spacing }}>
                  <MiniComments songId={songId} />
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menú */}
      {renderMenu()}

      {/* Diálogo de confirmación de eliminación */}
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

      {/* Diálogo de información de descarga */}
      <Dialog open={downloadInfoDialog} onClose={() => setDownloadInfoDialog(false)} maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>Información</DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant="body2" fontWeight={600}>{downloadInfo?.fileName || song?.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {(downloadInfo?.fileSize / 1024 / 1024).toFixed(1)} MB
            </Typography>
            
            {like.likesCount > 0 && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Favorite sx={{ fontSize: 16, color: like.userLiked ? designTokens.colors.error : 'text.secondary' }} />
                <Typography variant="body2">
                  {like.likesCount} {like.likesCount === 1 ? 'like' : 'likes'}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* ❌ ELIMINADO: MODAL DE RECARGA LOCAL */}
      {/* Ahora es global, manejado por TopUpContext */}

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration || 3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontSize: '0.85rem' }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(SongCard);