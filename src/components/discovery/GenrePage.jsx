// ============================================
// src/pages/GenrePage.jsx
// PÁGINA DE GÉNERO - CANCIONES EN SONGCARD
// ✅ Muestra canciones del género seleccionado
// ✅ Usa SongCard para renderizar
// ✅ Filtros y ordenamiento
// ✅ Grid responsivo
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Pagination,
  Skeleton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSongsByGenre } from '../../components/hook/services/useDiscovery';
import SongCard from '../../songs/SongCard';
import { ArrowBack, Sort } from '@mui/icons-material';

// ============================================
// SKELETON PARA CARGA
// ============================================
const SongCardSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
    <Box sx={{ pt: 1 }}>
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </Box>
  </Box>
);

// ============================================
// PÁGINA PRINCIPAL
// ============================================
const GenrePage = () => {
  const { genre } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Estado para ordenamiento
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Decodificar el género de la URL
  const decodedGenre = decodeURIComponent(genre);

  // Hook para obtener canciones del género
  const { data, isLoading, error, refetch } = useSongsByGenre(decodedGenre, sortBy, 100);

  // ==========================================
  // PAGINACIÓN (cliente-side)
  // ==========================================
  const songs = data?.data || [];
  const totalPages = Math.ceil(songs.length / itemsPerPage);
  const paginatedSongs = songs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1); // Reset a primera página
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // RENDER POR ESTADO
  // ==========================================
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
              <SongCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error"
          action={
            <Chip 
              label="Reintentar" 
              onClick={() => refetch()}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          }
        >
          Error al cargar canciones del género {decodedGenre}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ======================================
          HEADER CON NAVEGACIÓN
      ====================================== */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<ArrowBack />}
            label="Volver"
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          />

          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {decodedGenre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
            </Typography>
          </Box>
        </Box>

        {/* Selector de ordenamiento */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortBy}
            label="Ordenar por"
            onChange={handleSortChange}
            startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="popular">Más populares</MenuItem>
            <MenuItem value="recent">Más recientes</MenuItem>
            <MenuItem value="downloads">Más descargados</MenuItem>
            <MenuItem value="plays">Más escuchados</MenuItem>
            <MenuItem value="likes">Más likes</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ======================================
          GRID DE CANCIONES
      ====================================== */}
      {paginatedSongs.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {paginatedSongs.map((song) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={song.id}>
                <SongCard 
                  song={song}
                  variant="compact"
                  onLike={() => {}} // El hook ya maneja el like internamente
                />
              </Grid>
            ))}
          </Grid>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderRadius: 4
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay canciones en este género
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Pronto añadiremos más música de {decodedGenre}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default GenrePage;