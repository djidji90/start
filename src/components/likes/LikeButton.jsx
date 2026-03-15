// ============================================
// src/components/ui/LikeButton.jsx
// VERSIÓN MEJORADA
// ✅ Botón más grande y visible
// ✅ Número DENTRO del área del botón
// ✅ Fondo gris suave para contraste
// ✅ Tooltip informativo
// ============================================

import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Typography,
  alpha
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import useLike from '../hooks/services/useLike';

// ============================================ //
// CONSTANTES DE DISEÑO
// ============================================ //
const COLORS = {
  liked: '#EF4444',
  gray: '#E5E7EB',        // Gris suave para fondo
  darkGray: '#9CA3AF'      // Gris más oscuro para texto
};

const SIZE_MAP = {
  small: {
    button: 36,
    icon: 18,
    number: '0.7rem',
    progress: 16
  },
  medium: {
    button: 42,
    icon: 20,
    number: '0.8rem',
    progress: 18
  },
  large: {
    button: 48,
    icon: 22,
    number: '0.9rem',
    progress: 20
  }
};

// ============================================ //
// COMPONENTE PRINCIPAL
// ============================================ //

const LikeButton = ({
  songId,
  initialLikes = 0,
  initialLiked = false,
  playsCount = 0,
  size = 'medium',
  showNumber = true,
  showPercentage = true,
  onLikeSuccess,
  onLikeError,
  className = '',
  ...rest
}) => {
  // Validación
  if (!songId) {
    console.warn('LikeButton: songId es requerido');
    return null;
  }

  // Hook de likes
  const like = useLike(songId, initialLikes, initialLiked);

  // Dimensiones
  const dimensions = SIZE_MAP[size] || SIZE_MAP.medium;

  // ========================================== //
  // CÁLCULOS
  // ========================================== //
  
  // Porcentaje de popularidad
  const likePercentage = playsCount > 0 
    ? Math.min((like.likesCount / playsCount) * 100, 100) 
    : 0;

  // Color del corazón
  const heartColor = like.userLiked ? COLORS.liked : COLORS.darkGray;

  // Tooltip
  const tooltipText = (() => {
    if (like.isLoading || like.isToggling) return 'Procesando...';
    
    const likesFormatted = like.likesCount.toLocaleString();
    
    if (playsCount > 0 && showPercentage) {
      return `${likesFormatted} like${like.likesCount !== 1 ? 's' : ''} • ${Math.round(likePercentage)}% popularidad`;
    }
    
    return `${likesFormatted} like${like.likesCount !== 1 ? 's' : ''}`;
  })();

  // Manejador
  const handleClick = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    like.handleLike();
    
    setTimeout(() => {
      if (like.error && onLikeError) {
        onLikeError(like.error);
      } else if (!like.error && onLikeSuccess) {
        onLikeSuccess({
          liked: like.userLiked,
          count: like.likesCount
        });
      }
    }, 500);
  };

  return (
    <Box
      className={`like-button-container ${className}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        ...rest.sx
      }}
    >
      <Tooltip title={tooltipText} arrow placement="top">
        <IconButton
          onClick={handleClick}
          disabled={like.isLoading || like.isToggling}
          sx={{
            width: dimensions.button,
            height: dimensions.button,
            bgcolor: COLORS.gray,
            color: heartColor,
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(COLORS.gray, 0.8),
              transform: 'scale(1.05)'
            },
            '&.Mui-disabled': {
              bgcolor: alpha(COLORS.gray, 0.5),
              opacity: 0.7
            }
          }}
        >
          {like.isLoading || like.isToggling ? (
            <CircularProgress 
              size={dimensions.progress} 
              sx={{ color: heartColor }} 
            />
          ) : like.userLiked ? (
            <Favorite sx={{ fontSize: dimensions.icon }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: dimensions.icon }} />
          )}
        </IconButton>
      </Tooltip>

      {/* Número de likes - DENTRO del área del botón */}
      {showNumber && like.likesCount > 0 && !like.isLoading && !like.error && (
        <Tooltip title={`${like.likesCount} likes`} arrow placement="top">
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: dimensions.number,
              fontWeight: 600,
              color: COLORS.darkGray,
              bgcolor: 'white',
              borderRadius: '10px',
              px: 0.5,
              minWidth: 20,
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: `1px solid ${alpha(COLORS.darkGray, 0.2)}`,
              zIndex: 2
            }}
          >
            {like.formatLikes(like.likesCount)}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

export default React.memo(LikeButton);