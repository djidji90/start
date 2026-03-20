// ============================================
// src/components/discovery/GenreChip.jsx
// CHIP PROFESIONAL PARA GÉNEROS MUSICALES
// ✅ Género + conteo de canciones
// ✅ Imagen representativa
// ✅ Múltiples variantes de tamaño
// ✅ Hover effects
// ✅ Animaciones suaves
// ============================================

import React from 'react';
import { 
  Chip, 
  Avatar, 
  Box, 
  Typography, 
  Tooltip,
  useTheme,
  alpha 
} from '@mui/material';
import { MusicNote, ChevronRight } from '@mui/icons-material';

// ============================================
// CONSTANTES DE TAMAÑO
// ============================================
const SIZE_MAP = {
  small: {
    chipHeight: 32,
    avatarSize: 24,
    fontSize: '0.7rem',
    iconSize: 16,
    px: 1
  },
  medium: {
    chipHeight: 40,
    avatarSize: 32,
    fontSize: '0.8rem',
    iconSize: 18,
    px: 1.5
  },
  large: {
    chipHeight: 48,
    avatarSize: 36,
    fontSize: '0.9rem',
    iconSize: 20,
    px: 2
  }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * GenreChip - Chip interactivo para géneros musicales
 * 
 * @param {Object} props
 * @param {Object} props.genre - Objeto del género { name, song_count, sample_image }
 * @param {string} props.size - Tamaño: 'small' | 'medium' | 'large'
 * @param {boolean} props.clickable - Si es clickeable
 * @param {boolean} props.selected - Si está seleccionado
 * @param {function} props.onClick - Función al hacer click
 * @param {boolean} props.showCount - Mostrar conteo de canciones
 * @param {boolean} props.showIcon - Mostrar icono musical
 * @param {string} props.variant - Variante: 'default' | 'outlined' | 'filled'
 */
const GenreChip = ({
  genre,
  size = 'medium',
  clickable = true,
  selected = false,
  onClick,
  showCount = true,
  showIcon = true,
  variant = 'default',
  ...rest
}) => {
  const theme = useTheme();
  const dimensions = SIZE_MAP[size] || SIZE_MAP.medium;

  // Si no hay género, no renderizar
  if (!genre?.name) return null;

  // ==========================================
  // ESTILOS DINÁMICOS
  // ==========================================
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          bgcolor: 'transparent',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          color: theme.palette.text.primary,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderColor: theme.palette.primary.main,
          }
        };
      case 'filled':
        return {
          bgcolor: theme.palette.primary.main,
          color: 'white',
          border: 'none',
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
          }
        };
      default: // 'default'
        return {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.text.primary,
          border: 'none',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.15),
          }
        };
    }
  };

  // ==========================================
  // AVATAR (imagen o icono)
  // ==========================================
  const renderAvatar = () => {
    // Si tiene imagen, mostrar avatar con imagen
    if (genre.sample_image) {
      return (
        <Avatar
          src={genre.sample_image}
          alt={genre.name}
          sx={{
            width: dimensions.avatarSize,
            height: dimensions.avatarSize,
            borderRadius: '4px',
            objectFit: 'cover'
          }}
        />
      );
    }

    // Si no tiene imagen pero showIcon es true, mostrar icono musical
    if (showIcon) {
      return (
        <Avatar
          sx={{
            width: dimensions.avatarSize,
            height: dimensions.avatarSize,
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.primary.main,
            borderRadius: '4px'
          }}
        >
          <MusicNote sx={{ fontSize: dimensions.iconSize }} />
        </Avatar>
      );
    }

    // Sin avatar
    return null;
  };

  // ==========================================
  // LABEL (nombre + conteo)
  // ==========================================
  const renderLabel = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: selected ? 600 : 400,
          fontSize: dimensions.fontSize,
          lineHeight: 1.2
        }}
      >
        {genre.name}
      </Typography>

      {showCount && genre.song_count > 0 && (
        <Typography
          variant="caption"
          sx={{
            color: selected 
              ? 'inherit' 
              : alpha(theme.palette.text.secondary, 0.8),
            fontSize: `calc(${dimensions.fontSize} - 0.1rem)`,
            fontWeight: 500,
            bgcolor: selected 
              ? 'transparent' 
              : alpha(theme.palette.background.paper, 0.5),
            px: 0.5,
            borderRadius: 1
          }}
        >
          {genre.song_count}
        </Typography>
      )}
    </Box>
  );

  // ==========================================
  // TOOLTIP (para géneros largos)
  // ==========================================
  const shouldTruncate = genre.name.length > 20;
  const displayName = shouldTruncate 
    ? `${genre.name.substring(0, 18)}...` 
    : genre.name;

  return (
    <Tooltip
      title={shouldTruncate ? genre.name : ''}
      arrow
      placement="top"
    >
      <Chip
        avatar={renderAvatar()}
        label={renderLabel()}
        onClick={clickable ? onClick : undefined}
        clickable={clickable}
        deleteIcon={selected ? <ChevronRight /> : undefined}
        onDelete={selected ? onClick : undefined}
        sx={{
          height: dimensions.chipHeight,
          borderRadius: dimensions.chipHeight / 2,
          px: dimensions.px,
          transition: 'all 0.2s ease',
          cursor: clickable ? 'pointer' : 'default',
          '& .MuiChip-avatar': {
            ml: 0,
            mr: 0.5
          },
          '& .MuiChip-label': {
            px: 1,
            py: 0,
            display: 'flex',
            alignItems: 'center'
          },
          '& .MuiChip-deleteIcon': {
            margin: '0 4px 0 0',
            color: 'inherit',
            fontSize: dimensions.iconSize,
            '&:hover': {
              color: theme.palette.primary.main,
              transform: 'translateX(2px)'
            }
          },
          ...getVariantStyles(),
          ...(selected && {
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '& .MuiChip-avatar': {
              bgcolor: alpha('#fff', 0.2)
            },
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            }
          }),
          ...rest.sx
        }}
      />
    </Tooltip>
  );
};

// ============================================
// VARIANTES PREDEFINIDAS
// ============================================

/**
 * Versión pequeña para móviles o espacios reducidos
 */
GenreChip.Small = (props) => (
  <GenreChip {...props} size="small" />
);

/**
 * Versión grande para destacar
 */
GenreChip.Large = (props) => (
  <GenreChip {...props} size="large" variant="filled" />
);

/**
 * Versión con icono siempre visible
 */
GenreChip.WithIcon = (props) => (
  <GenreChip {...props} showIcon={true} />
);

/**
 * Versión sin conteo (solo nombre)
 */
GenreChip.Compact = (props) => (
  <GenreChip {...props} showCount={false} size="small" />
);

// ============================================
// COMPONENTE PARA LISTA DE GÉNEROS
// ============================================

/**
 * GenreChipList - Lista horizontal de géneros
 */
export const GenreChipList = ({ genres, selectedGenre, onGenreClick, max = 10 }) => {
  if (!genres?.length) return null;

  const displayGenres = genres.slice(0, max);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1,
      '& > *': {
        flexShrink: 0
      }
    }}>
      {displayGenres.map((genre) => (
        <GenreChip
          key={genre.name}
          genre={genre}
          size="small"
          selected={selectedGenre === genre.name}
          onClick={() => onGenreClick?.(genre.name)}
          variant="default"
        />
      ))}

      {genres.length > max && (
        <Tooltip title={`${genres.length - max} géneros más`} arrow>
          <Chip
            label={`+${genres.length - max}`}
            size="small"
            sx={{
              height: 32,
              borderRadius: 16,
              bgcolor: alpha('#000', 0.05),
              color: 'text.secondary'
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default GenreChip;