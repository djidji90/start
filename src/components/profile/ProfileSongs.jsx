// src/components/profile/ProfileSongs.jsx
import React, { useCallback, useRef, useEffect } from 'react';
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

const ProfileSongs = ({
  songs = [],
  onSortChange,
  currentSort = 'popular',
  hasMore = false,
  onLoadMore,
  loading = false,
  loadingMore = false
}) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const observerRef = useRef(null);
  const lastSongElementRef = useRef(null);

  const sortOptions = [
    { value: 'popular', label: 'Populares', icon: Whatshot },
    { value: 'recent', label: 'Recientes', icon: NewReleases },
    { value: 'likes', label: 'Likes', icon: Favorite },
    { value: 'downloads', label: 'Descargas', icon: Download },
  ];

  // ============================================
  // SCROLL INFINITO - VERSIÓN ESTABLE
  // ============================================
  
  const observeLastElement = useCallback(() => {
    // Desconectar observer anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // No observar si no hay más elementos o está cargando
    if (!hasMore || loadingMore || !onLoadMore) return;

    // Crear nuevo observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Solo llamar si es visible, hay más, no está cargando
        if (entry.isIntersecting && hasMore && !loadingMore && onLoadMore) {
          console.log('🔄 Cargando más canciones...');
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    // Observar el último elemento
    if (lastSongElementRef.current) {
      observerRef.current.observe(lastSongElementRef.current);
    }
  }, [hasMore, loadingMore, onLoadMore]);

  // Efecto para manejar el observer
  useEffect(() => {
    observeLastElement();
    
    // Limpiar al desmontar
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observeLastElement]);

  // ============================================
  // CALLBACK REF
  // ============================================
  
  const setLastSongRef = useCallback((node) => {
    lastSongElementRef.current = node;
    // Reconectar observer si existe
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSortChange = (event, newSort) => {
    if (newSort && onSortChange) {
      onSortChange(newSort);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!loading && songs.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          textAlign: 'center',
          borderRadius: { xs: 2, sm: 3 },
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
    <Box sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header con ordenamiento */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        mb: { xs: 2, sm: 3 },
        gap: { xs: 1.5, sm: 2 }
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Canciones {songs.length > 0 && `(${songs.length})`}
        </Typography>

        <ToggleButtonGroup
          value={currentSort}
          exclusive
          onChange={handleSortChange}
          size="small"
          sx={{
            width: { xs: '100%', sm: 'auto' },
            '& .MuiToggleButton-root': {
              flex: { xs: 1, sm: 'none' },
            }
          }}
        >
          {sortOptions.map(option => (
            <ToggleButton key={option.value} value={option.value}>
              <option.icon sx={{ fontSize: 16, mr: 0.5 }} />
              <span style={{ display: { xs: 'none', sm: 'inline' } }}>{option.label}</span>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Grid de canciones */}
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
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
              ref={isLastElement ? setLastSongRef : null}
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

      {/* Loader para scroll infinito - USAR loadingMore */}
      {loadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: primaryColor }} />
        </Box>
      )}

      {/* Botón "Cargar más" (fallback) - USAR loadingMore */}
      {hasMore && !loadingMore && onLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onLoadMore}
            fullWidth={false}
            sx={{
              borderColor: alpha(primaryColor, 0.3),
              color: primaryColor,
              px: 4,
              py: 1,
              borderRadius: 2,
            }}
          >
            Cargar más canciones
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ProfileSongs);