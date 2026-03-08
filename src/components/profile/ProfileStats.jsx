// src/components/profile/ProfileStats.jsx
import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  alpha,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  MusicNote,
  Favorite,
  PlayArrow,
  Download,
  TrendingUp,
  TrendingDown,
  TrendingFlat
} from '@mui/icons-material';

/**
 * Componente para mostrar estadísticas del perfil en tarjetas
 * @param {Object} stats - Estadísticas calculadas (totalSongs, totalLikes, totalPlays, totalDownloads)
 * @param {Array} genres - Lista de géneros del artista (opcional)
 */
const ProfileStats = ({ stats, genres = [] }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  // ============================================
  // CONFIGURACIÓN DE TARJETAS
  // ============================================
  
  const statCards = [
    {
      id: 'songs',
      label: 'Canciones',
      value: stats.totalSongs || 0,
      icon: MusicNote,
      color: primaryColor,
      bgColor: alpha(primaryColor, 0.1),
      format: (value) => value.toString(),
      tooltip: 'Total de canciones publicadas'
    },
    {
      id: 'likes',
      label: 'Likes',
      value: stats.totalLikes || 0,
      icon: Favorite,
      color: '#F50057', // Rosa/rojo para likes
      bgColor: alpha('#F50057', 0.1),
      format: (value) => value >= 1000 ? `${(value/1000).toFixed(1)}K` : value.toString(),
      tooltip: 'Me gusta recibidos en total'
    },
    {
      id: 'plays',
      label: 'Reproducciones',
      value: stats.totalPlays || 0,
      icon: PlayArrow,
      color: '#00B8D9', // Azul/cyan para plays
      bgColor: alpha('#00B8D9', 0.1),
      format: (value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : 
                         value >= 1000 ? `${(value/1000).toFixed(1)}K` : value.toString(),
      tooltip: 'Veces que han reproducido sus canciones'
    },
    {
      id: 'downloads',
      label: 'Descargas',
      value: stats.totalDownloads || 0,
      icon: Download,
      color: '#10B981', // Verde para descargas
      bgColor: alpha('#10B981', 0.1),
      format: (value) => value >= 1000 ? `${(value/1000).toFixed(1)}K` : value.toString(),
      tooltip: 'Descargas totales de sus canciones'
    }
  ];

  // ============================================
  // FUNCIÓN PARA DETERMINAR TENDENCIA (OPCIONAL)
  // ============================================
  
  /**
   * Simula una tendencia basada en los valores
   * En el futuro podría venir del backend
   */
  const getTrend = (value) => {
    // Esto es solo un ejemplo visual
    // Idealmente vendría de la API
    if (value > 1000) return { icon: TrendingUp, color: '#10B981', text: '+12%' };
    if (value > 100) return { icon: TrendingFlat, color: '#F59E0B', text: '0%' };
    return { icon: TrendingDown, color: '#EF4444', text: '-5%' };
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Box sx={{ mb: 4 }}>
      {/* Grid de estadísticas principales */}
      <Grid container spacing={2}>
        {statCards.map((card) => {
          const Icon = card.icon;
          const formattedValue = card.format(card.value);
          const trend = getTrend(card.value);
          const TrendIcon = trend.icon;
          
          return (
            <Grid item xs={6} sm={3} key={card.id}>
              <Tooltip title={card.tooltip} arrow placement="top">
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: card.bgColor,
                    border: `1px solid ${alpha(card.color, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 20px ${alpha(card.color, 0.2)}`,
                      borderColor: alpha(card.color, 0.4),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha(card.color, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon sx={{ color: card.color, fontSize: 20 }} />
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: alpha('#000', 0.5), display: 'block', mb: 0.5 }}>
                        {card.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: card.color, lineHeight: 1.2 }}>
                        {formattedValue}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Tendencia (opcional - solo visual) */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    borderTop: `1px solid ${alpha(card.color, 0.1)}`,
                    pt: 1.5,
                    mt: 1
                  }}>
                    <TrendIcon sx={{ fontSize: 14, color: trend.color }} />
                    <Typography variant="caption" sx={{ color: trend.color, fontWeight: 600 }}>
                      {trend.text}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#000', 0.3), ml: 'auto' }}>
                      vs mes ant.
                    </Typography>
                  </Box>
                </Paper>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {/* Géneros del artista (si existen) */}
      {genres.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ color: alpha('#000', 0.5), display: 'block', mb: 1 }}>
            Géneros musicales
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {genres.map((genre, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: alpha(primaryColor, 0.08),
                  border: `1px solid ${alpha(primaryColor, 0.2)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(primaryColor, 0.15),
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: primaryColor, fontWeight: 600 }}>
                  {genre}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProfileStats;