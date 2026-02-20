// ============================================
// pages/DownloadsPage.jsx - VERSIÓN SIN DEPENDENCIAS EXTERNAS
// ============================================

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  alpha,
  Fade,
  Zoom,
  Card,
  CardContent,
  CardActions,
  styled
} from '@mui/material';
import {
  Download as DownloadIcon,
  DeleteSweep as DeleteSweepIcon,
  Storage as StorageIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Sort as SortIcon,
  PlayArrow as PlayIcon,
  MusicNote as MusicNoteIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  CloudQueue as CloudIcon,
  Computer as ComputerIcon,
  Smartphone as PhoneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useDownload from '../../components/hook/services/useDownload';
import useOffline from '../../components/hook/services/useOffline';
import { usePlayer } from '../../components/PlayerContext';

// ============================================
// CONFIGURACIÓN DE TEMA
// ============================================
const theme = {
  colors: {
    primary: '#FF6B35',
    primaryLight: '#FF8B5C',
    primaryGradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8B5C 100%)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gray: '#6B7280',
    grayLight: '#9CA3AF',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      tertiary: '#9CA3AF'
    }
  },
  shadows: {
    card: '0 4px 20px -2px rgba(0,0,0,0.06)',
    hover: '0 20px 30px -10px rgba(255,107,53,0.2)',
  }
};

// ============================================
// COMPONENTES STYLED
// ============================================
const PremiumCard = styled(Card)(({ isplaying }) => ({
  display: 'flex',
  marginBottom: 16,
  borderRadius: 20,
  backgroundColor: theme.colors.surface,
  boxShadow: theme.shadows.card,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.colors.grayLight, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    background: isplaying === 'true' ? theme.colors.primaryGradient : 'transparent',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows.hover,
    borderColor: alpha(theme.colors.primary, 0.2),
  }
}));

const ActionIconButton = styled(IconButton)(({ actioncolor = 'primary' }) => ({
  backgroundColor: alpha(theme.colors[actioncolor], 0.08),
  transition: 'all 0.2s ease',
  width: 42,
  height: 42,
  '&:hover': {
    backgroundColor: actioncolor === 'primary' ? theme.colors.primary : theme.colors.error,
    transform: 'scale(1.1)',
    color: '#FFFFFF',
  }
}));

// ============================================
// COMPONENTE DOWNLOAD CARD
// ============================================
const DownloadCard = memo(({ song, onRemove, onPlay, isPlaying }) => {
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && 'loading' in HTMLImageElement.prototype) {
      imgRef.current.loading = 'lazy';
    }
  }, []);

  const StorageIcon = song.storageType === 'cache' ? PhoneIcon :
                     song.storageType === 'filesystem' ? ComputerIcon :
                     CloudIcon;

  const storageColors = {
    cache: theme.colors.success,
    filesystem: theme.colors.primary,
    cloud: theme.colors.info
  };

  return (
    <PremiumCard isplaying={isPlaying ? 'true' : 'false'}>
      <Box
        sx={{ position: 'relative', width: 120, height: 120, overflow: 'hidden' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          ref={imgRef}
          component="img"
          src={song.cover || song.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(song.title)}&background=FF6B35&color=fff&size=120`}
          alt={song.title}
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
            ...(isHovered && { transform: 'scale(1.15)' })
          }}
        />
        
        <Tooltip title={`Guardado en ${song.storageType === 'cache' ? 'app' : 'PC'}`} arrow>
          <Box sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: alpha('#000', 0.7),
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}>
            <StorageIcon sx={{ fontSize: 18, color: '#FFF' }} />
          </Box>
        </Tooltip>

        {isPlaying && (
          <Box sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            bgcolor: theme.colors.primary,
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: `0 0 0 0 ${alpha(theme.colors.primary, 0.4)}` },
              '70%': { boxShadow: `0 0 0 12px ${alpha(theme.colors.primary, 0)}` },
            }
          }}>
            <PlayIcon sx={{ fontSize: 18, color: '#FFF' }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flex: 1, py: 2.5, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {song.title}
          </Typography>
          <Chip
            label={song.storageType === 'cache' ? 'OFFLINE' : 'SYSTEM'}
            size="small"
            sx={{
              height: 24,
              bgcolor: alpha(storageColors[song.storageType], 0.1),
              color: storageColors[song.storageType],
              fontWeight: 700,
              fontSize: '0.65rem',
            }}
          />
        </Box>
        
        <Typography variant="body2" sx={{ color: theme.colors.text.secondary, mb: 2 }}>
          {song.artist} • {song.genre || 'Desconocido'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography variant="caption" sx={{ color: theme.colors.text.tertiary }}>
            📅 {new Date(song.downloadedAt).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.colors.text.tertiary }}>
            💾 {(song.fileSize / 1024 / 1024).toFixed(1)} MB
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ pr: 3, gap: 1.5 }}>
        <Tooltip title="Reproducir" arrow>
          <ActionIconButton 
            onClick={() => onPlay(song)} 
            actioncolor="primary"
          >
            <PlayIcon />
          </ActionIconButton>
        </Tooltip>
        
        <Tooltip title="Eliminar" arrow>
          <ActionIconButton 
            onClick={() => onRemove(song.id)} 
            actioncolor="error"
          >
            <DeleteSweepIcon />
          </ActionIconButton>
        </Tooltip>
      </CardActions>
    </PremiumCard>
  );
});

DownloadCard.displayName = 'DownloadCard';

// ============================================
// COMPONENTE STATS CARD
// ============================================
const StatsCard = memo(({ icon: Icon, label, value, subValue, color }) => (
  <Zoom in={true}>
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: alpha(color, 0.04),
        borderRadius: 4,
        border: `1px solid ${alpha(color, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 15px 30px -10px ${alpha(color, 0.3)}`,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 56,
          height: 56,
          borderRadius: 3,
          bgcolor: alpha(color, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon sx={{ color, fontSize: 30 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {subValue && (
            <Typography variant="caption" sx={{ color: theme.colors.text.tertiary }}>
              {subValue}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  </Zoom>
));

StatsCard.displayName = 'StatsCard';

// ============================================
// TAB PANEL
// ============================================
const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && (
      <Fade in={value === index} timeout={400}>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Fade>
    )}
  </div>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const DownloadsPage = () => {
  const navigate = useNavigate();
  const download = useDownload();
  const { isOnline, isWifi, wasOffline } = useOffline();
  const player = usePlayer();

  // Estados
  const [downloads, setDownloads] = useState([]);
  const [activeDownloads, setActiveDownloads] = useState([]);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalSize: 0,
    cacheSize: 0,
    filesystemSize: 0
  });
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState('date');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);

  // Refs
  const currentSongId = player.currentSong?.id || null;
  const previousSongIdRef = useRef(null);

  // Efecto para sincronizar reproducción
  useEffect(() => {
    if (previousSongIdRef.current !== currentSongId) {
      previousSongIdRef.current = currentSongId;
      setCurrentlyPlayingId(currentSongId);
    }
  }, [currentSongId]);

  // Función para mostrar snackbar
  const showSnackbar = (message, severity = 'success', duration = 3000) => {
    setSnackbar({ open: true, message, severity, duration });
  };

  // Función para trackear errores (versión simple)
  const trackError = (error, context) => {
    console.error('Error:', error, 'Context:', context);
    // Aquí podrías enviar a un servicio de logging
  };

  // Cargar datos
  const loadDownloads = useCallback(() => {
    try {
      const all = download.getAllDownloads() || [];
      
      const totalSize = all.reduce((acc, d) => acc + (d.fileSize || 0), 0);
      const cacheSize = all
        .filter(d => d.storageType === 'cache')
        .reduce((acc, d) => acc + (d.fileSize || 0), 0);
      const filesystemSize = all
        .filter(d => d.storageType === 'filesystem')
        .reduce((acc, d) => acc + (d.fileSize || 0), 0);

      const sorted = [...all].sort((a, b) => {
        if (sortBy === 'date') return new Date(b.downloadedAt) - new Date(a.downloadedAt);
        if (sortBy === 'artist') return a.artist?.localeCompare(b.artist) || 0;
        if (sortBy === 'size') return (b.fileSize || 0) - (a.fileSize || 0);
        return 0;
      });

      setDownloads(sorted);
      setStats({
        totalSongs: all.length,
        totalSize,
        cacheSize,
        filesystemSize
      });

      const active = Object.entries(download.downloading || {}).map(([id]) => ({
        id,
        progress: download.progress?.[id] || 0,
        title: download.getDownloadInfo?.(id)?.title || 'Descargando...'
      }));
      setActiveDownloads(active);

      setQueue(download.queue || []);
    } catch (error) {
      trackError(error, 'loadDownloads');
      showSnackbar('Error cargando descargas', 'error');
    }
  }, [sortBy, download]);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  useEffect(() => {
    const handleUpdate = () => loadDownloads();
    window.addEventListener('downloads-updated', handleUpdate);
    window.addEventListener('download-completed', handleUpdate);
    return () => {
      window.removeEventListener('downloads-updated', handleUpdate);
      window.removeEventListener('download-completed', handleUpdate);
    };
  }, [loadDownloads]);

  // Handlers
  const handlePlay = async (song) => {
    try {
      showSnackbar(`Cargando: ${song.title}...`, 'info');

      if (song.storageType === 'cache') {
        await player.playSong(song);
        showSnackbar(`📱 Reproduciendo offline: ${song.title}`, 'success');
        return;
      }

      if (song.storageType === 'filesystem' && !isOnline) {
        showSnackbar('ℹ️ Reproduce desde la carpeta Descargas', 'info', 5000);
        return;
      }

      await player.playSong(song);
      showSnackbar(`🎵 Reproduciendo: ${song.title}`, 'success');

    } catch (error) {
      trackError(error, { action: 'handlePlay', songId: song.id });
      
      let errorMessage = 'Error al reproducir';
      if (error.message?.includes('offline')) {
        errorMessage = 'Archivo no disponible offline';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de conexión';
      }
      
      showSnackbar(`❌ ${errorMessage}`, 'error');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const success = await download.removeDownload(songId);
      if (success) {
        showSnackbar('✅ Canción eliminada', 'success');
        loadDownloads();
      }
    } catch (error) {
      trackError(error, { action: 'handleRemoveSong', songId });
      showSnackbar('❌ Error al eliminar', 'error');
    }
  };

  const handleClearAll = async () => {
    if (downloads.length === 0) return;
    
    if (window.confirm(`¿Eliminar todas las ${downloads.length} canciones?`)) {
      try {
        const success = await download.clearAllDownloads();
        if (success) {
          showSnackbar('🗑️ Todas las descargas eliminadas', 'success');
          loadDownloads();
        }
      } catch (error) {
        trackError(error, 'handleClearAll');
        showSnackbar('❌ Error al limpiar', 'error');
      }
    }
  };

  const handleCancelDownload = (songId) => {
    try {
      download.cancelDownload(songId);
      showSnackbar('⏹️ Descarga cancelada', 'info');
    } catch (error) {
      trackError(error, { action: 'handleCancelDownload', songId });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: theme.colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 800,
              background: theme.colors.primaryGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Mis Descargas
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
              label={isOnline ? (isWifi ? 'WiFi' : 'Datos') : 'Offline'}
              color={isOnline ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={handleClearAll}
              disabled={downloads.length === 0}
              sx={{ borderRadius: 3 }}
            >
              Limpiar todo
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={MusicNoteIcon}
              label="Canciones"
              value={stats.totalSongs}
              color={theme.colors.primary}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={StorageIcon}
              label="Espacio total"
              value={`${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`}
              color={theme.colors.success}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={PhoneIcon}
              label="En App"
              value={downloads.filter(d => d.storageType === 'cache').length}
              subValue={`${(stats.cacheSize / 1024 / 1024).toFixed(1)} MB`}
              color={theme.colors.success}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={ComputerIcon}
              label="En PC"
              value={downloads.filter(d => d.storageType === 'filesystem').length}
              subValue={`${(stats.filesystemSize / 1024 / 1024).toFixed(1)} MB`}
              color={theme.colors.info}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Banners */}
      {!isOnline && downloads.some(s => s.storageType === 'cache') && (
        <Fade in={true}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: alpha(theme.colors.info, 0.05) }}>
            <Typography variant="h6">📴 Modo offline</Typography>
            <Typography>
              {downloads.filter(s => s.storageType === 'cache').length} canciones disponibles sin conexión
            </Typography>
          </Paper>
        </Fade>
      )}

      {wasOffline && (
        <Fade in={true}>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            ¡Conexión restablecida!
          </Alert>
        </Fade>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            bgcolor: alpha(theme.colors.primary, 0.02),
            '& .MuiTab-root': { py: 2, fontWeight: 600, textTransform: 'none' },
            '& .Mui-selected': { color: theme.colors.primary },
            '& .MuiTabs-indicator': { background: theme.colors.primaryGradient, height: 3 }
          }}
        >
          <Tab label={`Descargadas (${downloads.length})`} />
          <Tab label={`En progreso (${activeDownloads.length})`} />
          <Tab label={`En cola (${queue.length})`} />
        </Tabs>

        {/* Panel Descargadas */}
        <TabPanel value={tabValue} index={0}>
          {downloads.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <DownloadIcon sx={{ fontSize: 60, color: alpha(theme.colors.gray, 0.3), mb: 2 }} />
              <Typography variant="h6" gutterBottom>No hay canciones descargadas</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Explora música y descarga tus canciones favoritas
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ background: theme.colors.primaryGradient }}
              >
                Explorar música
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  startIcon={<SortIcon />}
                  onClick={() => {
                    const options = ['date', 'artist', 'size'];
                    const next = options[(options.indexOf(sortBy) + 1) % options.length];
                    setSortBy(next);
                  }}
                >
                  Ordenar: {sortBy === 'date' ? 'Fecha' : sortBy === 'artist' ? 'Artista' : 'Tamaño'}
                </Button>
              </Box>

              {downloads.map((song, index) => (
                <Fade in={true} timeout={300 + index * 50} key={song.id}>
                  <div>
                    <DownloadCard
                      song={song}
                      onRemove={handleRemoveSong}
                      onPlay={handlePlay}
                      isPlaying={currentlyPlayingId === song.id}
                    />
                  </div>
                </Fade>
              ))}
            </>
          )}
        </TabPanel>

        {/* Panel En progreso */}
        <TabPanel value={tabValue} index={1}>
          {activeDownloads.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No hay descargas en progreso</Typography>
            </Box>
          ) : (
            activeDownloads.map((item) => (
              <Paper key={item.id} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight={600}>{item.title}</Typography>
                  <IconButton size="small" onClick={() => handleCancelDownload(item.id)}>
                    <DeleteSweepIcon />
                  </IconButton>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.colors.primary, 0.1),
                    '& .MuiLinearProgress-bar': { background: theme.colors.primaryGradient }
                  }}
                />
              </Paper>
            ))
          )}
        </TabPanel>

        {/* Panel En cola */}
        <TabPanel value={tabValue} index={2}>
          {queue.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No hay canciones en cola</Typography>
            </Box>
          ) : (
            queue.map((item, index) => (
              <Paper key={item.songId} sx={{ p: 2, mb: 1, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label={index + 1} size="small" />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600}>{item.songTitle}</Typography>
                    <Typography variant="caption">{item.artistName}</Typography>
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </TabPanel>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DownloadsPage;