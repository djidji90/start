// src/components/profile/ProfileSongs.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  useTheme,
  CircularProgress,
  Fade,
  Button
} from '@mui/material';
import {
  Whatshot,
  NewReleases,
  Favorite,
  Download,
  Sort as SortIcon
} from '@mui/icons-material';
import SongCard from '../../songs/SongCard';

/**
 * Componente para mostrar el grid de canciones del perfil
 * @param {Array} songs - Lista de canciones
 * @param {Function} onSortChange - Función para cambiar ordenamiento
 * @param {string} currentSort - Criterio actual de ordenamiento
 * @param {boolean} hasMore - Si hay más canciones para cargar
 * @param {Function} onLoadMore - Función para cargar más canciones
 * @param {boolean} loading - Estado de carga
 */
const ProfileSongs = ({
  songs = [],
  onSortChange,
  currentSort = 'popular',
  hasMore = false,
  onLoadMore,
  loading = false
}) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const observerRef = useRef();
  const lastSongRef = useRef();

  // ============================================
  // CONFIGURACIÓN DE ORDENAMIENTO
  // ============================================
  
  const sortOptions = [
    { value: 'popular', label: 'Populares', icon: Whatshot, tooltip: 'Más populares' },
    { value: 'recent', label: 'Recientes', icon: NewReleases, tooltip: 'Últimos en subirse' },
    { value: 'likes', label: 'Likes', icon: Favorite, tooltip: 'Más likes' },
    { value: 'downloads', label: 'Descargas', icon: Download, tooltip: 'Más descargados' },
  ];

  // ============================================
  // SCROLL INFINITO (opcional)
  // ============================================
  
  useEffect(() => {
    if (loading || !hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
    );

    if (lastSongRef.current) {
      observer.observe(lastSongRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, onLoadMore]);

  // ============================================
  // MANEJO DE ORDENAMIENTO
  // ============================================
  
  const handleSortChange = (event, newSort) => {
    if (newSort && onSortChange) {
      onSortChange(newSort);
    }
  };

  // ============================================
  // RENDER DE ESTADOS
  // ============================================
  
  // Estado vacío
  if (!loading && songs.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: alpha(primaryColor, 0.02),
          border: `1px solid ${alpha(primaryColor, 0.1)}`,
        }}
      >
        <Typography variant="h6" sx={{ color: alpha('#000', 0.5), mb: 1 }}>
          🎵 No hay canciones todavía
        </Typography>
        <Typography variant="body2" sx={{ color: alpha('#000', 0.3) }}>
          Las canciones aparecerán aquí cuando el artista las publique
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header con ordenamiento */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SortIcon sx={{ color: primaryColor }} />
          Canciones {songs.length > 0 && `(${songs.length})`}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 0.5,
            bgcolor: alpha(primaryColor, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(primaryColor, 0.1)}`,
          }}
        >
          <ToggleButtonGroup
            value={currentSort}
            exclusive
            onChange={handleSortChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: 1.5,
                px: 2,
                py: 0.8,
                color: alpha('#000', 0.6),
                '&.Mui-selected': {
                  bgcolor: alpha(primaryColor, 0.1),
                  color: primaryColor,
                  '&:hover': {
                    bgcolor: alpha(primaryColor, 0.15),
                  }
                }
              }
            }}
          >
            {sortOptions.map(option => (
              <ToggleButton key={option.value} value={option.value}>
                <option.icon sx={{ fontSize: 16, mr: 0.5 }} />
                <span style={{ display: 'none', sm: 'inline' }}>{option.label}</span>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Paper>
      </Box>

      {/* Grid de canciones */}
      <Grid container spacing={2}>
        {songs.map((song, index) => {
          const isLastElement = index === songs.length - 1 && hasMore;
          
          return (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              lg={2.4}
              key={song.id}
              ref={isLastElement ? lastSongRef : null}
            >
              <Fade in timeout={300 + (index % 10) * 50}>
                <Box>
                  <SongCard
                    song={song}
                    variant="compact"
                    showIndex={false}
                  />
                </Box>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {/* Loader para scroll infinito */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: primaryColor }} />
        </Box>
      )}

      {/* Botón "Cargar más" (alternativa al scroll infinito) */}
      {hasMore && !loading && onLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onLoadMore}
            sx={{
              borderColor: alpha(primaryColor, 0.3),
              color: primaryColor,
              px: 4,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                borderColor: primaryColor,
                bgcolor: alpha(primaryColor, 0.04),
              }
            }}
          >
            Cargar más canciones
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ProfileSongs;