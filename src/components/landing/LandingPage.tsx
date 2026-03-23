// src/components/landing/LandingPage.tsx


import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Box,
  useTheme,
  alpha,
  Fab,
  Zoom,
  CircularProgress,
  Theme,
  Container,
  Stack,
  Typography,
  Paper
} from '@mui/material';
import {
  KeyboardArrowUp,
  InstallMobile
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import InstallPWAButton from '../../components/landing/InstallPWAButton';

// Lazy loading para componentes pesados
const Hero = lazy(() => import('./Hero'));
const ValueProposition = lazy(() => import('./ValueProposition'));
const FeaturedGenres = lazy(() => import('./FeaturedArtists'));
const FAQ = lazy(() => import('./FAQ'));
const AppPromo = lazy(() => import('./AppPromo'));

// ============================================
// TIPO PARA EL EVENTO DE INSTALACIÓN PWA
// ============================================
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// ============================================
// SPINNER DE CARGA
// ============================================
const SectionLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress />
  </Box>
);

// ============================================
// COMPONENTE: Botón Volver Arriba
// ============================================
const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Zoom in={show}>
      <Fab
        color="primary"
        size="small"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: { xs: 70, md: 80 },
          right: 16,
          zIndex: theme.zIndex.fab,
          boxShadow: 4,
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
};

// ============================================
// COMPONENTE SEPARADOR REUTILIZABLE
// ============================================
interface SectionDividerProps {
  theme: Theme;
}

const SectionDivider = ({ theme }: SectionDividerProps) => (
  <Box
    sx={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.15)}, transparent)`,
      my: 4,
    }}
  />
);

// ============================================
// BANNER DE INSTALACIÓN FLOTANTE (OPCIONAL)
// ============================================
const InstallBanner = () => {
  const theme = useTheme();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  // No mostrar si ya está instalada
  if (isStandalone) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1300,
        display: { xs: 'block', md: 'none' },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 1.5,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 100%)`,
          backdropFilter: 'blur(10px)',
          color: '#fff',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <InstallMobile sx={{ fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Instala Djidji Music
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Escucha offline, carga más rápido
            </Typography>
          </Box>
          <InstallPWAButton size="small" variant="contained" />
        </Stack>
      </Paper>
    </Box>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: LandingPage
// ============================================
const LandingPage = () => {
  const theme = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // ============================================
  // 🚀 CAPTURAR EVENTO DE INSTALACIÓN PWA
  // ============================================
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('✅ Evento beforeinstallprompt capturado');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  // ============================================
  // 🎨 VERIFICAR SI LA APP YA ESTÁ INSTALADA
  // ============================================
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('📱 App instalada y ejecutándose en modo standalone');
    }
  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* SEO */}
      <Helmet>
        <title>DjidjiMusic - La música de Guinea Ecuatorial</title>
        <meta name="description" content="Plataforma musical dedicada a impulsar artistas y sonidos de Guinea Ecuatorial. Descubre, escucha y comparte." />
        <meta name="theme-color" content="#FF6B35" />
        <link rel="manifest" href="/manifest.json" />
        {/* Apple Touch Icons para iOS */}
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180x180.png" />
        {/* Para navegadores que no soportan theme-color */}
        <meta name="msapplication-TileColor" content="#FF6B35" />
        <meta name="msapplication-TileImage" content="/icons/ms-icon-144x144.png" />
      </Helmet>

      {/* Contenido Principal con Lazy Loading */}
      <Suspense fallback={<SectionLoader />}>
        <Box>
          <Box id="hero">
            <Hero />
          </Box>

          {/* Botón de instalación en Hero (destacado) */}
          <Container maxWidth="lg" sx={{ mt: -4, mb: 4, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <InstallPWAButton variant="contained" size="large" />
            </Box>
          </Container>

          <SectionDivider theme={theme} />

          <Box id="value-prop">
            <ValueProposition />
          </Box>

          <SectionDivider theme={theme} />

          <Box id="artists">
            <FeaturedGenres />
          </Box>

          <SectionDivider theme={theme} />

          <Box id="faq">
            <FAQ />
          </Box>

          <SectionDivider theme={theme} />

          <Box id="app-promo">
            <AppPromo deferredPrompt={deferredPrompt} />
          </Box>
        </Box>
      </Suspense>

      <ScrollToTop />
      <InstallBanner />
    </Box>
  );
};

export default LandingPage;