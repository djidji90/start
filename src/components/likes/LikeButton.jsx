// ============================================
// src/components/ui/LikeButton.jsx
// COMPONENTE PROFESIONAL DE LIKES
// ✅ Totalmente independiente
// ✅ Corazón con relleno según popularidad
// ✅ Formato de números (1.2K)
// ✅ Tooltips informativos
// ✅ Optimistic updates
// ✅ Fácil de reutilizar
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
import useLike from '../../components/hook/services/useLike';

// ============================================ //
// CONSTANTES DE DISEÑO
// ============================================ //
const COLORS = {
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  gray: '#6B7280'
};

const SIZE_MAP = {
  small: {
    icon: 14,
    number: '0.6rem',
    button: 24,
    progress: 12
  },
  medium: {
    icon: 18,
    number: '0.7rem',
    button: 32,
    progress: 16
  },
  large: {
    icon: 22,
    number: '0.8rem',
    button: 40,
    progress: 20
  }
};

// ============================================ //
// COMPONENTE PRINCIPAL
// ============================================ //

/**
 * LikeButton - Componente profesional para gestión de likes
 * 
 * @param {Object} props
 * @param {string|number} props.songId - ID de la canción (obligatorio)
 * @param {number} props.initialLikes - Número inicial de likes (song.likes_count)
 * @param {boolean} props.initialLiked - Si el usuario ya dio like (song.is_liked)
 * @param {number} props.playsCount - Número de reproducciones (para calcular %)
 * @param {string} props.size - Tamaño del botón: 'small' | 'medium' | 'large'
 * @param {boolean} props.showNumber - Si debe mostrar el contador numérico
 * @param {boolean} props.showPercentage - Si debe mostrar % en tooltip
 * @param {function} props.onLikeSuccess - Callback cuando el like es exitoso
 * @param {function} props.onLikeError - Callback cuando hay error
 * @param {string} props.className - Clases CSS adicionales
 */
const LikeButton = ({
  songId,
  initialLikes = 0,
  initialLiked = false,
  playsCount = 0,
  size = 'small',
  showNumber = true,
  showPercentage = true,
  onLikeSuccess,
  onLikeError,
  className = '',
  ...rest
}) => {
  // Validación básica
  if (!songId) {
    console.warn('LikeButton: songId es requerido');
    return null;
  }

  // Hook de likes
  const like = useLike(songId, initialLikes, initialLiked);

  // Obtener dimensiones según tamaño
  const dimensions = SIZE_MAP[size] || SIZE_MAP.small;

  // ========================================== //
  // CÁLCULOS DE POPULARIDAD
  // ========================================== //
  
  // Porcentaje de likes respecto a reproducciones
  const likePercentage = playsCount > 0 
    ? Math.min((like.likesCount / playsCount) * 100, 100) 
    : 0;
    
  // Relleno del corazón (0-100%)
  const heartFill = like.userLiked ? 100 : Math.min(likePercentage, 100);
  
  // Color según estado
  const heartColor = (() => {
    if (like.userLiked) return COLORS.error;
    if (heartFill >= 75) return COLORS.error;
    if (heartFill >= 50) return COLORS.warning;
    if (heartFill >= 25) return COLORS.success;
    return COLORS.gray;
  })();

  // Tooltip dinámico
  const tooltipText = (() => {
    if (like.isLoading || like.isToggling) return 'Procesando...';
    
    const likesFormatted = like.likesCount.toLocaleString();
    
    if (playsCount > 0 && showPercentage) {
      return `${likesFormatted} like${like.likesCount !== 1 ? 's' : ''} • ${Math.round(likePercentage)}% popularidad`;
    }
    
    return `${likesFormatted} like${like.likesCount !== 1 ? 's' : ''}`;
  })();

  // ========================================== //
  // MANEJADOR DE CLICK
  // ========================================== //
  const handleClick = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    // Ejecutar el like (el hook maneja optimistic updates)
    like.handleLike();
    
    // Callbacks (opcional)
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

  // ========================================== //
  // RENDERIZADO
  // ========================================== //
  return (
    <Box
      className={`like-button-container ${className}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.3,
        ...rest.sx
      }}
    >
      {/* Botón de like animado */}
      <Tooltip
        title={tooltipText}
        arrow
        placement="top"
        enterDelay={500}
        leaveDelay={200}
      >
        <IconButton
          size="small"
          onClick={handleClick}
          disabled={like.isLoading || like.isToggling}
          sx={{
            color: heartColor,
            transition: 'all 0.2s ease',
            p: 0.5,
            width: dimensions.button,
            height: dimensions.button,
            '&:hover': {
              transform: 'scale(1.1)',
              bgcolor: alpha(heartColor, 0.1)
            },
            '&.Mui-disabled': {
              opacity: 0.7
            }
          }}
        >
          {like.isLoading || like.isToggling ? (
            <CircularProgress
              size={dimensions.progress}
              sx={{
                color: heartColor,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.6 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.6 }
                }
              }}
            />
          ) : (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              {/* Corazón de fondo (contorno) */}
              <FavoriteBorder
                sx={{
                  fontSize: dimensions.icon,
                  color: heartColor,
                  opacity: 0.3
                }}
              />
              
              {/* Corazón relleno según porcentaje */}
              <Favorite
                sx={{
                  fontSize: dimensions.icon,
                  color: heartColor,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transition: 'clip-path 0.3s ease',
                  clipPath: `inset(0 ${100 - heartFill}% 0 0)`
                }}
              />
            </Box>
          )}
        </IconButton>
      </Tooltip>

      {/* Contador numérico (opcional) */}
      {showNumber && like.likesCount > 0 && (
        <Tooltip
          title={`${like.likesCount.toLocaleString()} likes`}
          arrow
          placement="top"
          enterDelay={500}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: dimensions.number,
              color: like.userLiked ? COLORS.error : 'text.secondary',
              fontWeight: like.userLiked ? 600 : 400,
              minWidth: like.likesCount > 999 ? '32px' : '24px',
              textAlign: 'center',
              cursor: 'default',
              transition: 'color 0.2s ease',
              userSelect: 'none'
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