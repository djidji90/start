// src/landing/components/ValueProposition.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  useTheme,
  Stack,
  Chip,
  useMediaQuery,
  IconButton
} from "@mui/material";
import {
  Headphones,
  Download,
  QueueMusic,
  RecordVoiceOver,
  Language,
  Verified,
  MusicNote,
  ArrowBackIos,
  ArrowForwardIos
} from "@mui/icons-material";

const ValueProposition = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const features = [
    { icon: <Headphones sx={{ fontSize: 32 }} />, title: "Sin anuncios", desc: "Escucha música sin interrupciones publicitarias", color: theme.palette.primary.main, badge: "Premium" },
    { icon: <Download sx={{ fontSize: 32 }} />, title: "Modo offline", desc: "Descarga canciones y escúchalas sin conexión", color: theme.palette.secondary.main, badge: "Disponible" },
    { icon: <QueueMusic sx={{ fontSize: 32 }} />, title: "Playlists inteligentes", desc: "Recomendaciones personalizadas basadas en tus gustos", color: theme.palette.success.main, badge: "Nuevo" },
    { icon: <RecordVoiceOver sx={{ fontSize: 32 }} />, title: "Letras sincronizadas", desc: "Canta con tus canciones favoritas en tiempo real", color: theme.palette.warning.main, badge: "Popular" },
    { icon: <Language sx={{ fontSize: 32 }} />, title: "Contenido local", desc: "Descubre artistas de Malabo, Bata y todo el país", color: theme.palette.info.main, badge: "Exclusivo" },
    { icon: <Verified sx={{ fontSize: 32 }} />, title: "Alta calidad", desc: "Audio en alta fidelidad para una experiencia superior", color: theme.palette.error.main, badge: "HD" },
    { icon: <MusicNote sx={{ fontSize: 32 }} />, title: "Sube tu música", desc: "Comparte tus canciones y llega a nuevos oyentes", color: theme.palette.primary.main, badge: "Artistas" }
  ];

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = isMobile ? 250 : 400;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
    setTimeout(checkScroll, 300);
  };

  if (!features?.length) return null;

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        position: "relative",
        backgroundImage: `url(/m321.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: { md: "fixed" },
        backgroundColor: theme.palette.background.default, // fallback sólido
        color: theme.palette.common.white
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha('#000000', 0.85)} 0%, ${alpha('#000000', 0.7)} 50%, ${alpha('#000000', 0.85)} 100%)`,
          zIndex: 1
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <Stack spacing={2} sx={{ mb: 6, textAlign: "center" }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: theme.palette.primary.main, 
              fontWeight: 700, 
              letterSpacing: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }}
          >
            CARACTERÍSTICAS
          </Typography>

          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: "2rem", md: "3rem" }, 
              fontWeight: 800,
              textShadow: "0 4px 8px rgba(0,0,0,0.5)"
            }}
          >
            La experiencia musical de{" "}
            <Box component="span" sx={{ color: theme.palette.primary.main }}>
              Guinea Ecuatorial
            </Box>
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: "1.1rem", 
              maxWidth: 600, 
              mx: "auto",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }}
          >
            Escucha, descubre y comparte música local en una plataforma diseñada para impulsar el talento africano.
          </Typography>
        </Stack>

        {/* Carousel */}
        <Box sx={{ position: "relative" }}>
          {/* Flecha izquierda - solo desktop */}
          {!isMobile && canScrollLeft && (
            <IconButton
              onClick={() => scrollCarousel("left")}
              sx={{
                position: "absolute",
                left: -16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 3,
                color: "white",
                bgcolor: alpha(theme.palette.primary.main, 0.7),
                width: 48,
                height: 48,
                "&:hover": { 
                  bgcolor: theme.palette.primary.main,
                  transform: "translateY(-50%) scale(1.1)"
                },
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                backdropFilter: "blur(4px)"
              }}
            >
              <ArrowBackIos />
            </IconButton>
          )}

          <Box
            ref={carouselRef}
            onScroll={checkScroll}
            sx={{
              display: "flex",
              gap: 3,
              overflowX: "auto",
              scrollBehavior: "smooth",
              py: 2,
              px: 1,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none"
            }}
          >
            {features.map((feature, idx) => (
              <Paper
                key={idx}
                elevation={12}
                sx={{
                  minWidth: { xs: 260, sm: 300 },
                  flex: "0 0 auto",
                  p: 4,
                  borderRadius: 4,
                  background: alpha('#f8f4f4', 0.95),
                  color: theme.palette.text.primary,
                  transition: "all 0.3s ease",
                  border: `1px solid ${alpha(feature.color, 0.3)}`,
                  boxShadow: `0 10px 30px ${alpha('#000000', 0.3)}`,
                  "&:hover": { 
                    transform: "translateY(-8px)",
                    boxShadow: `0 20px 40px ${alpha(feature.color, 0.4)}`,
                    borderColor: feature.color,
                    background: alpha('#ff9100', 1),
                  }
                }}
              >
                <Chip
                  label={feature.badge}
                  size="small"
                  sx={{ 
                    mb: 2, 
                    bgcolor: alpha(feature.color, 0.2),
                    color: feature.color,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    border: `1px solid ${alpha(feature.color, 0.3)}`,
                  }}
                />
                <Box sx={{ color: feature.color, mb: 2, transform: "scale(1.2)" }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="700" mb={1}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                  {feature.desc}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* Flecha derecha - solo desktop */}
          {!isMobile && canScrollRight && (
            <IconButton
              onClick={() => scrollCarousel("right")}
              sx={{
                position: "absolute",
                right: -16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 3,
                color: "white",
                bgcolor: alpha(theme.palette.primary.main, 0.7),
                width: 48,
                height: 48,
                "&:hover": { 
                  bgcolor: theme.palette.primary.main,
                  transform: "translateY(-50%) scale(1.1)"
                },
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                backdropFilter: "blur(4px)"
              }}
            >
              <ArrowForwardIos />
            </IconButton>
          )}
        </Box>

        {/* Indicador de scroll para móvil */}
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 0.5 }}>
            <Box sx={{ width: 30, height: 3, bgcolor: alpha(theme.palette.primary.main, 0.5), borderRadius: 1 }} />
            <Box sx={{ width: 15, height: 3, bgcolor: alpha('#fff', 0.2), borderRadius: 1 }} />
            <Box sx={{ width: 15, height: 3, bgcolor: alpha('#fff', 0.2), borderRadius: 1 }} />
          </Box>
        )}

        {/* Closing message */}
        <Box
          sx={{
            mt: 6,
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            background: alpha('#FFFFFF', 0.1),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            color: "white"
          }}
        >
          <Typography sx={{ maxWidth: 600, mx: "auto", lineHeight: 1.6, fontSize: "1.1rem" }}>
            DjidjiMusic está construido para impulsar la música de Guinea Ecuatorial y conectar artistas con nuevos oyentes cada día.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ValueProposition;  