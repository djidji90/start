// src/landing/components/Hero.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  PlayArrow,
  MusicNote,
  People,
  Star,
  Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const heroImage = '/vvv21.jpg';

  const handleDownloadClick = () => {
    // Scroll suave a la sección de App Promo
    const appPromoSection = document.getElementById('app-promo');
    if (appPromoSection) {
      appPromoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: { xs: '85vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Imagen de fondo */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Overlay inteligente */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: `linear-gradient(
              180deg,
              rgba(0,0,0,0.75) 0%,
              rgba(0,0,0,0.35) 50%,
              rgba(0,0,0,0.1) 100%
            )`,
            md: `linear-gradient(
              90deg,
              rgba(0,0,0,0.70) 0%,
              rgba(0,0,0,0.45) 35%,
              rgba(0,0,0,0.15) 65%,
              rgba(0,0,0,0) 100%
            )`,
          }
        }}
      />

      {/* Contenido */}
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 2,
          px: { xs: 3, md: 6 },
        }}
      >
        <Stack spacing={4} sx={{ maxWidth: 720 }}>
          {/* Título */}
          <Typography
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#fff",
              textShadow: "0 6px 30px rgba(0,0,0,0.8)"
            }}
          >
            Descubre el sonido de la{' '}
            <Box
              component="span"
              sx={{
                color: theme.palette.primary.main,
              }}
            >
              nueva generación
            </Box>
          </Typography>

          {/* Subtítulo */}
          <Typography
            sx={{
              color: "rgba(255,255,255,0.9)",
              maxWidth: 560,
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              textShadow: "0 4px 20px rgba(0,0,0,0.7)"
            }}
          >
            La plataforma para descubrir artistas, canciones
            y sonidos de Guinea Ecuatorial.
          </Typography>

          {/* Botones - AHORA CON 3 OPCIONES */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 2, flexWrap: 'wrap' }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/Login')}
              startIcon={<PlayArrow />}
              sx={{
                py: 1.8,
                px: 4,
                fontSize: '1.05rem',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Escuchar ahora
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                py: 1.8,
                px: 4,
                fontSize: '1.05rem',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: 'rgba(255,255,255,0.4)',
                color: "#fff",
                backdropFilter: "blur(6px)",
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              Crear cuenta
            </Button>

            {/* 🆕 NUEVO BOTÓN DE DESCARGA */}
            <Button
              variant="text"
              size="large"
              onClick={handleDownloadClick}
              startIcon={<Download />}
              sx={{
                py: 1.8,
                px: 4,
                fontSize: '1.05rem',
                fontWeight: 600,
                borderRadius: 2,
                color: "#fff",
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                backdropFilter: "blur(6px)",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.4),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Descargar app
            </Button>
          </Stack>

          {/* Stats */}
          <Stack
            direction="row"
            spacing={4}
            sx={{ mt: 4, flexWrap: 'wrap', gap: 2 }}
          >
            {[
              { icon: <MusicNote />, value: '20K', label: 'canciones' },
              { icon: <People />, value: '50+', label: 'artistas' },
              { icon: <Star />, value: '5K', label: 'oyentes' },
            ].map((stat, idx) => (
              <Stack
                key={idx}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Box sx={{ color: theme.palette.primary.main }}>
                  {stat.icon}
                </Box>

                <Stack direction="row" spacing={0.5}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: "#fff" }}
                  >
                    {stat.value}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {stat.label}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Hero;