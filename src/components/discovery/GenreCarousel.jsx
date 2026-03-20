// ============================================
// src/components/discovery/GenreCarousel.jsx
// CARRUSEL HORIZONTAL DE GÉNEROS
// ✅ Estilo Spotify/SoundCloud
// ✅ Cards cuadradas con imagen de fondo
// ✅ Scroll horizontal suave
// ✅ Flechas de navegación
// ✅ Responsive
// ============================================

import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  MusicNote
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ============================================
// TARJETA DE GÉNERO (versión carrusel)
// ============================================
const GenreCarouselCard = ({ genre, onClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(genre);
    } else {
      navigate(`/genre/${encodeURIComponent(genre.name)}`);
    }
  };

  // Imagen de fondo (fallback a gradiente)
  const backgroundImage = !imageError && genre.sample_image
    ? `url(${genre.sample_image})`
    : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`;

  return (
    <Box
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: { xs: 140, sm: 160, md: 180 },
        height: { xs: 140, sm: 160, md: 180 },
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
        boxShadow: isHovered 
          ? `0 20px 30px -10px ${alpha(theme.palette.primary.main, 0.4)}`
          : `0 8px 16px ${alpha('#000', 0.1)}`,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, transparent 0%, ${alpha('#000', 0.7)} 100%)`,
          zIndex: 1,
          transition: 'opacity 0.3s ease',
          opacity: isHovered ? 0.9 : 0.7
        }
      }}
    >
      {/* Imagen de fondo */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          background: backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.5s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
        onError={() => setImageError(true)}
      />

      {/* Contenido superpuesto */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          color: 'white',
          p: 2,
          textAlign: 'left'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
            lineHeight: 1.2,
            mb: 0.5,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
            transition: 'transform 0.3s ease'
          }}
        >
          {genre.name}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: alpha('#fff', 0.9),
            fontWeight: 500,
            fontSize: '0.7rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            display: 'block',
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s ease'
          }}
        >
          {genre.song_count} {genre.song_count === 1 ? 'canción' : 'canciones'}
        </Typography>
      </Box>

      {/* Efecto de brillo en hover */}
      {isHovered && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 50%, ${alpha('#fff', 0.2)} 0%, transparent 70%)`,
            zIndex: 3,
            pointerEvents: 'none'
          }}
        />
      )}
    </Box>
  );
};

// ============================================
// SKELETON PARA CARGA
// ============================================
const GenreCarouselSkeleton = () => (
  <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <Box
        key={i}
        sx={{
          width: { xs: 140, sm: 160, md: 180 },
          height: { xs: 140, sm: 160, md: 180 },
          borderRadius: 3,
          flexShrink: 0,
          background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
          animation: 'pulse 1.5s infinite'
        }}
      />
    ))}
  </Box>
);

// ============================================
// CARRUSEL PRINCIPAL
// ============================================

/**
 * GenreCarousel - Carrusel horizontal de géneros
 * 
 * @param {Object} props
 * @param {Array} props.genres - Lista de géneros
 * @param {boolean} props.loading - Estado de carga
 * @param {function} props.onGenreClick - Función al hacer click en género
 */
const GenreCarousel = ({ genres, loading, onGenreClick }) => {
  const theme = useTheme();
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // ==========================================
  // CONTROL DE FLECHAS
  // ==========================================
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [genres]);

  // ==========================================
  // SCROLL HANDLERS
  // ==========================================
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return (
      <Box sx={{ position: 'relative', width: '100%' }}>
        <GenreCarouselSkeleton />
      </Box>
    );
  }

  if (!genres?.length) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', mb: 4 }}>
      {/* Flecha izquierda */}
      {showLeftArrow && (
        <IconButton
          onClick={() => scroll('left')}
          sx={{
            position: 'absolute',
            left: -12,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 4px 12px ${alpha('#000', 0.15)}`,
            color: theme.palette.primary.main,
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: theme.palette.primary.main,
              color: 'white',
            }
          }}
        >
          <ChevronLeft />
        </IconButton>
      )}

      {/* Flecha derecha */}
      {showRightArrow && (
        <IconButton
          onClick={() => scroll('right')}
          sx={{
            position: 'absolute',
            right: -12,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 4px 12px ${alpha('#000', 0.15)}`,
            color: theme.palette.primary.main,
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: theme.palette.primary.main,
              color: 'white',
            }
          }}
        >
          <ChevronRight />
        </IconButton>
      )}

      {/* Contenedor del carrusel */}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          py: 2,
          px: 1,
          '&::-webkit-scrollbar': {
            display: 'none'  // Ocultar scrollbar en Chrome/Safari
          },
          msOverflowStyle: 'none',  // Ocultar scrollbar en IE/Edge
          scrollbarWidth: 'none'    // Ocultar scrollbar en Firefox
        }}
      >
        {genres.map((genre) => (
          <GenreCarouselCard
            key={genre.name}
            genre={genre}
            onClick={onGenreClick}
          />
        ))}
      </Box>

      {/* Indicador de scroll (opcional) */}
      {genres.length > 5 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 2
          }}
        >
          {Array.from({ length: Math.ceil(genres.length / 5) }).map((_, i) => (
            <Box
              key={i}
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: i * scrollRef.current.clientWidth,
                    behavior: 'smooth'
                  });
                }
              }}
              sx={{
                width: 30,
                height: 4,
                borderRadius: 2,
                bgcolor: i === 0 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.2),
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.primary.light
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default GenreCarousel;