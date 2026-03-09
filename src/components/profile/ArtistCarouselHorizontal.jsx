// src/components/theme/musica/ArtistCarouselHorizontal.jsx
import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  alpha,
  useTheme,
  Skeleton,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  MusicNote as MusicNoteIcon,
  TrendingUp,
  ArrowForward
} from '@mui/icons-material';
import ArtistCard from '../../components/profile/ArtistCard'; // Tarjeta circular para artista (estilo Spotify)

const ArtistCarouselHorizontal = ({ 
  artists = [], 
  title = "Selección para ti",
  subtitle = "Artistas que podrían gustarte",
  loading = false,
  viewAllLink = ""
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredButton, setHoveredButton] = useState(null);

  const primaryColor = theme.palette.primary.main;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [artists]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      const newPosition = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  // Skeletons de carga con estilo premium
  if (loading) {
    return (
      <Box sx={{ mb: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width={150} height={20} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
          {[...Array(6)].map((_, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                minWidth: { xs: 140, sm: 160, md: 180 },
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(primaryColor, 0.03),
              }}
            >
              <Skeleton variant="circular" width="100%" height="auto" sx={{ aspectRatio: '1/1' }} />
              <Skeleton variant="text" width="80%" sx={{ mt: 1.5, mx: 'auto' }} />
              <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  if (!artists.length) return null;

  return (
    <Box sx={{ mb: 6 }}>
      {/* Header premium */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        mb: 2,
      }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
              background: `linear-gradient(135deg, ${primaryColor}, ${alpha(primaryColor, 0.7)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 0.5,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: alpha('#000', 0.5),
                fontWeight: 400,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Controles de navegación y "Ver todo" */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Botones de navegación (solo desktop) */}
          {!isMobile && (
            <>
              <IconButton
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                onMouseEnter={() => setHoveredButton('left')}
                onMouseLeave={() => setHoveredButton(null)}
                sx={{
                  bgcolor: alpha(primaryColor, 0.05),
                  color: canScrollLeft ? primaryColor : alpha('#000', 0.2),
                  width: 40,
                  height: 40,
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    bgcolor: alpha(primaryColor, 0.15),
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                onMouseEnter={() => setHoveredButton('right')}
                onMouseLeave={() => setHoveredButton(null)}
                sx={{
                  bgcolor: alpha(primaryColor, 0.05),
                  color: canScrollRight ? primaryColor : alpha('#000', 0.2),
                  width: 40,
                  height: 40,
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    bgcolor: alpha(primaryColor, 0.15),
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}

          {/* Enlace "Ver todo" */}
          <IconButton
            href={viewAllLink}
            sx={{
              color: primaryColor,
              bgcolor: alpha(primaryColor, 0.05),
              width: 40,
              height: 40,
              ml: 0.5,
              '&:hover': {
                bgcolor: alpha(primaryColor, 0.15),
                transform: 'translateX(4px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      </Box>

      {/* Carrusel horizontal con gradientes laterales */}
      <Box sx={{ position: 'relative' }}>
        {/* Gradiente izquierdo (opcional) */}
        {canScrollLeft && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 60,
              background: `linear-gradient(90deg, ${alpha('#fff', 0.95)} 0%, transparent 100%)`,
              zIndex: 2,
              pointerEvents: 'none',
              borderRadius: '8px 0 0 8px',
            }}
          />
        )}

        {/* Gradiente derecho (opcional) */}
        {canScrollRight && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 60,
              background: `linear-gradient(90deg, transparent 0%, ${alpha('#fff', 0.95)} 100%)`,
              zIndex: 2,
              pointerEvents: 'none',
              borderRadius: '0 8px 8px 0',
            }}
          />
        )}

        {/* Contenedor del carrusel */}
        <Box
          ref={scrollRef}
          onScroll={checkScroll}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            py: 1,
            px: 0.5,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {artists.map((artist, index) => (
            <Box
              key={artist.username}
              sx={{
                minWidth: { xs: 140, sm: 160, md: 180, lg: 200 },
                maxWidth: { xs: 140, sm: 160, md: 180, lg: 200 },
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <ArtistCard artist={artist} index={index} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Indicador sutil de scroll (opcional, para móvil) */}
      {isMobile && canScrollRight && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 3,
              bgcolor: alpha(primaryColor, 0.3),
              borderRadius: 1,
            }}
          />
          <Box
            sx={{
              width: 15,
              height: 3,
              bgcolor: alpha('#000', 0.1),
              borderRadius: 1,
            }}
          />
          <Box
            sx={{
              width: 15,
              height: 3,
              bgcolor: alpha('#000', 0.1),
              borderRadius: 1,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ArtistCarouselHorizontal;