// src/landing/components/FeaturedGenres.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  alpha,
  useTheme,
  Stack,
  Button,
  Paper,
  IconButton,
  useMediaQuery,
  Chip
} from '@mui/material';
import { 
  Mic, 
  Verified, 
  ArrowForward,
  MusicNote,
  ChevronLeft,
  ChevronRight,
  Album,
  GraphicEq,
  Headphones,
  Public,
  AddCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Genre {
  id: string;
  name: string;
  icon: React.ReactNode;
  songCount: number;
  color: string;
  description: string;
}

const FeaturedGenres = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const carouselRef = useRef<HTMLDivElement>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const heroImage = '/mansa.jpg';

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setGenres([
        {
          id: '1',
          name: 'Afrobeats',
          icon: <MusicNote sx={{ fontSize: 40 }} />,
          songCount: 3240,
          color: '#FF6B35',
          description: 'El ritmo que mueve África occidental'
        },
        {
          id: '2',
          name: 'Trap',
          icon: <GraphicEq sx={{ fontSize: 40 }} />,
          songCount: 1250,
          color: '#8B5CF6',
          description: 'Potente, rebelde, callejero... ¡tal y como nos gusta!'
        },
        {
          id: '3',
          name: 'Reggae',
          icon: <Headphones sx={{ fontSize: 40 }} />,
          songCount: 980,
          color: '#10B981',
          description: 'Cultura y conciencia social'
        },
        {
          id: '4',
          name: 'Gospel',
          icon: <Verified sx={{ fontSize: 40 }} />,
          songCount: 1560,
          color: '#EC4899',
          description: 'Música espiritual ecuatoguineana'
        },
        {
          id: '5',
          name: 'Hip Hop',
          icon: <Mic sx={{ fontSize: 40 }} />,
          songCount: 2140,
          color: '#F59E0B',
          description: 'La voz de la nueva generación'
        },
        {
          id: '6',
          name: 'Bikutsi',
          icon: <Public sx={{ fontSize: 40 }} />,
          songCount: 430,
          color: '#EF4444',
          description: 'Ritmo y tradición'
        },
        {
          id: '7',
          name: 'Ecuabeats',
          icon: <Headphones sx={{ fontSize: 40 }} />,
          songCount: 870,
          color: '#6366F1',
          description: '¡Lo nuestro primero!'
        },
        {
          id: '8',
          name: 'Requeton',
          icon: <GraphicEq sx={{ fontSize: 40 }} />,
          songCount: 1120,
          color: '#14B8A6',
          description: 'Sonido urbano contemporáneo'
        },
        {
          id: '9',
          name: 'Cachá',
          icon: <MusicNote sx={{ fontSize: 40 }} />,
          songCount: 1850,
          color: '#FF9800',
          description: 'Música tradicional de la isla de Bioko'
        },
        {
          id: '10',
          name: 'Rumba',
          icon: <Album sx={{ fontSize: 40 }} />,
          songCount: 760,
          color: '#9C27B0',
          description: 'Clásicos que nunca pasan de moda'
        }
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      const newPosition = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const formatSongCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const totalSongs = genres.reduce((acc, genre) => acc + genre.songCount, 0);
  const formattedTotalSongs = formatSongCount(totalSongs);

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography sx={{ color: '#fff' }}>Cargando géneros musicales...</Typography>
      </Box>
    );
  }

  if (!genres?.length) return null;

  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        position: 'relative',
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: theme.palette.background.default, // fallback
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: alpha('#000', 0.7),
          zIndex: 1,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 4,
              height: 32,
              background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`,
              borderRadius: 2,
            }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              ABARCAMOS TODOS LOS GÉNEROS
            </Typography>
            <Box sx={{
              width: 4,
              height: 32,
              background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.3)}, ${theme.palette.primary.main})`,
              borderRadius: 2,
            }} />
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: alpha('#fff', 0.9),
              fontSize: '1.1rem',
              maxWidth: 700,
              mx: 'auto',
              textAlign: 'center',
              mb: 3,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            Desde los ritmos tradicionales hasta los sonidos urbanos más actuales.
            Más de {formattedTotalSongs} canciones disponibles para descubrir.
          </Typography>

          {/* Stats */}
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            <Paper
              sx={{
                p: 1.5,
                px: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <MusicNote sx={{ color: theme.palette.primary.main }} />
              <Typography sx={{ color: '#fff' }}>
                {genres.length}+ géneros
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 1.5,
                px: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Album sx={{ color: theme.palette.primary.main }} />
              <Typography sx={{ color: '#fff' }}>
                {formattedTotalSongs} canciones
              </Typography>
            </Paper>
          </Stack>
        </Box>

        {/* Carrusel de géneros */}
        <Box sx={{ position: 'relative' }}>
          {/* Flechas de navegación (solo desktop) */}
          {!isMobile && (
            <>
              <IconButton
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.8),
                  color: '#fff',
                  width: 48,
                  height: 48,
                  '&:hover': { bgcolor: theme.palette.primary.main },
                  '&:disabled': { 
                    bgcolor: alpha('#000', 0.3),
                    color: alpha('#fff', 0.3),
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.8),
                  color: '#fff',
                  width: 48,
                  height: 48,
                  '&:hover': { bgcolor: theme.palette.primary.main },
                  '&:disabled': { 
                    bgcolor: alpha('#000', 0.3),
                    color: alpha('#fff', 0.3),
                  },
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}

          {/* Contenedor del carrusel */}
          <Box
            ref={carouselRef}
            onScroll={checkScroll}
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              py: 2,
              px: 1,
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {genres.map((genre) => (
              <Box
                key={genre.id}
                sx={{
                  minWidth: { xs: 220, sm: 240, md: 260 },
                  maxWidth: { xs: 220, sm: 240, md: 260 },
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: alpha('#fff', 0.1),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    border: `1px solid ${alpha(genre.color, 0.3)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: genre.color,
                      boxShadow: `0 10px 30px ${alpha(genre.color, 0.3)}`,
                    },
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        bgcolor: alpha(genre.color, 0.2),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: genre.color,
                        mb: 1,
                      }}
                    >
                      {genre.icon}
                    </Box>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#fff',
                        textAlign: 'center',
                      }}
                    >
                      {genre.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha('#fff', 0.7),
                        textAlign: 'center',
                        fontSize: '0.85rem',
                      }}
                    >
                      {genre.description}
                    </Typography>

                    <Chip
                      label={`${formatSongCount(genre.songCount)} canciones`}
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: alpha(genre.color, 0.2),
                        color: '#fff',
                        border: `1px solid ${alpha(genre.color, 0.3)}`,
                      }}
                    />
                  </Stack>
                </Paper>
              </Box>
            ))}

            {/* Card "Y MUCHOS MÁS" */}
            <Box
              sx={{
                minWidth: { xs: 220, sm: 240, md: 260 },
                maxWidth: { xs: 220, sm: 240, md: 260 },
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: alpha('#fff', 0.05),
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4,
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <AddCircleOutline 
                  sx={{ 
                    fontSize: 60, 
                    color: theme.palette.primary.main,
                    mb: 2,
                  }} 
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  Y MUCHOS
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  MÁS
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha('#fff', 0.7),
                    textAlign: 'center',
                    maxWidth: 180,
                  }}
                >
                  +{genres.length} géneros disponibles en nuestra plataforma
                </Typography>
                <Chip
                  label="Explorar todo"
                  size="small"
                  sx={{
                    mt: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: '#fff',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                />
              </Paper>
            </Box>
          </Box>

          {/* Indicador de scroll para móvil */}
          {isMobile && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.5),
                  borderRadius: 1,
                }}
              />
              <Box
                sx={{
                  width: 15,
                  height: 3,
                  bgcolor: alpha('#fff', 0.2),
                  borderRadius: 1,
                }}
              />
              <Box
                sx={{
                  width: 15,
                  height: 3,
                  bgcolor: alpha('#fff', 0.2),
                  borderRadius: 1,
                }}
              />
            </Box>
          )}
        </Box>

        {/* CTA */}
        <Paper
          sx={{
            mt: 5,
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: alpha('#000', 0.3),
            backdropFilter: 'blur(5px)',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              p: 1,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            }}>
              <Headphones sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                +{formattedTotalSongs} canciones · {genres.length}+ géneros
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                Explora todos los géneros y encuentra tu ritmo
              </Typography>
            </Box>
          </Stack>
          
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/Login')}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              '&:hover': {
                transform: 'translateX(4px)',
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            Sube tu música
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default FeaturedGenres;