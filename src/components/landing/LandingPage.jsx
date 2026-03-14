// src/landing/LandingPage.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import { Helmet } from 'react-helmet-async';

// Importar componentes (con lazy loading opcional)
import Hero from '../../components/landing/Hero';
import ValueProposition from '../../components/landing/ValueProposition';
import FeaturedGenres from '../../components/landing/FeaturedArtists'; // ✅ NOMBRE CORREGIDO
import FAQ from '../../components/landing/FAQ';
import AppPromo from '../../components/landing/AppPromo';

// Componente separador reutilizable
const SectionDivider = ({ theme }) => (
  <Box
    sx={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.15)}, transparent)`,
      my: 4,
    }}
  />
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
// COMPONENTE PRINCIPAL: LandingPage
// ============================================
const LandingPage = ({ deferredPrompt }) => {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative' }}>
      {/* SEO */}
      <Helmet>
        <title>DjidjiMusic - La música de Guinea Ecuatorial</title>
        <meta name="description" content="Plataforma musical dedicada a impulsar artistas y sonidos de Guinea Ecuatorial. Descubre, escucha y comparte." />
      </Helmet>

      {/* Contenido Principal */}
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
          <FeaturedGenres /> {/* ✅ NOMBRE CORREGIDO */}
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

      <ScrollToTop />
    </Box>
  );
};

// PropTypes para validación básica
LandingPage.propTypes = {
  deferredPrompt: (props, propName, componentName) => {
    // Validación personalizada (opcional)
    return null;
  }
};

export default LandingPage;