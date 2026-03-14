// src/landing/components/AppPromo.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  Paper,
  Grid,
  Chip,
  Zoom,
  Snackbar,
  Alert
} from '@mui/material';
import {
  PhoneIphone,
  Android,
  InstallMobile,
  WifiOff,
  Storage,
  Speed,
  Verified
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Animación para el teléfono
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface AppPromoProps {
  deferredPrompt: BeforeInstallPromptEvent | null;
}

const AppPromo = ({ deferredPrompt }: AppPromoProps) => {
  const theme = useTheme();
  const [isInstallable, setIsInstallable] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Verificar si la app ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstallable(!!deferredPrompt && !isStandalone);
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInfo(true);
      setTimeout(() => setShowInfo(false), 4000);
      return;
    }

    try {
      // Mostrar el prompt de instalación
      await deferredPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuario instaló la PWA');
        setShowSuccess(true);
        setIsInstallable(false);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.log('❌ Usuario canceló la instalación');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    } catch (error) {
      console.error('Error en instalación:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const benefits = [
    { icon: <WifiOff />, title: "Modo offline", desc: "Escucha sin conexión" },
    { icon: <Storage />, title: "Ocupa poco espacio", desc: "Menos de 1MB" },
    { icon: <Speed />, title: "Rápida", desc: "Carga instantánea" },
    { icon: <Verified />, title: "Actualizaciones", desc: "Automáticas" },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.95)} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Fondo decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.1),
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.main, 0.1),
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Columna izquierda - Teléfono */}
          <Grid item xs={12} md={5}>
            <Zoom in timeout={800}>
              <Box
                sx={{
                  position: 'relative',
                  animation: `${float} 6s ease-in-out infinite`,
                  textAlign: 'center',
                }}
              >
                <Paper
                  elevation={24}
                  sx={{
                    width: { xs: 280, md: 320 },
                    height: { xs: 560, md: 640 },
                    mx: 'auto',
                    borderRadius: 6,
                    background: '#000',
                    border: '3px solid #333',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 30px 60px ${alpha('#000', 0.5)}`,
                  }}
                >
                  {/* Notch */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 120,
                      height: 30,
                      bgcolor: '#000',
                      borderBottomLeftRadius: 20,
                      borderBottomRightRadius: 20,
                      zIndex: 3,
                    }}
                  />

                  {/* Pantalla con logo de Djidji */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      right: 10,
                      bottom: 10,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: '#fff',
                        fontWeight: 800,
                        textShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      }}
                    >
                      Djidji
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Zoom>
          </Grid>

          {/* Columna derecha - Contenido */}
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>
              <Chip
                label=""
                size="small"
                sx={{
                  width: 'fit-content',
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  letterSpacing: 1,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: '#fff',
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                Lleva la{' '}
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.primary.main,
                    position: 'relative',
                    display: 'inline-block',
                  }}
                >
                  música
                </Box>{' '}
                contigo
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: alpha('#fff', 0.9),
                  fontSize: '1.2rem',
                  maxWidth: 500,
                  lineHeight: 1.7,
                }}
              >
                Instala DjidjiMusic como app en tu móvil. Sin tiendas, sin complicaciones.
                Ocupa menos de 1MB.
              </Typography>

              {/* Beneficios */}
              <Grid container spacing={2}>
                {benefits.map((benefit, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: alpha('#fff', 0.05),
                        backdropFilter: 'blur(5px)',
                        borderRadius: 2,
                        border: `1px solid ${alpha('#fff', 0.1)}`,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ color: theme.palette.primary.main }}>
                          {benefit.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
                            {benefit.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
                            {benefit.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Botón de instalación */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<InstallMobile />}
                  onClick={handleInstallClick}
                  disabled={!isInstallable}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    '&:disabled': {
                      background: alpha('#fff', 0.1),
                      color: alpha('#fff', 0.3),
                    },
                  }}
                >
                  {isInstallable ? 'Instalar app' : 'App instalada ✓'}
                </Button>
              </Stack>

              {/* Compatibilidad */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <PhoneIphone sx={{ color: alpha('#fff', 0.5) }} />
                <Android sx={{ color: alpha('#fff', 0.5) }} />
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
                  Compatible con iOS, Android y cualquier dispositivo
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Notificaciones */}
        <Snackbar open={showSuccess} autoHideDuration={3000}>
          <Alert severity="success" sx={{ bgcolor: alpha(theme.palette.success.main, 0.9), color: '#fff' }}>
            ✅ ¡App instalada correctamente!
          </Alert>
        </Snackbar>

        <Snackbar open={showError} autoHideDuration={3000}>
          <Alert severity="error" sx={{ bgcolor: alpha(theme.palette.error.main, 0.9), color: '#fff' }}>
            ❌ No se pudo instalar. Intenta de nuevo.
          </Alert>
        </Snackbar>

        <Snackbar open={showInfo} autoHideDuration={4000}>
          <Alert severity="info" sx={{ bgcolor: alpha(theme.palette.info.main, 0.9), color: '#fff' }}>
            📱 Para instalar: usa el menú del navegador → "Instalar app"
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AppPromo;