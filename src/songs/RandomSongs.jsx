// src/components/RandomSongs/RandomSongs.jsx
import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import {
  Refresh,
  MusicNote,
  Error as ErrorIcon,
  Whatshot
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import SongCard from './SongCard';
import { useAudioPlayer } from '../hook/services/usePlayer';
import { useRandomSongs } from '../hook/services/useRandomSongs';

const RandomSongs = () => {
  const theme = useTheme();
  const { songs, loading, error, refetch } = useRandomSongs();
  const player = useAudioPlayer();
  
  const getSongStatus = (songId) => {
    return player.getSongStatus(songId);
  };

  const handleLike = (songId, liked) => {
    console.log(`Song ${songId} ${liked ? 'liked' : 'unliked'}`);
  };

  const handleMoreActions = (songId) => {
    console.log(`More actions for song ${songId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: theme.palette.primary.main,
              mb: 3
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Buscando canciones aleatorias...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estamos seleccionando una colección única para ti
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Alert 
            severity="error"
            icon={<ErrorIcon fontSize="large" />}
            sx={{ 
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.error.light}`,
              bgcolor: alpha(theme.palette.error.main, 0.05)
            }}
          >
            <Typography variant="h6" gutterBottom>
              Error al cargar canciones
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Refresh />}
              onClick={refetch}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Reintentar
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!loading && songs.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center'
        }}>
          <Box sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}>
            <MusicNote sx={{ fontSize: 60, color: theme.palette.primary.main, opacity: 0.5 }} />
          </Box>
          
          <Typography variant="h5" gutterBottom fontWeight={600}>
            No hay canciones disponibles
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
            Parece que no hay canciones en este momento. 
            Prueba a actualizar la selección o vuelve más tarde.
          </Typography>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={refetch}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600
            }}
          >
            Buscar canciones
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 3,
        mb: 6
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <Whatshot sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight={800}>
              Descubre Música Aleatoria
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            Una selección única de {songs.length} canciones diferentes cada vez.
            El algoritmo elige al azar de toda nuestra biblioteca musical.
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <Chip 
            label={`${songs.length} canciones`}
            color="primary"
            variant="outlined"
            sx={{ 
              height: 36,
              fontWeight: 600,
              borderWidth: 2
            }}
          />
          
          <Button
            variant="contained"
            size="large"
            startIcon={<Refresh />}
            onClick={refetch}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              minWidth: 200,
              bgcolor: theme.palette.secondary.main,
              '&:hover': {
                bgcolor: theme.palette.secondary.dark,
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8]
              },
              transition: 'all 0.3s ease',
              boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`
            }}
          >
            Nueva Selección
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {songs.map((song, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`${song.id}-${song.title}`}>
            <SongCard
              song={song}
              showIndex={index + 1}
              onLike={handleLike}
              onMoreActions={() => handleMoreActions(song.id)}
            />
          </Grid>
        ))}
      </Grid>

      <Paper 
        elevation={0}
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.primary.light, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MusicNote sx={{ fontSize: 28, color: theme.palette.primary.main }} />
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              ¿Cómo funciona la selección aleatoria?
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main 
                  }} />
                  <Typography variant="body2" fontWeight={500}>
                    Aleatoriedad completa
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Las canciones se eligen al azar de toda la biblioteca
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    bgcolor: theme.palette.secondary.main 
                  }} />
                  <Typography variant="body2" fontWeight={500}>
                    Sin repeticiones
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Cada selección es única y diferente
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    bgcolor: theme.palette.success.main 
                  }} />
                  <Typography variant="body2" fontWeight={500}>
                    Actualizable
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Obtén nuevas canciones cuando quieras
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              mt: 3,
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                sx={{ textTransform: 'none' }}
              >
                Volver arriba ↑
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RandomSongs;