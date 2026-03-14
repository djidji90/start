// src/landing/components/FAQ.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  useTheme,
  Stack,
  Chip,
  Paper,
  Grid,
  Button
} from '@mui/material';
import {
  ExpandMore,
  HelpOutline,
  MusicNote,
  Payment,
  Download,
  Person,
  Security,
  Headphones,
  Campaign,
  WhatsApp
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Animación para el fondo
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(1); opacity: 0.3; }
`;

const FAQ = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Categorías de preguntas
  const categories = [
    { icon: <Person />, label: 'Cuenta', color: theme.palette.primary.main },
    { icon: <Payment />, label: 'Pagos', color: theme.palette.secondary.main },
    { icon: <MusicNote />, label: 'Música', color: theme.palette.success.main },
    { icon: <Download />, label: 'Descargas', color: theme.palette.warning.main },
  ];

  // Preguntas frecuentes
  const faqs = [
    {
      category: 'general',
      question: '¿Qué es DjidjiMusic?',
      answer: 'DjidjiMusic es la primera plataforma de streaming musical dedicada exclusivamente a promover artistas y música de Guinea Ecuatorial. Ofrecemos streaming, descargas y la posibilidad de que artistas independientes suban su música.',
      icon: <HelpOutline />
    },
    {
      category: 'cuenta',
      question: '¿Cómo creo una cuenta?',
      answer: 'Puedes crear una cuenta gratis haciendo clic en "Registrarse" en la esquina superior derecha. Solo necesitas tu correo electrónico y crear una contraseña.',
      icon: <Person />
    },
    {
      category: 'pagos',
      question: '¿Qué métodos de pago aceptan?',
      answer: ' actualmente nuestros servicios son totalemente gratuitos en caso de que cambiemos nustra politica os lo haremos saber.',
      icon: <Payment />
    },
    {
      category: 'artistas',
      question: '¿Cómo puedo subir mi música como artista?',
      answer: 'Los artistas pueden subir su música creando una cuenta. Una vez cread, pueden subir canciones, álbumes y gestionar su perfil desde el panel de artista gratis!!!.',
      icon: <Campaign />
    },
    {
      category: 'descargas',
      question: '¿Puedo descargar música para escuchar sin internet?',
      answer: 'Sí, los usuarios  pueden descargar canciones y playlists para escucharlas sin conexión. Las descargas están disponibles en la app móvil y en la versión web.',
      icon: <Download />
    },
    {
      category: 'calidad',
      question: '¿Qué calidad de audio ofrecen?',
      answer: 'Ofrecemos streaming en alta calidad (320 kbps) para usuarios premium. La versión gratuita reproduce en calidad estándar (128 kbps).',
      icon: <Headphones />
    },
    {
      category: 'seguridad',
      question: '¿Es seguro pagar en DjidjiMusic?',
      answer: 'Sí, utilizamos encriptación SSL y procesadores de pago seguros. No almacenamos información de tarjetas en nuestros servidores.',
      icon: <Security />
    },
    {
      category: 'general',
      question: '¿Puedo escuchar música sin registrarme?',
      answer: 'Puedes explorar y escuchar previsualizaciones sin registro. Para escuchar canciones completas y acceder a todas las funciones, necesitas crear una cuenta gratuita.',
      icon: <MusicNote />
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        backgroundImage: `url(/basa.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: { md: 'fixed' },
        overflow: 'hidden',
      }}
    >
      {/* Overlay oscuro para legibilidad */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha('#000', 0.85)} 0%, ${alpha('#000', 0.7)} 50%, ${alpha('#000', 0.85)} 100%)`,
          zIndex: 1,
        }}
      />

      {/* Fondo decorativo animado (sobre el overlay) */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.1),
          filter: 'blur(60px)',
          animation: `${pulse} 8s infinite`,
          zIndex: 2,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.main, 0.1),
          filter: 'blur(60px)',
          animation: `${pulse} 8s infinite 2s`,
          zIndex: 2,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
        {/* Header */}
        <Stack spacing={3} sx={{ mb: 6, textAlign: 'center' }}>
          <Chip
            label="❓ PREGUNTAS FRECUENTES"
            size="small"
            sx={{
              mx: 'auto',
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.primary.main,
              fontWeight: 700,
              letterSpacing: 1,
              px: 2,
              backdropFilter: 'blur(5px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.2rem', md: '3rem' },
              fontWeight: 800,
              lineHeight: 1.2,
              maxWidth: 700,
              mx: 'auto',
              color: '#fff',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            Resolvemos tus{' '}
            <Box
              component="span"
              sx={{
                color: theme.palette.primary.main,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 8,
                  left: 0,
                  width: '100%',
                  height: 12,
                  bgcolor: alpha(theme.palette.primary.main, 0.4),
                  borderRadius: 6,
                  zIndex: -1,
                }
              }}
            >
              dudas
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: alpha('#fff', 0.9),
              fontSize: '1.1rem',
              maxWidth: 600,
              mx: 'auto',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Todo lo que necesitas saber sobre DjidjiMusic. Si no encuentras tu pregunta,
            contáctanos directamente.
          </Typography>
        </Stack>

        {/* Categorías rápidas */}
        <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
          {categories.map((cat, idx) => (
            <Grid item key={idx}>
              <Paper
                sx={{
                  p: 1.5,
                  px: 3,
                  bgcolor: alpha(cat.color, 0.15),
                  backdropFilter: 'blur(5px)',
                  borderRadius: 4,
                  border: `1px solid ${alpha(cat.color, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(cat.color, 0.25),
                    transform: 'translateY(-2px)',
                    borderColor: cat.color,
                  },
                }}
                onClick={() => {
                  const element = document.getElementById(`faq-${cat.label.toLowerCase()}`);
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Box sx={{ color: '#fff' }}>{cat.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#fff' }}>
                  {cat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* FAQ Accordion */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: alpha('#fff', 0.1),
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            overflow: 'hidden',
          }}
        >
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              disableGutters
              elevation={0}
              sx={{
                bgcolor: 'transparent',
                color: '#fff',
                '&:before': { display: 'none' },
                borderBottom: index < faqs.length - 1 ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: theme.palette.primary.main }} />}
                sx={{
                  px: 4,
                  py: 2,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ color: theme.palette.primary.main }}>
                    {faq.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff' }}>
                    {faq.question}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 4, pb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha('#fff', 0.8),
                    pl: 5,
                    lineHeight: 1.7,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        {/* CTA adicional */}
        <Paper
          sx={{
            mt: 4,
            p: 4,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.15),
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
            ¿No encuentras tu pregunta?
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mb: 2 }}>
            Estamos aquí para ayudarte. Contáctanos directamente y te responderemos en menos de 24h.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => window.location.href = '/AboutUs'}
              sx={{
                px: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              Contactar soporte
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = 'https://wa.me/240555380241'}
              startIcon={<WhatsApp />}
              sx={{
                px: 4,
                borderRadius: 3,
                borderColor: alpha('#fff', 0.3),
                color: '#fff',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              WhatsApp
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default FAQ;