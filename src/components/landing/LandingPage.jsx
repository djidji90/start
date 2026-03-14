// src/landing/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  Fab,
  Zoom,
} from '@mui/material';
import {
  KeyboardArrowUp
} from '@mui/icons-material';

// Importar componentes
import Hero from '../../components/landing/Hero';
import ValueProposition from '../../components/landing/ValueProposition';
import FeaturedArtists from '../../components/landing/FeaturedArtists';
import FAQ from '../../components/landing/FAQ';
import AppPromo from '../../components/landing/AppPromo';

// ============================================
// COMPONENTE: Botón Volver Arriba
// ============================================
const ScrollToTop = () => {
  const [show, setShow] = useState(false);

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
          bottom: 80,
          right: 16,
          zIndex: 1000,
          boxShadow: 4,
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: LandingPage
// ============================================
const LandingPage = ({ deferredPrompt }) => {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative' }}>
      {/* ❌ HEADER Y SECTION NAV ELIMINADOS - Solo usamos el Navbar global */}

      {/* Contenido Principal */}
      <Box>
        {/* Hero */}
        <Box id="hero">
          <Hero />
        </Box>

        <Box sx={{ height: 1, background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`, my: 4 }} />

        {/* Beneficios */}
        <Box id="value-prop">
          <ValueProposition />
        </Box>

        <Box sx={{ height: 1, background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`, my: 4 }} />

        {/* Artistas */}
        <Box id="artists">
          <FeaturedArtists />
        </Box>

        <Box sx={{ height: 1, background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`, my: 4 }} />

        {/* FAQ */}
        <Box id="faq">
          <FAQ />
        </Box>

        <Box sx={{ height: 1, background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`, my: 4 }} />

        {/* App Promo - ÚLTIMA SECCIÓN */}
        <Box id="app-promo">
          <AppPromo deferredPrompt={deferredPrompt} />
        </Box>
      </Box>

      {/* Solo el ScrollToTop, sin footer */}
      <ScrollToTop />
    </Box>
  );
};

export default LandingPage;