// ============================================
// src/components/discovery/GenreCard.jsx
// TARJETA DE GÉNERO - ESTILO SPOTIFY/SOUNDCLOUD
// ✅ Diseño cuadrado tipo card
// ✅ Imagen de fondo con overlay
// ✅ Título grande y legible
// ✅ Conteo de canciones
// ✅ Hover effects profesionales
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * GenreCard - Tarjeta de género estilo Spotify
 * 
 * @param {Object} props
 * @param {Object} props.genre - Objeto del género { name, song_count, sample_image }
 * @param {string} props.size - Tamaño: 'small' | 'medium' | 'large'
 * @param {function} props.onClick - Función al hacer click
 */
const GenreCard = ({ genre, size = 'medium', onClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ==========================================
  // TAMAÑOS RESPONSIVE
  // ==========================================
  const sizeMap = {
    small: {
      width: { xs: 140, sm: 160 },
      height: { xs: 140, sm: 160 },
      fontSize: '1.2rem',
      iconSize: 32
    },
    medium: {
      width: { xs: 160, sm: 180, md: 200 },
      height: { xs: 160, sm: 180, md: 200 },
      fontSize: { xs: '1.3rem', sm: '1.5rem' },
      iconSize: 48
    },
    large: {
      width: { xs: 180, sm: 220, md: 240 },
      height: { xs: 180, sm: 220, md: 240 },
      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
      iconSize: 64
    }
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  // ==========================================
  // HANDLER CLICK
  // ==========================================
  const handleClick = () => {
    if (onClick) {
      onClick(genre);
    } else {
      navigate(`/genre/${encodeURIComponent(genre.name)}`);
    }
  };

  // ==========================================
  // IMAGEN DE FONDO
  // ==========================================
  const backgroundImage = !imageError && genre.sample_image
    ? genre.sample_image
    : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`;

  return (
    <Card
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
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
      {typeof backgroundImage === 'string' && backgroundImage.startsWith('http') ? (
        <CardMedia
          component="img"
          image={backgroundImage}
          alt={genre.name}
          onError={() => setImageError(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: backgroundImage,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          <MusicNote sx={{ 
            fontSize: dimensions.iconSize, 
            color: alpha('#fff', 0.3) 
          }} />
        </Box>
      )}

      {/* Contenido superpuesto */}
      <CardContent
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
            fontSize: dimensions.fontSize,
            lineHeight: 1.2,
            mb: 0.5,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
            transition: 'transform 0.3s ease'
          }}
        >
          {genre.name}
        </Typography>

        <Fade in={isHovered}>
          <Typography
            variant="caption"
            sx={{
              color: alpha('#fff', 0.9),
              fontWeight: 500,
              fontSize: '0.75rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              display: 'block'
            }}
          >
            {genre.song_count} {genre.song_count === 1 ? 'canción' : 'canciones'}
          </Typography>
        </Fade>
      </CardContent>

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
    </Card>
  );
};

// ============================================
// COMPONENTE PARA GRID DE GÉNEROS
// ============================================

/**
 * GenreGrid - Grid de tarjetas de género
 */
export const GenreGrid = ({ genres, size = 'medium', cols = { xs: 2, sm: 3, md: 4, lg: 5 } }) => {
  const theme = useTheme();

  if (!genres?.length) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${cols.xs}, 1fr)`,
          sm: `repeat(${cols.sm}, 1fr)`,
          md: `repeat(${cols.md}, 1fr)`,
          lg: `repeat(${cols.lg}, 1fr)`,
        },
        gap: 2,
        justifyContent: 'center'
      }}
    >
      {genres.map((genre) => (
        <Box
          key={genre.name}
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <GenreCard genre={genre} size={size} />
        </Box>
      ))}
    </Box>
  );
};

export default GenreCard;