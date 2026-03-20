// ============================================
// src/components/discovery/DiscoverySection.jsx
// VERSIÓN CORREGIDA - ERROR DE SKELETON SOLUCIONADO
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
  useMediaQuery
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  AccessTime,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import SectionHeader from '../../components/discovery/SectionHeader';
import SongCard from '../../songs/SongCard';

// ============================================
// SKELETON PARA CARDS DEL CARRUSEL (CORREGIDO)
// ============================================

const CarouselCardSkeleton = () => {
  const theme = useTheme();
  
  // Usar useMediaQuery para responsive en Skeleton
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  let skeletonHeight = 180; // default para lg
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
        height={skeletonHeight} // 👈 AHORA ES UN NÚMERO, NO UN OBJETO
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
  ...rest
}) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // ==========================================
  // DETERMINAR FUENTE DE DATOS
  // ==========================================
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

  // ==========================================
  // CONTROLES DE SCROLL
  // ==========================================
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

  // ==========================================
  // RENDER POR ESTADO
  // ==========================================

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
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              <Refresh fontSize="small" />
            </Button>
          }
          sx={{ mt: 2 }}
        >
          Error al cargar {title?.toLowerCase() || 'sección'}: {error.message}
        </Alert>
      </Box>
    );
  }

  if (displaySongs.length === 0) {
    if (hideIfEmpty) return null;

    return (
      <Box sx={{ mb: 4 }} {...rest}>
        <SectionHeader title={title} icon={icon} />
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay {title?.toLowerCase() || 'elementos'} disponibles
        </Alert>
      </Box>
    );
  }

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================
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
  showControls = true
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
        />
      ))}
    </Box>
  );
};

export default DiscoverySection;