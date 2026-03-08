// src/components/profile/ProfileSongs.jsx (versión final)
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
  loadingMore = false  // ← NUEVA PROPIEDAD
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
  // SCROLL INFINITO
  // ============================================
  
  const observeLastElement = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!hasMore || loadingMore || !onLoadMore) return;  // ← USAR loadingMore

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMore && onLoadMore) {  // ← USAR loadingMore
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (lastSongElementRef.current) {
      observerRef.current.observe(lastSongElementRef.current);
    }
  }, [hasMore, loadingMore, onLoadMore]);  // ← DEPENDENCIA ACTUALIZADA

  useEffect(() => {
    observeLastElement();
    return () => observerRef.current?.disconnect();
  }, [observeLastElement]);

  // ============================================
  // CALLBACK REF
  // ============================================
  
  const setLastSongRef = useCallback((node) => {
    lastSongElementRef.current = node;
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
          >
            {sortOptions.map(option => (
              <ToggleButton key={option.value} value={option.value}>
                <option.icon sx={{ fontSize: 16, mr: 0.5 }} />
                <span style={{ display: { xs: 'none', sm: 'inline' } }}>{option.label}</span>
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

      {/* Loader para scroll infinito */}
      {loadingMore && (  // ← AHORA USA loadingMore
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: primaryColor }} />
        </Box>
      )}

      {/* Botón "Cargar más" (fallback) */}
      {hasMore && !loadingMore && onLoadMore && (  // ← AHORA USA loadingMore
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

export default React.memo(ProfileSongs);