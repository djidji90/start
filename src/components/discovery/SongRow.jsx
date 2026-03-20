// ============================================
// src/components/discovery/SongRow.jsx
// FILA PROFESIONAL PARA LISTAS DE CANCIONES
// ✅ Diseño compacto para listas verticales
// ✅ Métricas visuales (popularidad, descargas, likes)
// ✅ Posición/ranking destacada
// ✅ Hover effects
// ✅ Botón de reproducción rápida
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Chip
} from '@mui/material';
import {
  PlayArrow,
  TrendingUp,
  Download,
  Favorite,
  MoreHoriz,
  AccessTime,
  MusicNote
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ============================================
// CONSTANTES
// ============================================
const RANK_COLORS = {
  0: '#FFD700', // Oro
  1: '#C0C0C0', // Plata
  2: '#CD7F32'  // Bronce
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * SongRow - Fila profesional para listas de canciones
 * 
 * @param {Object} props
 * @param {Object} props.song - Objeto de la canción
 * @param {number} props.index - Posición en la lista (0-based)
 * @param {boolean} props.showRank - Mostrar número de posición
 * @param {boolean} props.showMetrics - Mostrar métricas (descargas, likes, etc.)
 * @param {boolean} props.compact - Versión ultra compacta
 * @param {function} props.onPlay - Función al hacer click en play
 * @param {function} props.onClick - Función al hacer click en la fila
 * @param {function} props.onMore - Función al hacer click en más opciones
 */
const SongRow = ({
  song,
  index = 0,
  showRank = true,
  showMetrics = true,
  compact = false,
  onPlay,
  onClick,
  onMore,
  ...rest
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Si no hay canción, no renderizar
  if (!song) return null;

  // ==========================================
  // UTILIDADES
  // ==========================================
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankColor = (idx) => {
    return RANK_COLORS[idx] || theme.palette.text.disabled;
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleClick = (e) => {
    if (e.target.closest('button')) return;
    
    if (onClick) {
      onClick(song);
    } else {
      navigate(`/song/${song.id}`);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    onPlay?.(song);
  };

  const handleMore = (e) => {
    e.stopPropagation();
    onMore?.(song);
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 1 : 1.5,
        p: compact ? 1 : 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        bgcolor: isHovered ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          transform: 'translateX(4px)'
        },
        ...rest.sx
      }}
    >
      {/* ======================================
          POSICIÓN / RANKING
      ====================================== */}
      {showRank && (
        <Box
          sx={{
            width: compact ? 30 : 40,
            textAlign: 'center',
            flexShrink: 0
          }}
        >
          {index < 3 ? (
            <Typography
              variant={compact ? 'body2' : 'body1'}
              sx={{
                fontWeight: 700,
                color: getRankColor(index),
                textShadow: index === 0 ? '0 0 10px #FFD70040' : 'none'
              }}
            >
              #{index + 1}
            </Typography>
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.disabled,
                fontWeight: 500
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </Typography>
          )}
        </Box>
      )}

      {/* ======================================
          IMAGEN
      ====================================== */}
      <Box
        sx={{
          width: compact ? 40 : 56,
          height: compact ? 40 : 56,
          borderRadius: 1,
          bgcolor: theme.palette.grey[200],
          backgroundImage: `url(${imageError || !song.image_url ? '/djidji.png' : song.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isHovered ? `0 4px 10px ${alpha('#000', 0.15)}` : 'none',
          transition: 'box-shadow 0.2s ease'
        }}
      >
        {/* Overlay al hover */}
        {isHovered && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: alpha('#000', 0.3),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconButton
              size="small"
              onClick={handlePlay}
              sx={{
                bgcolor: alpha('#FFF', 0.9),
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: '#FFF',
                  transform: 'scale(1.1)'
                },
                width: compact ? 28 : 32,
                height: compact ? 28 : 32
              }}
            >
              <PlayArrow sx={{ fontSize: compact ? 16 : 18 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* ======================================
          INFORMACIÓN DE LA CANCIÓN
      ====================================== */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant={compact ? 'body2' : 'body1'}
          sx={{
            fontWeight: 600,
            mb: 0.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: theme.palette.text.primary
          }}
        >
          {song.title}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {song.artist}
        </Typography>

        {/* Metadata adicional (solo si no es compact) */}
        {!compact && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            {song.genre && (
              <Chip
                label={song.genre}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.text.secondary
                }}
              />
            )}
            {song.duration && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <AccessTime sx={{ fontSize: 10, color: theme.palette.text.disabled }} />
                <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                  {formatDuration(song.duration)}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ======================================
          MÉTRICAS
      ====================================== */}
      {showMetrics && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: compact ? 1 : 1.5,
            color: theme.palette.text.secondary,
            flexShrink: 0
          }}
        >
          {/* Popularidad (score) */}
          {song.popularity_score && (
            <Tooltip title="Popularidad" arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <TrendingUp
                  sx={{
                    fontSize: compact ? 14 : 16,
                    color: theme.palette.primary.main
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {song.popularity_score}
                </Typography>
              </Box>
            </Tooltip>
          )}

          {/* Descargas */}
          {song.downloads_count > 0 && (
            <Tooltip title="Descargas" arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Download sx={{ fontSize: compact ? 14 : 16 }} />
                <Typography variant="caption">
                  {formatNumber(song.downloads_count)}
                </Typography>
              </Box>
            </Tooltip>
          )}

          {/* Likes */}
          {song.likes_count > 0 && (
            <Tooltip title="Likes" arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Favorite
                  sx={{
                    fontSize: compact ? 14 : 16,
                    color: theme.palette.error.main
                  }}
                />
                <Typography variant="caption">
                  {formatNumber(song.likes_count)}
                </Typography>
              </Box>
            </Tooltip>
          )}

          {/* Reproducciones */}
          {song.plays_count > 0 && (
            <Tooltip title="Reproducciones" arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <MusicNote sx={{ fontSize: compact ? 14 : 16 }} />
                <Typography variant="caption">
                  {formatNumber(song.plays_count)}
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
      )}

      {/* ======================================
          BOTÓN DE MÁS OPCIONES
      ====================================== */}
      <IconButton
        size="small"
        onClick={handleMore}
        sx={{
          opacity: isHovered ? 1 : compact ? 0.3 : 0.5,
          transition: 'opacity 0.2s ease',
          width: compact ? 28 : 32,
          height: compact ? 28 : 32
        }}
      >
        <MoreHoriz fontSize={compact ? 'small' : 'medium'} />
      </IconButton>
    </Box>
  );
};

// ============================================
// VARIANTES PREDEFINIDAS
// ============================================

/**
 * Versión ultra compacta para móviles
 */
SongRow.Compact = (props) => (
  <SongRow {...props} compact={true} showMetrics={false} />
);

/**
 * Versión para rankings (con posición destacada)
 */
SongRow.Ranking = (props) => (
  <SongRow {...props} showRank={true} showMetrics={true} />
);

/**
 * Versión simple (solo información básica)
 */
SongRow.Simple = (props) => (
  <SongRow {...props} showRank={false} showMetrics={false} />
);

// ============================================
// COMPONENTE PARA LISTA COMPLETA
// ============================================

/**
 * SongRowList - Lista vertical de canciones
 */
export const SongRowList = ({
  songs,
  onPlay,
  onSongClick,
  onMore,
  showRank = true,
  showMetrics = true,
  compact = false,
  max = 10
}) => {
  if (!songs?.length) return null;

  const displaySongs = songs.slice(0, max);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {displaySongs.map((song, index) => (
        <SongRow
          key={song.id}
          song={song}
          index={index}
          showRank={showRank}
          showMetrics={showMetrics}
          compact={compact}
          onPlay={onPlay}
          onClick={onSongClick}
          onMore={onMore}
        />
      ))}

      {songs.length > max && (
        <Box
          sx={{
            textAlign: 'center',
            py: 2,
            color: 'text.secondary',
            cursor: 'pointer',
            '&:hover': {
              color: 'primary.main'
            }
          }}
          onClick={() => onMore?.('view_all')}
        >
          <Typography variant="caption">
            +{songs.length - max} canciones más
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SongRow;