// src/components/landing/LandingPage.tsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Box,
  useTheme,
  alpha,
  Fab,
  Zoom,
  CircularProgress,
  Theme
} from '@mui/material';
import {
  KeyboardArrowUp
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

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
// COMPONENTE SEPARADOR REUTILIZABLE (TIPADO CORRECTAMENTE)
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
        {/* theme-color es soportado por Chrome, Edge, Safari, Opera. Firefox no lo soporta pero no afecta funcionalidad */}
        <meta name="theme-color" content="#FF6B35" />
      </Helmet>

      {/* Contenido Principal con Lazy Loading */}
      <Suspense fallback={<SectionLoader />}>
        <Box>
          <Box id="hero">
            <Hero />
          </Box>

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
    </Box>
  );
};

export default LandingPage;