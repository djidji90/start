// src/songs/UserDownloads.jsx
// ✅ VERSIÓN DEFINITIVA - SIN BUCLE INFINITO
// ============================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  IconButton,
  Tooltip,
  alpha,
  Grid,
  Chip,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Stack,
  Skeleton,
  Avatar
} from "@mui/material";
import {
  Download as DownloadIcon,
  DeleteSweep as DeleteSweepIcon,
  PlayArrow as PlayArrowIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  FolderOff as FolderOffIcon,
  Shuffle as ShuffleIcon,
  QueueMusic as QueueMusicIcon,
  CloudOff as CloudOffIcon
} from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../components/PlayerContext';
import SongCard from "./SongCard";
import useDownload from "../components/hook/services/useDownload";

// ============================================
// SKELETON LOADER
// ============================================
const DownloadsSkeleton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const columns = isMobile ? 2 : 5;
  
  return (
    <Grid container spacing={1.5}>
      {[...Array(columns * 2)].map((_, i) => (
        <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
          <Skeleton variant="text" width="60%" />
        </Grid>
      ))}
    </Grid>
  );
};

// ============================================
// HEADER PREMIUM
// ============================================
const PremiumHeader = ({ downloadedSongs, totalSize, onPlayAll, onShuffle, onDeleteAll }) => {
  const theme = useTheme();
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 48,
                  height: 48,
                  borderRadius: 2
                }}
              >
                <DownloadIcon />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Mis Descargas
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Tus canciones disponibles sin conexión
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<StorageIcon sx={{ fontSize: 16 }} />}
              label={`${formatBytes(totalSize)}`}
              size="medium"
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                fontWeight: 600,
                borderRadius: 2
              }}
            />
            
            <Chip
              icon={<QueueMusicIcon sx={{ fontSize: 16 }} />}
              label={`${downloadedSongs.length} canciones`}
              size="medium"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                borderRadius: 2
              }}
            />

            {downloadedSongs.length > 0 && (
              <>
                <Tooltip title="Reproducir todas" arrow>
                  <IconButton
                    onClick={onPlayAll}
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      '&:hover': {
                        bgcolor: theme.palette.success.main,
                        color: 'white',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Reproducir aleatorio" arrow>
                  <IconButton
                    onClick={onShuffle}
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      '&:hover': {
                        bgcolor: theme.palette.secondary.main,
                        color: 'white',
                        transform: 'scale(1.05) rotate(15deg)'
                      }
                    }}
                  >
                    <ShuffleIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Eliminar todas" arrow>
                  <IconButton
                    onClick={onDeleteAll}
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: theme.palette.error.main,
                        color: 'white',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <DeleteSweepIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        {downloadedSongs.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Espacio utilizado
              </Typography>
              <Typography variant="caption" fontWeight={600} color="primary">
                {formatBytes(totalSize)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min((totalSize / (1024 * 1024 * 500)) * 100, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Fade>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const UserDownloads = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const player = usePlayer();
  const download = useDownload();

  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [totalSize, setTotalSize] = useState(0);
  
  // Refs para control
  const isMounted = useRef(true);
  const initialLoadDone = useRef(false);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // ============================================
  // 🎵 CARGA DE DESCARGA - DEFINITIVA
  // ============================================
  const loadDownloads = useCallback(() => {
    try {
      const downloads = download.getAllDownloads();
      
      if (isMounted.current) {
        setDownloadedSongs(downloads);
        
        const total = downloads.reduce((sum, song) => sum + (song.fileSize || 0), 0);
        setTotalSize(total);
        
        console.log(`📦 Descargas: ${downloads.length} canciones, ${formatBytes(total)}`);
      }
    } catch (error) {
      console.error('Error cargando descargas:', error);
      if (isMounted.current) {
        showSnackbar('Error al cargar descargas', 'error');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [download]);

  // Efecto de carga inicial - SOLO UNA VEZ
  useEffect(() => {
    isMounted.current = true;
    
    // Cargar solo una vez al montar
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadDownloads();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [loadDownloads]);

  // ============================================
  // 🎵 REPRODUCCIÓN EN PLAYLIST
  // ============================================
  const handlePlayAll = useCallback(async () => {
    if (downloadedSongs.length === 0) return;
    
    try {
      const playlist = await Promise.all(downloadedSongs.map(async (song) => ({
        ...song,
        offlineUrl: await download.getOfflineAudioUrl(song.id),
        isOffline: true
      })));
      
      player.setPlaylistAndPlay(playlist, 0, true);
      showSnackbar(`🎵 Reproduciendo ${downloadedSongs.length} canciones offline`, 'success');
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al reproducir', 'error');
    }
  }, [downloadedSongs, download, player]);

  const handleShuffle = useCallback(async () => {
    if (downloadedSongs.length === 0) return;
    
    const shuffled = [...downloadedSongs].sort(() => Math.random() - 0.5);
    try {
      const playlist = await Promise.all(shuffled.map(async (song) => ({
        ...song,
        offlineUrl: await download.getOfflineAudioUrl(song.id),
        isOffline: true
      })));
      
      player.setPlaylistAndPlay(playlist, 0, true);
      showSnackbar(`🎲 Reproduciendo ${downloadedSongs.length} canciones (aleatorio)`, 'success');
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al reproducir', 'error');
    }
  }, [downloadedSongs, download, player]);

  const handlePlaySong = useCallback(async (song) => {
    try {
      const offlineUrl = await download.getOfflineAudioUrl(song.id);
      
      if (offlineUrl) {
        const songIndex = downloadedSongs.findIndex(s => s.id === song.id);
        
        const playlistFromSong = await Promise.all(
          downloadedSongs.slice(songIndex).map(async (s) => ({
            ...s,
            offlineUrl: await download.getOfflineAudioUrl(s.id),
            isOffline: true
          }))
        );
        
        player.setPlaylistAndPlay(playlistFromSong, 0, true);
        showSnackbar(`🎵 Reproduciendo: ${song.title} + ${playlistFromSong.length - 1} más`, 'success');
      } else {
        showSnackbar('No se pudo obtener el archivo offline', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al reproducir la canción', 'error');
    }
  }, [downloadedSongs, download, player]);

  const handleDeleteSong = useCallback(async () => {
    if (!selectedSong) return;
    
    const success = await download.removeDownload(selectedSong.id);
    if (success) {
      showSnackbar(`🗑️ Eliminada: ${selectedSong.title}`, 'success');
      // Recargar después de eliminar
      loadDownloads();
    } else {
      showSnackbar('Error al eliminar', 'error');
    }
    setDeleteDialogOpen(false);
    setSelectedSong(null);
  }, [selectedSong, download, loadDownloads]);

  const handleDeleteAll = useCallback(async () => {
    const success = await download.clearAllDownloads();
    if (success) {
      showSnackbar('🗑️ Todas las descargas eliminadas', 'success');
      loadDownloads();
    } else {
      showSnackbar('Error al eliminar', 'error');
    }
    setDeleteAllDialogOpen(false);
  }, [download, loadDownloads]);

  // Estado de carga
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, minHeight: '100vh' }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
        </Box>
        <DownloadsSkeleton />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      <PremiumHeader
        downloadedSongs={downloadedSongs}
        totalSize={totalSize}
        onPlayAll={handlePlayAll}
        onShuffle={handleShuffle}
        onDeleteAll={() => setDeleteAllDialogOpen(true)}
      />

      {downloadedSongs.length > 0 ? (
        <Fade in timeout={800}>
          <Grid container spacing={1.5}>
            {downloadedSongs.map((song, index) => (
              <Grow key={song.id} in timeout={300 + (index * 30)}>
                <Grid item xs={6} sm={4} md={3} lg={2.4}>
                  <Box sx={{ position: 'relative' }}>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                      label="Offline"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 10,
                        bgcolor: alpha(theme.palette.success.main, 0.95),
                        color: 'white',
                        fontSize: '0.6rem',
                        height: 22,
                        backdropFilter: 'blur(4px)',
                        '& .MuiChip-icon': { fontSize: 12, color: 'white' }
                      }}
                    />
                    
                    <Tooltip title={`Tamaño: ${formatBytes(song.fileSize)}`} arrow>
                      <Chip
                        icon={<StorageIcon sx={{ fontSize: 10 }} />}
                        label={formatBytes(song.fileSize)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          zIndex: 10,
                          bgcolor: alpha(theme.palette.common.black, 0.75),
                          color: 'white',
                          fontSize: '0.6rem',
                          height: 22,
                          backdropFilter: 'blur(4px)',
                          '& .MuiChip-icon': { fontSize: 10, color: 'white' }
                        }}
                      />
                    </Tooltip>

                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 8, 
                      left: 8, 
                      zIndex: 10,
                      display: 'flex',
                      gap: 0.5,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      '&:hover': { opacity: 1 }
                    }}>
                      <Tooltip title="Eliminar descarga" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSong(song);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.9),
                            color: 'white',
                            width: 28,
                            height: 28,
                            '&:hover': { bgcolor: theme.palette.error.main, transform: 'scale(1.05)' }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <SongCard
                      song={song}
                      variant="compact"
                      showIndex={false}
                      onPlay={() => handlePlaySong(song)}
                    />
                  </Box>
                </Grid>
              </Grow>
            ))}
          </Grid>
        </Fade>
      ) : (
        <Fade in>
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <CloudOffIcon sx={{ fontSize: 64, color: alpha(theme.palette.text.primary, 0.2), mb: 2 }} />
            <Typography variant="h6" sx={{ color: alpha(theme.palette.text.primary, 0.5), mb: 1 }}>
              No tienes canciones descargadas
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.3), mb: 3 }}>
              Descarga tus canciones favoritas para escucharlas sin conexión
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/MainPage')}
              startIcon={<DownloadIcon />}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
              }}
            >
              Explorar música
            </Button>
          </Paper>
        </Fade>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>Eliminar descarga</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar "{selectedSong?.title}" de tu dispositivo?
            {selectedSong?.fileSize && (
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Tamaño: {formatBytes(selectedSong.fileSize)}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteSong} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteAllDialogOpen} onClose={() => setDeleteAllDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>Eliminar todas las descargas</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar TODAS las {downloadedSongs.length} canciones descargadas?
            Esta acción liberará {formatBytes(totalSize)} de espacio.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteAllDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteAll} color="error" variant="contained">Eliminar todo</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontSize: '0.85rem', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserDownloads;