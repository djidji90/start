// src/components/ui/LikeButton.jsx
import React from 'react';
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { Favorite, FavoriteBorder, Error as ErrorIcon } from '@mui/icons-material';
import useLike from '../hooks/services/useLike';

const COLORS = {
  liked: '#EF4444',      // Rojo cuando el usuario da like
  default: '#6B7280'     // Gris por defecto
};

/**
 * LikeButton - Componente profesional de likes
 * 
 * @param {Object} props
 * @param {Object} props.song - Objeto de la canción (requerido)
 * @param {string} props.size - Tamaño: 'small' | 'medium' | 'large'
 * @param {boolean} props.showNumber - Si muestra el contador numérico
 */
const LikeButton = ({ song, size = 'medium', showNumber = true }) => {
  // Validación
  if (!song?.id) return null;

  // Hook de likes
  const like = useLike(
    song.id,
    song.likes_count || 0,
    song.is_liked || false
  );

  // Estados
  const isLoading = like.isLoading || like.isToggling;
  const error = like.error;
  const isLiked = like.userLiked;

  // Tooltip
  const tooltipText = (() => {
    if (error) return 'Error al procesar like';
    if (isLoading) return 'Procesando...';
    if (isLiked) return 'Quitar like';
    return 'Dar like';
  })();

  // Manejador
  const handleClick = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    like.handleLike();
  };

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <IconButton
        onClick={handleClick}
        disabled={isLoading}
        size={size}
        sx={{
          color: isLiked ? COLORS.liked : COLORS.default,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: !isLoading ? 'scale(1.1)' : 'none',
          }
        }}
      >
        {isLoading ? (
          <CircularProgress size={size === 'small' ? 20 : 24} />
        ) : error ? (
          <ErrorIcon fontSize={size} />
        ) : isLiked ? (
          <Favorite fontSize={size} />
        ) : (
          <FavoriteBorder fontSize={size} />
        )}

        {/* Contador numérico (opcional) */}
        {showNumber && !isLoading && !error && like.likesCount > 0 && (
          <Typography
            component="span"
            variant="caption"
            sx={{
              ml: 0.5,
              fontSize: size === 'small' ? '0.6rem' : '0.7rem',
              color: isLiked ? COLORS.liked : 'text.secondary',
              fontWeight: isLiked ? 600 : 400,
            }}
          >
            {like.formatLikes(like.likesCount)}
          </Typography>
        )}
      </IconButton>
    </Tooltip>
  );
};

export default React.memo(LikeButton);