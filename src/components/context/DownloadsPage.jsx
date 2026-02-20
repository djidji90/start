// ============================================ //
// pages/DownloadsPage.jsx - VERSIÓN FINAL CON MICRO-REFINEMENTS
// ============================================ //

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { 
  Box, Container, Typography, Paper, Grid, Button, 
  IconButton, LinearProgress, Alert, Snackbar, Tabs, Tab, 
  Chip, Tooltip, alpha, Fade, Card, CardContent, 
  CardActions, styled, useMediaQuery, useTheme, Menu,
  MenuItem, ListItemIcon, ListItemText, BottomNavigation,
  BottomNavigationAction, Drawer, Zoom, Dialog,
  DialogTitle, DialogContent, DialogContentText,
  DialogActions, Slide
} from '@mui/material';
import { 
  Download as DownloadIcon, DeleteSweep as DeleteSweepIcon, 
  Storage as StorageIcon, Wifi as WifiIcon, WifiOff as WifiOffIcon, 
  Sort as SortIcon, PlayArrow as PlayIcon, MusicNote as MusicNoteIcon,
  Computer as ComputerIcon, Smartphone as PhoneIcon, ClearAll as ClearAllIcon,
  CalendarToday as CalendarIcon, Person as PersonIcon,
  CheckCircle as CheckCircleIcon, Warning as WarningIcon,
  CloudDone as CloudDoneIcon, CloudOff as CloudOffIcon,
  MoreVert as MoreVertIcon, DeleteForever as DeleteForeverIcon,
  Close as CloseIcon, ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useDownload from '../../components/hook/services/useDownload';
import useOffline from '../../components/hook/services/useOffline';
import { usePlayer } from '../../components/PlayerContext';

// ============================================ //
// SISTEMA DE DISEÑO - TOKENS
// ============================================ //
const designSystem = {
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
    surfaceElevated: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      tertiary: '#9CA3AF'
    }
  },
  borderRadius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    pill: 999
  },
  shadows: {
    card: '0 4px 20px -2px rgba(0,0,0,0.06)',
    hover: '0 20px 30px -10px rgba(255,107,53,0.2)',
    drawer: '0 -8px 32px rgba(0,0,0,0.08)',
    dialog: '0 24px 48px -12px rgba(0,0,0,0.25)'
  },
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40
  }
};

// ============================================ //
// COMPONENTES STYLED CON SISTEMA DE DISEÑO
// ============================================ //
const PremiumCard = styled(Card)(({ isplaying, theme: muiTheme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 16,
  borderRadius: designSystem.borderRadius.lg,
  backgroundColor: designSystem.colors.surface,
  boxShadow: designSystem.shadows.card,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(designSystem.colors.grayLight, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  
  [muiTheme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    background: isplaying === 'true' ? designSystem.colors.primaryGradient : 'transparent',
    borderRadius: `${designSystem.borderRadius.lg}px 0 0 ${designSystem.borderRadius.lg}px`,
  },
  
  '@media (hover: hover)': {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: designSystem.shadows.hover,
      borderColor: alpha(designSystem.colors.primary, 0.2),
    }
  }
}));

const ActionIconButton = styled(IconButton)(({ actioncolor = 'primary' }) => ({
  backgroundColor: alpha(designSystem.colors[actioncolor], 0.08),
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  width: 48,
  height: 48,
  
  '@media (max-width: 360px)': {
    width: 44,
    height: 44,
  },
  
  '@media (hover: hover)': {
    '&:hover': {
      backgroundColor: actioncolor === 'primary' ? designSystem.colors.primary : designSystem.colors.error,
      transform: 'scale(1.08)',
      color: '#FFFFFF',
    }
  }
}));

const StatusChip = styled(Chip)(({ statuscolor }) => ({
  height: 24,
  borderRadius: designSystem.borderRadius.pill,
  backgroundColor: alpha(statuscolor, 0.1),
  color: statuscolor,
  fontWeight: 700,
  fontSize: '0.65rem',
  '& .MuiChip-label': {
    px: 1.5
  }
}));

// ============================================ //
// COMPONENTE DOWNLOAD CARD - VERSIÓN FINAL
// ============================================ //
const DownloadCard = memo(({ song, onRemove, onPlay, isPlaying }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  useEffect(() => {
    if (imgRef.current && 'loading' in HTMLImageElement.prototype) {
      imgRef.current.loading = 'lazy';
    }
  }, []);

  const StorageIcon = song.storageType === 'cache' ? PhoneIcon : 
                     song.storageType === 'filesystem' ? ComputerIcon : 
                     CloudDoneIcon;

  const storageColors = {
    cache: designSystem.colors.success,
    filesystem: designSystem.colors.primary,
    cloud: designSystem.colors.info
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = imageError 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(song.title)}&background=FF6B35&color=fff&size=120&bold=true`
    : (song.cover || song.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(song.title)}&background=FF6B35&color=fff&size=120&bold=true`);

  return (
    <PremiumCard isplaying={isPlaying ? 'true' : 'false'} theme={muiTheme}>
      <Box 
        sx={{ 
          position: 'relative', 
          width: { xs: '100%', sm: 120 },
          height: { xs: 200, sm: 120 },
          overflow: 'hidden',
          flexShrink: 0,
          bgcolor: alpha(designSystem.colors.primary, 0.05)
        }} 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box 
          ref={imgRef}
          component="img" 
          src={imageUrl}
          alt={song.title}
          loading="lazy"
          onError={handleImageError}
          sx={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            transition: 'transform 0.4s ease',
            ...(isHovered && { transform: 'scale(1.08)' })
          }} 
        />
        
        <Tooltip title={`Guardado en ${song.storageType === 'cache' ? 'app' : 'PC'}`} arrow placement="top">
          <Box sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: alpha('#000', 0.6),
            backdropFilter: 'blur(8px)',
            borderRadius: designSystem.borderRadius.sm,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <StorageIcon sx={{ fontSize: 18, color: '#FFF' }} />
          </Box>
        </Tooltip>
        
        {isPlaying && (
          <Zoom in={true}>
            <Box sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              bgcolor: designSystem.colors.primary,
              borderRadius: designSystem.borderRadius.sm,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite',
              boxShadow: `0 4px 12px ${alpha(designSystem.colors.primary, 0.4)}`,
              '@keyframes pulse': {
                '0%': { boxShadow: `0 4px 12px ${alpha(designSystem.colors.primary, 0.4)}` },
                '50%': { boxShadow: `0 8px 24px ${alpha(designSystem.colors.primary, 0.6)}` },
                '100%': { boxShadow: `0 4px 12px ${alpha(designSystem.colors.primary, 0.4)}` },
              }
            }}>
              <PlayIcon sx={{ fontSize: 18, color: '#FFF' }} />
            </Box>
          </Zoom>
        )}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        flex: 1,
        minWidth: 0
      }}>
        <CardContent sx={{ 
          flex: '1 1 auto', 
          py: { xs: 2, sm: 2.5 }, 
          px: { xs: 2, sm: 3 },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            mb: 1,
            flexWrap: 'wrap'
          }}>
            <Tooltip title={song.title} arrow>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                sx={{ 
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: 'calc(100% - 80px)', sm: 'none' }
                }}
              >
                {song.title}
              </Typography>
            </Tooltip>
            <StatusChip 
              label={song.storageType === 'cache' ? 'OFFLINE' : 'LOCAL'} 
              statuscolor={storageColors[song.storageType]}
              size="small"
            />
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: designSystem.colors.text.secondary, 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {song.artist} • {song.genre || 'Desconocido'}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, sm: 3 },
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 14, color: designSystem.colors.text.tertiary }} />
              <Typography variant="caption" sx={{ color: designSystem.colors.text.tertiary }}>
                {new Date(song.downloadedAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StorageIcon sx={{ fontSize: 14, color: designSystem.colors.text.tertiary }} />
              <Typography variant="caption" sx={{ color: designSystem.colors.text.tertiary }}>
                {(song.fileSize / 1024 / 1024).toFixed(1)} MB
              </Typography>
            </Box>
          </Box>
        </CardContent>
        
        <CardActions sx={{ 
          p: { xs: 2, sm: 3 }, 
          pt: { xs: 0, sm: 3 },
          gap: 1.5,
          justifyContent: { xs: 'flex-end', sm: 'flex-start' }
        }}>
          <Tooltip title="Reproducir" arrow placement="top">
            <ActionIconButton 
              onClick={() => onPlay(song)} 
              actioncolor="primary"
            >
              <PlayIcon />
            </ActionIconButton>
          </Tooltip>
          
          <Tooltip title="Eliminar" arrow placement="top">
            <ActionIconButton 
              onClick={() => onRemove(song.id)} 
              actioncolor="error"
            >
              <DeleteSweepIcon />
            </ActionIconButton>
          </Tooltip>
        </CardActions>
      </Box>
    </PremiumCard>
  );
});

DownloadCard.displayName = 'DownloadCard';

// ============================================ //
// COMPONENTE STATS CARD - VERSIÓN REFINADA CON SCROLL HORIZONTAL EN MÓVIL
// ============================================ //
const StatsCards = ({ stats, downloads }) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width: 480px)');

  const cards = [
    {
      icon: MusicNoteIcon,
      label: 'Canciones',
      value: stats.totalSongs,
      color: designSystem.colors.primary
    },
    {
      icon: StorageIcon,
      label: 'Espacio total',
      value: `${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`,
      color: designSystem.colors.success
    },
    {
      icon: PhoneIcon,
      label: 'En App',
      value: downloads.filter(d => d.storageType === 'cache').length,
      subValue: `${(stats.cacheSize / 1024 / 1024).toFixed(1)} MB`,
      color: designSystem.colors.success
    },
    {
      icon: ComputerIcon,
      label: 'En PC',
      value: downloads.filter(d => d.storageType === 'filesystem').length,
      subValue: `${(stats.filesystemSize / 1024 / 1024).toFixed(1)} MB`,
      color: designSystem.colors.info
    }
  ];

  // En móvil pequeño: scroll horizontal
  if (isMobile && isSmallMobile) {
    return (
      <Box sx={{ 
        mb: 3,
        mx: -2,
        px: 2,
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' }
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          width: 'max-content',
          pb: 1 // Espacio para sombra
        }}>
          {cards.map((card, index) => (
            <Box key={index} sx={{ width: 200 }}>
              <StatsCard {...card} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // En móvil grande y desktop: grid normal
  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatsCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

const StatsCard = memo(({ icon: Icon, label, value, subValue, color }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: { xs: 2, sm: 2.5 }, 
      bgcolor: alpha(color, 0.04), 
      borderRadius: designSystem.borderRadius.md,
      border: `1px solid ${alpha(color, 0.1)}`, 
      transition: 'all 0.3s ease',
      height: '100%',
      '@media (hover: hover)': {
        '&:hover': { 
          transform: 'translateY(-4px)', 
          boxShadow: `0 15px 30px -10px ${alpha(color, 0.3)}`,
          borderColor: alpha(color, 0.2)
        }
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ 
        width: { xs: 48, sm: 56 }, 
        height: { xs: 48, sm: 56 }, 
        borderRadius: designSystem.borderRadius.sm,
        bgcolor: alpha(color, 0.1), 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
      }}>
        <Icon sx={{ color, fontSize: { xs: 24, sm: 30 } }} />
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: designSystem.colors.text.secondary, fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
        {subValue && (
          <Typography variant="caption" sx={{ color: designSystem.colors.text.tertiary }}>
            {subValue}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
));

StatsCard.displayName = 'StatsCard';

// ============================================ //
// COMPONENTE CONFIRM DIALOG PREMIUM
// ============================================ //
const ConfirmDialog = ({ open, onClose, onConfirm, count }) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const DialogComponent = isMobile ? Drawer : Dialog;
  const dialogProps = isMobile ? {
    anchor: 'bottom',
    open,
    onClose,
    PaperProps: {
      sx: {
        borderTopLeftRadius: designSystem.borderRadius.xl,
        borderTopRightRadius: designSystem.borderRadius.xl,
        p: 3,
        maxWidth: '100%'
      }
    }
  } : {
    open,
    onClose,
    PaperProps: {
      sx: {
        borderRadius: designSystem.borderRadius.lg,
        p: 2,
        maxWidth: 400,
        boxShadow: designSystem.shadows.dialog
      }
    }
  };

  if (isMobile) {
    return (
      <Drawer {...dialogProps}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ 
            width: 40, 
            height: 4, 
            bgcolor: alpha(designSystem.colors.gray, 0.3), 
            borderRadius: designSystem.borderRadius.pill,
            mx: 'auto',
            mb: 3
          }} />
          
          <DeleteForeverIcon sx={{ 
            fontSize: 48, 
            color: designSystem.colors.error,
            mb: 2
          }} />
          
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            ¿Eliminar todas?
          </Typography>
          
          <Typography variant="body2" sx={{ color: designSystem.colors.text.secondary, mb: 3 }}>
            Se eliminarán {count} canciones de tu dispositivo
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{ 
                borderRadius: designSystem.borderRadius.pill,
                py: 1.5
              }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={onConfirm}
              sx={{ 
                borderRadius: designSystem.borderRadius.pill,
                py: 1.5,
                background: designSystem.colors.error,
                '&:hover': {
                  background: alpha(designSystem.colors.error, 0.9)
                }
              }}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
      </Drawer>
    );
  }

  return (
    <Dialog {...dialogProps}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteForeverIcon sx={{ color: designSystem.colors.error }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Confirmar eliminación
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que quieres eliminar todas las {count} canciones descargadas?
          Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          sx={{ borderRadius: designSystem.borderRadius.pill }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          sx={{ 
            borderRadius: designSystem.borderRadius.pill,
            background: designSystem.colors.error,
            '&:hover': {
              background: alpha(designSystem.colors.error, 0.9)
            }
          }}
        >
          Eliminar todo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================ //
// COMPONENTE SORT MENU - MEJORADO
// ============================================ //
const SortMenu = ({ sortBy, onSortChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (value) => {
    onSortChange(value);
    handleClose();
  };

  const sortOptions = [
    { value: 'date', label: 'Fecha', icon: CalendarIcon },
    { value: 'artist', label: 'Artista', icon: PersonIcon },
    { value: 'size', label: 'Tamaño', icon: StorageIcon }
  ];

  const currentOption = sortOptions.find(opt => opt.value === sortBy);

  if (isMobile) {
    return (
      <>
        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          endIcon={<MoreVertIcon />}
          onClick={handleClick}
          size="small"
          sx={{ 
            borderRadius: designSystem.borderRadius.pill,
            borderColor: alpha(designSystem.colors.primary, 0.3),
            color: designSystem.colors.text.primary,
            minWidth: 120,
            '&:hover': {
              borderColor: designSystem.colors.primary,
              backgroundColor: alpha(designSystem.colors.primary, 0.04)
            }
          }}
        >
          {currentOption?.label}
        </Button>
        
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderTopLeftRadius: designSystem.borderRadius.xl,
              borderTopRightRadius: designSystem.borderRadius.xl,
              p: 2
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ordenar por
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          {sortOptions.map((option) => (
            <MenuItem 
              key={option.value} 
              onClick={() => handleSort(option.value)}
              selected={sortBy === option.value}
              sx={{ 
                py: 1.5,
                borderRadius: designSystem.borderRadius.sm,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: alpha(designSystem.colors.primary, 0.08),
                  '&:hover': {
                    backgroundColor: alpha(designSystem.colors.primary, 0.12)
                  }
                }
              }}
            >
              <ListItemIcon>
                <option.icon sx={{ color: sortBy === option.value ? designSystem.colors.primary : 'inherit' }} />
              </ListItemIcon>
              <ListItemText 
                primary={option.label} 
                primaryTypographyProps={{
                  fontWeight: sortBy === option.value ? 600 : 400
                }}
              />
              {sortBy === option.value && (
                <CheckCircleIcon sx={{ color: designSystem.colors.primary, ml: 1 }} />
              )}
            </MenuItem>
          ))}
        </Drawer>
      </>
    );
  }

  return (
    <Button
      startIcon={<SortIcon />}
      onClick={handleClick}
      size="small"
      sx={{ 
        borderRadius: designSystem.borderRadius.pill,
        color: designSystem.colors.text.secondary
      }}
    >
      Ordenar: {currentOption?.label}
    </Button>
  );
};

// ============================================ //
// TAB PANEL
// ============================================ //
const TabPanel = ({ children, value, index, ...props }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`downloads-tabpanel-${index}`}
    aria-labelledby={`downloads-tab-${index}`}
    {...props}
  >
    {value === index && (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    )}
  </div>
);

// ============================================ //
// COMPONENTE PRINCIPAL - VERSIÓN PREMIUM FINAL
// ============================================ //
const DownloadsPage = () => {
  const navigate = useNavigate();
  const download = useDownload();
  const { isOnline, isWifi, wasOffline } = useOffline();
  const player = usePlayer();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

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
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

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

  // Función para trackear errores
  const trackError = (error, context) => {
    console.error('Error:', error, 'Context:', context);
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
        showSnackbar(`Reproduciendo offline: ${song.title}`, 'success');
        return;
      }

      if (song.storageType === 'filesystem' && !isOnline) {
        showSnackbar('Reproduce desde la carpeta Descargas', 'info', 5000);
        return;
      }

      await player.playSong(song);
      showSnackbar(`Reproduciendo: ${song.title}`, 'success');

    } catch (error) {
      trackError(error, { action: 'handlePlay', songId: song.id });

      let errorMessage = 'Error al reproducir';
      if (error.message?.includes('offline')) {
        errorMessage = 'Archivo no disponible offline';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de conexión';
      }

      showSnackbar(errorMessage, 'error');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const success = await download.removeDownload(songId);
      if (success) {
        showSnackbar('Canción eliminada', 'success');
        loadDownloads();
      }
    } catch (error) {
      trackError(error, { action: 'handleRemoveSong', songId });
      showSnackbar('Error al eliminar', 'error');
    }
  };

  const handleClearAll = async () => {
    setConfirmDialogOpen(false);
    if (downloads.length === 0) return;

    try {
      const success = await download.clearAllDownloads();
      if (success) {
        showSnackbar('Todas las descargas eliminadas', 'success');
        loadDownloads();
      }
    } catch (error) {
      trackError(error, 'handleClearAll');
      showSnackbar('Error al limpiar', 'error');
    }
  };

  const handleCancelDownload = (songId) => {
    try {
      download.cancelDownload(songId);
      showSnackbar('Descarga cancelada', 'info');
    } catch (error) {
      trackError(error, { action: 'handleCancelDownload', songId });
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 4 }, 
        bgcolor: designSystem.colors.background, 
        minHeight: '100vh',
        px: { xs: 2, sm: 3 },
        backgroundImage: `radial-gradient(circle at 100% 0%, ${alpha(designSystem.colors.primary, 0.02)} 0%, transparent 50%)`,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 5 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          gap: 2,
          mb: 3 
        }}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            sx={{ 
              fontWeight: 800, 
              background: designSystem.colors.primaryGradient, 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
            }}
          >
            Mis Descargas
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Chip 
              icon={isOnline ? <WifiIcon /> : <WifiOffIcon />} 
              label={isOnline ? (isWifi ? 'WiFi' : 'Datos') : 'Offline'} 
              color={isOnline ? 'success' : 'error'} 
              sx={{ 
                fontWeight: 600,
                borderRadius: designSystem.borderRadius.pill
              }} 
            />
            
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<ClearAllIcon />} 
              onClick={() => setConfirmDialogOpen(true)} 
              disabled={downloads.length === 0} 
              sx={{ 
                borderRadius: designSystem.borderRadius.pill,
                flex: { xs: 1, sm: 'none' },
                minWidth: { xs: 'auto', sm: 160 }
              }}
            >
              Limpiar todo
            </Button>
          </Box>
        </Box>
        
        {/* Stats Cards - Ahora con scroll horizontal en móvil pequeño */}
        <StatsCards stats={stats} downloads={downloads} />
      </Box>
      
      {/* Banners */}
      {!isOnline && downloads.some(s => s.storageType === 'cache') && (
        <Fade in={true}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3, 
            borderRadius: designSystem.borderRadius.md,
            bgcolor: alpha(designSystem.colors.info, 0.05),
            border: `1px solid ${alpha(designSystem.colors.info, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CloudOffIcon sx={{ color: designSystem.colors.info }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Modo offline</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: designSystem.colors.text.secondary }}>
              {downloads.filter(s => s.storageType === 'cache').length} canciones disponibles sin conexión
            </Typography>
          </Paper>
        </Fade>
      )}
      
      {wasOffline && (
        <Fade in={true}>
          <Alert 
            icon={<CloudDoneIcon />}
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: designSystem.borderRadius.md
            }}
          >
            ¡Conexión restablecida!
          </Alert>
        </Fade>
      )}
      
      {/* Tabs */}
      <Paper sx={{ 
        borderRadius: designSystem.borderRadius.md,
        overflow: 'hidden',
        boxShadow: designSystem.shadows.card
      }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{
            bgcolor: alpha(designSystem.colors.primary, 0.02),
            borderBottom: `1px solid ${alpha(designSystem.colors.grayLight, 0.1)}`,
            '& .MuiTab-root': { 
              py: 2, 
              fontWeight: 600, 
              textTransform: 'none',
              minWidth: { xs: 'auto', sm: 160 },
              fontSize: { xs: '0.85rem', sm: '1rem' }
            },
            '& .Mui-selected': { color: designSystem.colors.primary },
            '& .MuiTabs-indicator': { 
              background: designSystem.colors.primaryGradient, 
              height: 3,
              borderRadius: designSystem.borderRadius.xs
            }
          }}
        >
          <Tab label={`Descargadas (${downloads.length})`} />
          <Tab label={`En progreso (${activeDownloads.length})`} />
          <Tab label={`En cola (${queue.length})`} />
        </Tabs>
        
        {/* Panel Descargadas */}
        <TabPanel value={tabValue} index={0}>
          {downloads.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 } }}>
              <DownloadIcon sx={{ 
                fontSize: { xs: 40, sm: 60 }, 
                color: alpha(designSystem.colors.gray, 0.3), 
                mb: 2 
              }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                No hay canciones descargadas
              </Typography>
              <Typography variant="body2" sx={{ color: designSystem.colors.text.secondary, mb: 3 }}>
                Explora música y descarga tus canciones favoritas
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/')} 
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  background: designSystem.colors.primaryGradient,
                  width: { xs: '100%', sm: 'auto' },
                  borderRadius: designSystem.borderRadius.pill,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Explorar música
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mb: 3 
              }}>
                <SortMenu sortBy={sortBy} onSortChange={setSortBy} />
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
              <Typography sx={{ color: designSystem.colors.text.secondary }}>
                No hay descargas en progreso
              </Typography>
            </Box>
          ) : (
            activeDownloads.map((item) => (
              <Paper 
                key={item.id} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${alpha(designSystem.colors.primary, 0.1)}`
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 1.5,
                  gap: 1
                }}>
                  <Typography 
                    fontWeight={600}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Tooltip title="Cancelar descarga" arrow>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCancelDownload(item.id)}
                      sx={{ 
                        flexShrink: 0,
                        color: designSystem.colors.error,
                        '&:hover': {
                          backgroundColor: alpha(designSystem.colors.error, 0.08)
                        }
                      }}
                    >
                      <DeleteSweepIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: designSystem.borderRadius.xs,
                      bgcolor: alpha(designSystem.colors.primary, 0.1), 
                      '& .MuiLinearProgress-bar': { 
                        background: designSystem.colors.primaryGradient,
                        borderRadius: designSystem.borderRadius.xs
                      } 
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute',
                      right: 0,
                      top: -20,
                      color: designSystem.colors.primary,
                      fontWeight: 600
                    }}
                  >
                    {Math.round(item.progress)}%
                  </Typography>
                </Box>
              </Paper>
            ))
          )}
        </TabPanel>
        
        {/* Panel En cola */}
        <TabPanel value={tabValue} index={2}>
          {queue.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: designSystem.colors.text.secondary }}>
                No hay canciones en cola
              </Typography>
            </Box>
          ) : (
            queue.map((item, index) => (
              <Paper 
                key={item.songId} 
                sx={{ 
                  p: 2, 
                  mb: 1, 
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${alpha(designSystem.colors.grayLight, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(designSystem.colors.primary, 0.3)
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2 
                }}>
                  <Chip 
                    label={index + 1} 
                    size="small"
                    sx={{ 
                      minWidth: 32,
                      borderRadius: designSystem.borderRadius.xs,
                      bgcolor: alpha(designSystem.colors.primary, 0.1),
                      color: designSystem.colors.primary,
                      fontWeight: 600
                    }}
                  />
                  <Box sx={{ 
                    flex: 1,
                    minWidth: 0
                  }}>
                    <Typography 
                      fontWeight={600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.songTitle}
                    </Typography>
                    <Typography 
                      variant="caption"
                      sx={{ color: designSystem.colors.text.secondary }}
                    >
                      {item.artistName}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </TabPanel>
      </Paper>
      
      {/* Confirm Dialog Premium */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleClearAll}
        count={downloads.length}
      />
      
      {/* Snackbar premium */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={snackbar.duration} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
        sx={{
          bottom: { xs: 16, sm: 24 }
        }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled"
          iconMapping={{
            success: <CheckCircleIcon fontSize="small" />,
            error: <WarningIcon fontSize="small" />,
            info: <CloudDoneIcon fontSize="small" />,
            warning: <WarningIcon fontSize="small" />
          }}
          sx={{ 
            borderRadius: designSystem.borderRadius.pill,
            px: 3,
            py: 1,
            boxShadow: designSystem.shadows.drawer,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DownloadsPage;