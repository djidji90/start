// src/components/profile/UserNotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  alpha,
  useTheme,
  Container
} from '@mui/material';
import {
  PersonOff,
  Home,
  Search,
  MusicNote
} from '@mui/icons-material';

/**
 * Componente para mostrar cuando un usuario/artista no existe
 * @param {string} username - Nombre de usuario que se buscó
 */
const UserNotFound = ({ username }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const primaryColor = theme.palette.primary.main;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          textAlign: 'center',
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(primaryColor, 0.05)} 0%, ${alpha(primaryColor, 0.02)} 100%)`,
          border: `1px solid ${alpha(primaryColor, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decoración de fondo */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: alpha(primaryColor, 0.03),
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: alpha(primaryColor, 0.03),
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Icono grande */}
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 3,
              bgcolor: alpha(primaryColor, 0.1),
              color: primaryColor,
              fontSize: '4rem',
              boxShadow: `0 10px 30px ${alpha(primaryColor, 0.2)}`,
            }}
          >
            <PersonOff sx={{ fontSize: 60 }} />
          </Avatar>

          {/* Título */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem' },
              background: `linear-gradient(135deg, ${primaryColor}, ${alpha(primaryColor, 0.7)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            ¡Ups! Usuario no encontrado
          </Typography>

          {/* Mensaje con el username */}
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 3,
              fontWeight: 400,
            }}
          >
            No pudimos encontrar el perfil de{' '}
            <Typography
              component="span"
              sx={{
                fontWeight: 600,
                color: primaryColor,
                bgcolor: alpha(primaryColor, 0.1),
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              @{username}
            </Typography>
          </Typography>

          {/* Mensaje descriptivo */}
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: 450,
              mx: 'auto',
              lineHeight: 1.8,
            }}
          >
            El artista que buscas no existe o aún no ha publicado música en nuestra plataforma. 
            ¿Quizás querías buscar otro nombre?
          </Typography>

          {/* Botones de acción */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={() => navigate('/MainPage')}
              sx={{
                bgcolor: primaryColor,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: `0 8px 20px ${alpha(primaryColor, 0.3)}`,
                '&:hover': {
                  bgcolor: alpha(primaryColor, 0.9),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 28px ${alpha(primaryColor, 0.4)}`,
                }
              }}
            >
              Ir al inicio
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Search />}
              onClick={() => navigate('/MainPage')}
              sx={{
                borderColor: alpha(primaryColor, 0.3),
                color: primaryColor,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: primaryColor,
                  bgcolor: alpha(primaryColor, 0.04),
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Explorar música
            </Button>
          </Box>

          {/* Sugerencias */}
          <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${alpha(primaryColor, 0.1)}` }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              ¿Buscabas alguno de estos artistas?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['leoncio', 'admin', 'jordi', 'Riri'].map((name) => (
                <Button
                  key={name}
                  size="small"
                  startIcon={<MusicNote />}
                  onClick={() => navigate(`/perfil/${name}`)}
                  sx={{
                    color: primaryColor,
                    bgcolor: alpha(primaryColor, 0.05),
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      bgcolor: alpha(primaryColor, 0.1),
                    }
                  }}
                >
                  @{name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserNotFound;