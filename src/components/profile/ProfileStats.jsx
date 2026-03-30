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
  Download
} from '@mui/icons-material';

const ProfileStats = ({ stats, genres = [] }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  // 🎨 Helper para colores consistentes
  const getColor = (color) => ({
    main: color,
    lightBg: alpha(color, 0.08),
    border: alpha(color, 0.2),
    iconBg: alpha(color, 0.15),
  });

  const statCards = [
    {
      id: 'songs',
      label: 'Canciones',
      value: stats.totalSongs || 0,
      icon: MusicNote,
      colors: getColor(primaryColor),
      format: (value) => value.toString(),
      tooltip: 'Total de canciones publicadas'
    },
    {
      id: 'likes',
      label: 'Likes',
      value: stats.totalLikes || 0,
      icon: Favorite,
      colors: getColor(theme.palette.error.main),
      format: (value) =>
        value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString(),
      tooltip: 'Me gusta recibidos en total'
    },
    {
      id: 'plays',
      label: 'Reproducciones',
      value: stats.totalPlays || 0,
      icon: PlayArrow,
      colors: getColor(theme.palette.info.main),
      format: (value) =>
        value >= 1000000
          ? `${(value / 1000000).toFixed(1)}M`
          : value >= 1000
          ? `${(value / 1000).toFixed(1)}K`
          : value.toString(),
      tooltip: 'Veces que han reproducido sus canciones'
    },
    {
      id: 'downloads',
      label: 'Descargas',
      value: stats.totalDownloads || 0,
      icon: Download,
      colors: getColor(theme.palette.success.main),
      format: (value) =>
        value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString(),
      tooltip: 'Descargas totales de sus canciones'
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        {statCards.map((card) => {
          const Icon = card.icon;
          const formattedValue = card.format(card.value);

          return (
            <Grid item xs={6} sm={3} key={card.id}>
              <Tooltip title={card.tooltip} arrow placement="top">
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: card.colors.lightBg,
                    border: `1px solid ${card.colors.border}`,
                    transition: 'all 0.25s ease',
                    backdropFilter: 'blur(6px)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 10px 25px ${alpha(
                        card.colors.main,
                        0.2
                      )}`,
                      borderColor: alpha(card.colors.main, 0.4),
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    {/* Icono */}
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        bgcolor: card.colors.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon
                        sx={{
                          color: card.colors.main,
                          fontSize: 22
                        }}
                      />
                    </Box>

                    {/* Texto */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: alpha(theme.palette.text.primary, 0.6),
                          display: 'block',
                          mb: 0.3
                        }}
                      >
                        {card.label}
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: card.colors.main,
                          lineHeight: 1.1
                        }}
                      >
                        {formattedValue}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {/* 🎵 Géneros */}
      {genres.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.text.primary, 0.6),
              display: 'block',
              mb: 1
            }}
          >
            Géneros musicales
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {genres.map((genre, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 2,
                  bgcolor: alpha(primaryColor, 0.08),
                  border: `1px solid ${alpha(primaryColor, 0.2)}`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha(primaryColor, 0.15),
                    transform: 'scale(1.07)',
                  }
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: primaryColor, fontWeight: 600 }}
                >
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