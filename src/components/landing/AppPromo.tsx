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
  Alert,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  IconButton,
  Collapse,
  Card,
  CardContent
} from '@mui/material';
import {
  PhoneIphone,
  Android,
  InstallMobile,
  WifiOff,
  Storage,
  Speed,
  Verified,
  QrCodeScanner,
  Close,
  Download,
  CheckCircle,
  Smartphone
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// 👇 Importación correcta para qrcode.react
import QRCode from 'qrcode.react';

// Animaciones
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(255, 107, 53, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
`;

const checkmark = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isInstallable, setIsInstallable] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [installProgressValue, setInstallProgressValue] = useState(0);
  const [installStep, setInstallStep] = useState(0);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [hasBeenInstalled, setHasBeenInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstallable(!!deferredPrompt && !isStandalone);
    
    const qrShown = localStorage.getItem('pwa_qr_shown');
    if (!qrShown && !isMobile && !isStandalone) {
      setTimeout(() => setShowQR(true), 3000);
    }
  }, [deferredPrompt, isMobile]);

  const simulateInstallAnimation = async () => {
    const steps = [20, 45, 70, 90, 100];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setInstallProgressValue(steps[i]);
      setInstallStep(i + 1);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInfo(true);
      setTimeout(() => setShowInfo(false), 4000);
      return;
    }

    try {
      setIsInstalling(true);
      await simulateInstallAnimation();
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuario instaló la PWA');
        setHasBeenInstalled(true);
        setShowSuccess(true);
        setIsInstallable(false);
        localStorage.setItem('pwa_installed', 'true');
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
    } finally {
      setIsInstalling(false);
      setInstallProgressValue(0);
      setInstallStep(0);
    }
  };

  const handleQRClose = () => {
    setShowQR(false);
    localStorage.setItem('pwa_qr_shown', 'true');
  };

  const benefits = [
    { icon: <WifiOff />, title: "Modo offline", desc: "Escucha sin conexión" },
    { icon: <Storage />, title: "Ocupa poco espacio", desc: "Menos de 1MB" },
    { icon: <Speed />, title: "Rápida", desc: "Carga instantánea" },
    { icon: <Verified />, title: "Actualizaciones", desc: "Automáticas" },
  ];

  const mobileInstructions = [
    { step: 1, action: "Toca el menú (⋯)", icon: "⋯" },
    { step: 2, action: "Selecciona 'Instalar app'", icon: "📱" },
    { step: 3, action: "Confirma la instalación", icon: "✅" }
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        backgroundImage: `url(${imageError ? '' : '/djidji.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: { md: 'fixed' },
        backgroundColor: imageError ? theme.palette.primary.dark : 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Overlay oscuro */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`,
          zIndex: 1,
        }}
      />

      {/* Fondo decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.2),
          filter: 'blur(60px)',
          zIndex: 1,
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
          background: alpha(theme.palette.secondary.main, 0.2),
          filter: 'blur(60px)',
          zIndex: 1,
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
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isInstalling ? (
                      <Box sx={{ textAlign: 'center', px: 3 }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                          Instalando...
                        </Typography>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            bgcolor: alpha('#fff', 0.3),
                            borderRadius: 4,
                            overflow: 'hidden',
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${installProgressValue}%`,
                              height: '100%',
                              bgcolor: '#fff',
                              borderRadius: 4,
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: alpha('#fff', 0.9) }}>
                          {installStep === 1 && "📦 Descargando archivos..."}
                          {installStep === 2 && "⚙️ Configurando app..."}
                          {installStep === 3 && "🎵 Preparando tu música..."}
                          {installStep === 4 && "✨ Finalizando..."}
                          {installStep === 5 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Box component="span" sx={{ animation: `${checkmark} 0.5s ease-out` }}>
                                ✅
                              </Box>
                              ¡Listo!
                            </Box>
                          )}
                        </Typography>
                      </Box>
                    ) : (
                      <>
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
                        {hasBeenInstalled && (
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: '#4caf50' }} />
                            <Typography variant="caption" sx={{ color: '#fff' }}>
                              App instalada
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Zoom>
          </Grid>

          {/* Columna derecha */}
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>
              <Chip
                label="✨ NUEVO ✨"
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
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                Lleva la{' '}
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.primary.main,
                    position: 'relative',
                    display: 'inline-block',
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  música
                </Box>{' '}
                contigo
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#fff',
                  fontSize: '1.2rem',
                  maxWidth: 500,
                  lineHeight: 1.7,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Instala la app en tu móvil. Sin tiendas, sin complicaciones.
                Ocupa menos de 1MB.
              </Typography>

              <Grid container spacing={2}>
                {benefits.map((benefit, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: alpha('#000', 0.3),
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        border: `1px solid ${alpha('#fff', 0.1)}`,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ color: theme.palette.primary.main }}>{benefit.icon}</Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
                            {benefit.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
                            {benefit.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isInstalling ? <CircularProgress size={20} color="inherit" /> : <InstallMobile />}
                  onClick={handleInstallClick}
                  disabled={!isInstallable || isInstalling}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    animation: isInstallable && !isInstalling ? `${pulse} 2s infinite` : 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    '&:disabled': {
                      background: alpha('#fff', 0.2),
                      color: alpha('#fff', 0.5),
                    },
                  }}
                >
                  {isInstalling ? 'Instalando...' : (isInstallable ? 'Instalar app' : 'App instalada ✓')}
                </Button>

                {!isMobile && (
                  <Tooltip title="Escanea con tu móvil">
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<QrCodeScanner />}
                      onClick={() => setShowQR(!showQR)}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        borderColor: alpha('#fff', 0.5),
                        color: '#fff',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      Escanear QR
                    </Button>
                  </Tooltip>
                )}
              </Stack>

              {isMobile && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="text"
                    startIcon={<Smartphone />}
                    onClick={() => setShowMobileInfo(!showMobileInfo)}
                    sx={{ color: alpha('#fff', 0.8) }}
                  >
                    ¿Cómo instalar?
                  </Button>
                  <Collapse in={showMobileInfo}>
                    <Card sx={{ mt: 2, bgcolor: alpha('#000', 0.5), backdropFilter: 'blur(10px)' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2 }}>
                          📱 Instalación paso a paso:
                        </Typography>
                        <Stack spacing={1.5}>
                          {mobileInstructions.map((instruction) => (
                            <Box key={instruction.step} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.primary.main,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                }}
                              >
                                {instruction.step}
                              </Box>
                              <Typography variant="body2" sx={{ color: '#fff' }}>
                                {instruction.action}
                              </Typography>
                              <Typography variant="h6" sx={{ color: alpha('#fff', 0.7) }}>
                                {instruction.icon}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Collapse>
                </Box>
              )}

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <PhoneIphone sx={{ color: alpha('#fff', 0.7) }} />
                <Android sx={{ color: alpha('#fff', 0.7) }} />
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
                  Compatible con iOS, Android y cualquier dispositivo
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* QR Code flotante */}
        {showQR && (
          <Paper
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              p: 3,
              borderRadius: 4,
              bgcolor: '#fff',
              textAlign: 'center',
              maxWidth: 280,
              boxShadow: `0 10px 40px ${alpha('#000', 0.2)}`,
            }}
          >
            <IconButton
              onClick={handleQRClose}
              sx={{ position: 'absolute', top: 8, right: 8 }}
              size="small"
            >
              <Close />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Escanea con tu móvil
            </Typography>
            <QRCode
              value={window.location.href}
              size={200}
              level="H"
              includeMargin
              style={{ margin: '0 auto', display: 'block' }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
              Abre la cámara y apunta al código QR
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Download />}
              onClick={handleInstallClick}
              disabled={!isInstallable}
              sx={{ mt: 2, width: '100%' }}
            >
              Instalar ahora
            </Button>
          </Paper>
        )}

        {/* Imagen oculta para error */}
        <Box
          component="img"
          src="/Logo de Djidji Music.png"
          onError={() => setImageError(true)}
          sx={{ display: 'none' }}
        />

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