// ============================================
// src/components/discovery/DiscoverySection.jsx
// VERSIÓN MEJORADA - MANEJO DE ERRORES PROFESIONAL
// ============================================

import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Skeleton,
  useTheme,
  alpha,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  Typography,
  Paper,
  Fade,
  Grow
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  AccessTime,
  ChevronLeft,
  ChevronRight,
  ErrorOutline,
  WifiOff,
  HourglassEmpty,
  Block,
  Settings,
  Home,
  MusicOff
} from '@mui/icons-material';
import SectionHeader from '../../components/discovery/SectionHeader';
import SongCard from '../../songs/SongCard';

// ============================================
// COMPONENTE DE ERROR MEJORADO
// ============================================

/**
 * ErrorDisplay - Muestra errores de forma amigable y profesional
 */
const ErrorDisplay = ({ 
  error, 
  onRetry, 
  title = "Error", 
  variant = "section",
  showIcon = true,
  customMessage = null
}) => {
  const theme = useTheme();
  
  // Determinar el tipo de error y mensaje amigable
  const getErrorDetails = () => {
    const status = error?.status || error?.response?.status;
    const message = error?.message || error?.response?.data?.message || error?.toString();
    
    // Mapeo de códigos de error a mensajes amigables
    const errorMap = {
      400: {
        title: "Solicitud incorrecta",
        message: "No pudimos procesar tu solicitud. Por favor, verifica la información e intenta de nuevo.",
        icon: <ErrorOutline />,
        color: "warning",
        action: "Reintentar"
      },
      401: {
        title: "No autorizado",
        message: "Necesitas iniciar sesión para ver este contenido.",
        icon: <Block />,
        color: "warning",
        action: "Iniciar sesión"
      },
      403: {
        title: "Acceso denegado",
        message: "No tienes permiso para acceder a este contenido.",
        icon: <Block />,
        color: "error",
        action: "Contactar soporte"
      },
      404: {
        title: "Contenido no encontrado",
        message: "No encontramos lo que buscabas. Puede que haya sido movido o eliminado.",
        icon: <MusicOff />,
        color: "info",
        action: "Explorar más música"
      },
      429: {
        title: "Demasiadas solicitudes",
        message: "Has realizado muchas solicitudes. Por favor, espera un momento antes de intentar de nuevo.",
        icon: <HourglassEmpty />,
        color: "warning",
        action: "Reintentar"
      },
      500: {
        title: "Error del servidor",
        message: "Tuvimos un problema técnico. Nuestro equipo ya está trabajando en ello.",
        icon: <ErrorOutline />,
        color: "error",
        action: "Reintentar"
      },
      503: {
        title: "Servicio no disponible",
        message: "El servicio está temporalmente no disponible. Por favor, inténtalo más tarde.",
        icon: <WifiOff />,
        color: "warning",
        action: "Reintentar"
      }
    };
    
    // Si no hay conexión
    if (message?.includes('Network') || message?.includes('network') || error?.code === 'ERR_NETWORK') {
      return {
        title: "Sin conexión",
        message: "No pudimos conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.",
        icon: <WifiOff />,
        color: "warning",
        action: "Reintentar"
      };
    }
    
    const mapped = errorMap[status] || {
      title: title,
      message: customMessage || message || "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
      icon: <ErrorOutline />,
      color: "error",
      action: "Reintentar"
    };
    
    return mapped;
  };
  
  const details = getErrorDetails();
  
  // Acciones según el tipo de error
  const handleAction = () => {
    if (details.action === "Iniciar sesión") {
      window.location.href = '/login';
    } else if (details.action === "Contactar soporte") {
      window.location.href = '/support';
    } else if (details.action === "Explorar más música") {
      window.location.href = '/discover';
    } else {
      onRetry?.();
    }
  };
  
  // Estilos según variante
  if (variant === "card") {
    return (
      <Grow in={true} timeout={300}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: alpha(theme.palette[details.color].main, 0.05),
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette[details.color].main, 0.1)}`,
            transition: 'all 0.2s ease'
          }}
        >
          <Box sx={{ 
            display: 'inline-flex', 
            p: 1.5, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette[details.color].main, 0.1),
            mb: 2
          }}>
            {React.cloneElement(details.icon, { 
              sx: { fontSize: 40, color: `${details.color}.main` } 
            })}
          </Box>
          <Typography variant="h6" gutterBottom fontWeight="600">
            {details.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {details.message}
          </Typography>
          <Button
            variant="outlined"
            color={details.color}
            onClick={handleAction}
            startIcon={details.action === "Reintentar" ? <Refresh /> : null}
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {details.action}
          </Button>
        </Paper>
      </Grow>
    );
  }
  
  // Variante por defecto (section)
  return (
    <Fade in={true} timeout={400}>
      <Box sx={{ mt: 2, mb: 3 }}>
        <Alert
          severity={details.color}
          icon={showIcon ? details.icon : false}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onRetry && (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={onRetry}
                  startIcon={<Refresh fontSize="small" />}
                  sx={{ textTransform: 'none' }}
                >
                  Reintentar
                </Button>
              )}
              {details.action !== "Reintentar" && (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleAction}
                  sx={{ textTransform: 'none' }}
                >
                  {details.action}
                </Button>
              )}
            </Box>
          }
          sx={{
            borderRadius: 2,
            '& .MuiAlert-message': {
              flex: 1
            },
            borderLeft: `4px solid ${theme.palette[details.color].main}`,
            boxShadow: `0 2px 8px ${alpha(theme.palette[details.color].main, 0.1)}`
          }}
        >
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            {details.title}
          </Typography>
          <Typography variant="body2">
            {details.message}
          </Typography>
          {error?.status && process.env.NODE_ENV === 'development' && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 1, 
                display: 'block',
                color: 'text.secondary',
                fontFamily: 'monospace'
              }}
            >
              Código: {error.status} | {error.message}
            </Typography>
          )}
        </Alert>
      </Box>
    </Fade>
  );
};

// ============================================
// SKELETON PARA CARDS DEL CARRUSEL
// ============================================

const CarouselCardSkeleton = () => {
  const theme = useTheme();
  
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  let skeletonHeight = 180;
  if (isXs) skeletonHeight = 140;
  else if (isSm) skeletonHeight = 160;
  else if (isMd) skeletonHeight = 170;
  
  return (
    <Box sx={{ 
      width: { xs: 140, sm: 160, md: 170, lg: 180 },
      flexShrink: 0,
      mr: 2
    }}>
      <Skeleton 
        variant="rounded" 
        width="100%" 
        height={skeletonHeight}
        sx={{ 
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05)
        }} 
      />
      <Box sx={{ mt: 1, px: 0.5 }}>
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="70%" height={14} />
      </Box>
    </Box>
  );
};

const CarouselSkeleton = ({ cards = 8 }) => {
  return (
    <Box sx={{ display: 'flex', overflow: 'hidden', py: 1 }}>
      {Array.from({ length: cards }).map((_, i) => (
        <CarouselCardSkeleton key={i} />
      ))}
    </Box>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * DiscoverySection - Carrusel horizontal de SongCards
 */
const DiscoverySection = ({
  title,
  subtitle,
  icon,
  queryResult,
  songs: directSongs,
  limit = 20,
  cardProps = {},
  onPlay,
  onLike,
  onMore,
  onSongClick,
  filters,
  hideIfEmpty = true,
  showIndex = false,
  showControls = true,
  errorVariant = "section",
  customErrorMessage = null,
  ...rest
}) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Determinar fuente de datos
  const isLoading = queryResult?.isLoading || false;
  const error = queryResult?.error || null;
  const refetch = queryResult?.refetch;

  let songs = [];
  if (queryResult?.data?.data) {
    songs = queryResult.data.data;
  } else if (directSongs) {
    songs = directSongs;
  }

  const displaySongs = songs.slice(0, limit);

  // Controles de scroll
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 10);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [displaySongs]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Render por estado
  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }} {...rest}>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
        />
        <CarouselSkeleton cards={Math.min(limit, 8)} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 4 }} {...rest}>
        <SectionHeader title={title} icon={icon} />
        <ErrorDisplay 
          error={error}
          onRetry={refetch}
          title={title}
          variant={errorVariant}
          customMessage={customErrorMessage}
        />
      </Box>
    );
  }

  if (displaySongs.length === 0) {
    if (hideIfEmpty) return null;

    return (
      <Box sx={{ mb: 4 }} {...rest}>
        <SectionHeader title={title} icon={icon} />
        <Alert 
          severity="info" 
          icon={<MusicOff />}
          sx={{ 
            mt: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05)
          }}
        >
          <Typography variant="body2">
            No hay {title?.toLowerCase() || 'elementos'} disponibles en este momento.
            {refetch && " Vuelve a intentarlo más tarde."}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Render principal
  return (
    <Box
      sx={{
        mb: 4,
        position: 'relative',
        '&:hover .carousel-controls': {
          opacity: 1
        }
      }}
      {...rest}
    >
      <SectionHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        total={songs.length}
      >
        {filters}
      </SectionHeader>

      <Box sx={{ position: 'relative' }}>
        {showControls && showLeftArrow && (
          <Tooltip title="Anterior" arrow placement="top">
            <IconButton
              onClick={() => scroll('left')}
              sx={{
                position: 'absolute',
                left: -16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
                boxShadow: theme.shadows[4],
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: theme.palette.background.paper,
                  transform: 'translateY(-50%) scale(1.05)'
                },
                opacity: { xs: 0, md: 1 },
                transition: 'opacity 0.2s ease'
              }}
              className="carousel-controls"
            >
              <ChevronLeft />
            </IconButton>
          </Tooltip>
        )}

        {showControls && showRightArrow && (
          <Tooltip title="Siguiente" arrow placement="top">
            <IconButton
              onClick={() => scroll('right')}
              sx={{
                position: 'absolute',
                right: -16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
                boxShadow: theme.shadows[4],
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: theme.palette.background.paper,
                  transform: 'translateY(-50%) scale(1.05)'
                },
                opacity: { xs: 0, md: 1 },
                transition: 'opacity 0.2s ease'
              }}
              className="carousel-controls"
            >
              <ChevronRight />
            </IconButton>
          </Tooltip>
        )}

        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            py: 1,
            px: 0.5,
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 3,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
              }
            },
            maskImage: showLeftArrow || showRightArrow 
              ? 'linear-gradient(90deg, transparent 0, black 30px, black calc(100% - 30px), transparent 100%)'
              : 'none',
            WebkitMaskImage: showLeftArrow || showRightArrow
              ? 'linear-gradient(90deg, transparent 0, black 30px, black calc(100% - 30px), transparent 100%)'
              : 'none',
          }}
        >
          {displaySongs.map((song, index) => (
            <Box
              key={song.id}
              sx={{
                width: { xs: 130, sm: 150, md: 170, lg: 180 },
                flexShrink: 0,
                mr: 2,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <SongCard
                song={song}
                showIndex={showIndex ? index + 1 : false}
                onPlay={onPlay}
                onLike={onLike}
                onMoreActions={onMore}
                onClick={onSongClick}
                variant="compact"
                {...cardProps}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// ============================================
// VARIANTES PREDEFINIDAS
// ============================================

DiscoverySection.Trending = (props) => (
  <DiscoverySection
    {...props}
    icon={<TrendingUp />}
    showIndex={true}
  />
);

DiscoverySection.Recent = (props) => (
  <DiscoverySection
    {...props}
    icon={<AccessTime />}
    showIndex={false}
  />
);

DiscoverySection.Simple = (props) => (
  <DiscoverySection
    {...props}
    showControls={false}
  />
);

// ============================================
// COMPONENTE PARA MÚLTIPLES SECCIONES
// ============================================

export const DiscoveryGrid = ({ 
  sections, 
  onPlay, 
  onLike, 
  onMore, 
  onSongClick,
  showControls = true,
  errorVariant = "section"
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {sections.map((section, index) => (
        <DiscoverySection
          key={section.id || index}
          title={section.title}
          subtitle={section.subtitle}
          icon={section.icon}
          queryResult={section.queryResult}
          songs={section.songs}
          limit={section.limit || 20}
          showIndex={section.showIndex}
          showControls={section.showControls !== undefined ? section.showControls : showControls}
          onPlay={onPlay}
          onLike={onLike}
          onMore={onMore}
          onSongClick={onSongClick}
          filters={section.filters}
          cardProps={section.cardProps}
          errorVariant={section.errorVariant || errorVariant}
          customErrorMessage={section.customErrorMessage}
        />
      ))}
    </Box>
  );
};

export default DiscoverySection;