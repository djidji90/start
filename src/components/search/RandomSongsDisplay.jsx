// ============================================
// components/search/RandomSongsDisplay.jsx
// VERSIÓN FINAL - TEXTOS BLANCOS SOBRE FONDO OSCURO
// 100% compatible con MainPage oscura
// ============================================

import React from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
  Button,
  Fade,
  alpha
} from "@mui/material";
import {
  Refresh,
  MusicNote,
  Error as ErrorIcon,
  Login as LoginIcon,
  AutoAwesome
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useRandomSongs from "../../components/hook/services/useRandomSongs";
import SongCard from "../../songs/SongCard";

// ============================================
// 🎨 IDENTIDAD VISUAL - MISMA QUE MAINPAGE
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  // ✅ TEXTOS BLANCOS - MÁXIMO CONTRASTE
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.85)',  // Aumentado de 0.7 a 0.85
  textTertiary: 'rgba(255,255,255,0.65)',   // Aumentado de 0.5 a 0.65
  background: {
    dark: '#0A0A0A',
    medium: '#121212',
    light: '#1A1A1A',
    paper: 'rgba(30,30,30,0.9)'  // Aumentado opacidad para mejor contraste
  }
};

// ============================================
// 🎨 SOMBRAS UNIFORMES
// ============================================
const shadows = {
  small: (opacity = 0.2) => `0 4px 12px ${alpha('#000', opacity)}`,
  medium: (opacity = 0.25) => `0 8px 20px ${alpha('#000', opacity)}`,
  large: (opacity = 0.3) => `0 12px 28px ${alpha('#000', opacity)}`,
  primary: (opacity = 0.3) => `0 8px 20px ${alpha(colors.primary, opacity)}`,
};

const RandomSongsDisplay = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const {
    songs,
    loading,
    error,
    isAuthenticated,
    refresh,
    isEmpty,
    showLoading,
    showError,
    showContent
  } = useRandomSongs();

  // ============================================
  // 🚫 NO AUTENTICADO - Texto blanco
  // ============================================
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <Fade in={true} timeout={600}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 4,
              textAlign: "center",
              background: colors.background.paper,
              backdropFilter: "blur(12px)",
              border: `1px solid ${alpha(colors.primary, 0.2)}`,
              boxShadow: shadows.medium(0.3)
            }}
          >
            <ErrorIcon sx={{ 
              fontSize: 60, 
              color: colors.primary, 
              mb: 2,
              filter: `drop-shadow(0 4px 8px ${alpha(colors.primary, 0.3)})`
            }} />

            {/* ✅ Texto blanco puro */}
            <Typography variant="h5" gutterBottom fontWeight={600} sx={{ color: colors.textPrimary }}>
              Sesión requerida
            </Typography>

            {/* ✅ Texto blanco con 85% opacidad */}
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3 }}>
              {error || "Inicia sesión para descubrir nueva música"}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/")}
              startIcon={<LoginIcon />}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                color: colors.textPrimary,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: shadows.primary(0.3),
                "&:hover": {
                  transform: "translateY(-2px)",
                  background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                  boxShadow: shadows.primary(0.4)
                },
                transition: "all 0.3s ease"
              }}
            >
              Ir a iniciar sesión
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  // ============================================
  // ⏳ CARGANDO - Texto blanco
  // ============================================
  if (showLoading) {
    return (
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        minHeight: "50vh"
      }}>
        <CircularProgress 
          size={isMobile ? 40 : 60} 
          thickness={4}
          sx={{ 
            color: colors.primary,
            filter: `drop-shadow(0 2px 8px ${alpha(colors.primary, 0.3)})`
          }}
        />
        {/* ✅ Texto blanco con 85% opacidad */}
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 2.5,
            color: colors.textSecondary,
            fontWeight: 500
          }}
        >
          Buscando las mejores canciones para ti...
        </Typography>
      </Box>
    );
  }

  // ============================================
  // ❌ ERROR - Texto blanco
  // ============================================
  if (showError) {
    return (
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Fade in={true} timeout={500}>
          <Box>
            <Alert
              severity="error"
              variant="outlined"
              icon={<ErrorIcon fontSize="large" />}
              sx={{ 
                mb: 2.5,
                borderRadius: 3,
                borderWidth: 2,
                alignItems: "flex-start",
                py: 1.5,
                bgcolor: alpha('#FF4444', 0.1),
                borderColor: alpha('#FF4444', 0.3),
                '& .MuiAlert-icon': {
                  color: '#FF4444'
                }
              }}
            >
              <Box>
                {/* ✅ Texto blanco puro */}
                <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: colors.textPrimary }}>
                  ¡Ups! Algo salió mal
                </Typography>
                {/* ✅ Texto blanco con 85% opacidad */}
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {error || "No pudimos cargar las canciones. Inténtalo de nuevo."}
                </Typography>
              </Box>
            </Alert>

            <Box sx={{ 
              display: "flex", 
              gap: 2,
              flexDirection: isMobile ? "column" : "row"
            }}>
              <Button
                variant="contained"
                onClick={refresh}
                startIcon={<Refresh />}
                fullWidth={isMobile}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                  color: colors.textPrimary,
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  boxShadow: shadows.primary(0.3),
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: shadows.primary(0.4)
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Reintentar
              </Button>

              <Button
                variant="outlined"
                onClick={refresh}
                startIcon={<AutoAwesome />}
                fullWidth={isMobile}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: alpha(colors.primary, 0.5),
                  color: colors.textPrimary,
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: colors.primary,
                    transform: "translateY(-2px)",
                    bgcolor: alpha(colors.primary, 0.15)
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Explorar nuevas canciones
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>
    );
  }

  // ============================================
  // 📭 SIN CONTENIDO - Texto blanco
  // ============================================
  if (isEmpty) {
    return (
      <Container maxWidth="sm">
        <Fade in={true} timeout={600}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              textAlign: "center",
              borderRadius: 4,
              background: colors.background.paper,
              backdropFilter: "blur(12px)",
              border: `1px solid ${alpha(colors.primary, 0.2)}`,
              boxShadow: shadows.medium(0.3)
            }}
          >
            <MusicNote sx={{ 
              fontSize: 60, 
              color: colors.textTertiary, 
              mb: 2
            }} />

            {/* ✅ Texto blanco puro */}
            <Typography variant="h5" gutterBottom fontWeight={600} sx={{ color: colors.textPrimary }}>
              No hay canciones disponibles
            </Typography>

            {/* ✅ Texto blanco con 85% opacidad */}
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3 }}>
              Parece que no hay música cargada en este momento.
            </Typography>

            <Button
              variant="contained"
              onClick={refresh}
              startIcon={<Refresh />}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
                color: colors.textPrimary,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: shadows.primary(0.3),
                "&:hover": {
                  transform: "translateY(-2px)",
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                  boxShadow: shadows.primary(0.4)
                },
                transition: "all 0.3s ease"
              }}
            >
              Buscar canciones
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  // ============================================
  // 🎵 CONTENIDO NORMAL - TODOS LOS TEXTOS EN BLANCO
  // ============================================
  return (
    <Container maxWidth="xl" sx={{ py: 2, px: isMobile ? 1 : 2 }}>
      {/* Header */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexWrap: "wrap",
        gap: 2
      }}>
        <Box>
          {/* ✅ Título con gradiente naranja sobre fondo negro */}
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 30%, ${colors.primaryLight} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              // Fallback para navegadores que no soportan gradient text
              color: colors.primary,
            }}
          >
            Selección para ti
          </Typography>
          {/* ✅ Texto blanco con 65% opacidad */}
          <Typography variant="caption" sx={{ color: colors.textTertiary }}>
            Descubre nueva música automáticamente
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={refresh}
          startIcon={<Refresh />}
          size={isMobile ? "medium" : "small"}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            textTransform: "none",
            borderWidth: 2,
            borderColor: alpha(colors.primary, 0.5),
            color: colors.textPrimary,  // ✅ Texto blanco
            px: 3,
            "&:hover": {
              borderWidth: 2,
              borderColor: colors.primary,
              transform: "translateY(-2px)",
              boxShadow: shadows.primary(0.2),
              bgcolor: alpha(colors.primary, 0.1)
            },
            transition: "all 0.3s ease"
          }}
        >
          {isMobile ? "Actualizar" : "Nuevas canciones"}
        </Button>
      </Box>

      {/* Grid de canciones */}
      <Grid container spacing={isMobile ? 1.5 : 2}>
        {songs.map((song) => (
          <Grid 
            item 
            key={song.id} 
            xs={12} 
            sm={6} 
            md={4} 
            lg={3}
            sx={{ display: "flex" }}
          >
            <Box
              sx={{
                width: "100%",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:active": isMobile ? {
                  transform: "scale(0.98)"
                } : {},
                "&:hover": !isMobile ? {
                  transform: "translateY(-6px)",
                  "& .song-card": {
                    boxShadow: shadows.large(0.3)
                  }
                } : {}
              }}
            >
              <SongCard
                song={song}
                className="song-card"
                sx={{
                  height: "100%",
                  transition: "box-shadow 0.3s ease",
                  borderRadius: 3,
                  bgcolor: colors.background.paper,
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${alpha(colors.primary, 0.15)}`,
                  // Asegurar que los textos dentro de SongCard también sean blancos
                  '& .MuiTypography-root': {
                    color: colors.textPrimary
                  },
                  '& .MuiTypography-secondary': {
                    color: colors.textSecondary
                  }
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Footer */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
        pt: 2,
        borderTop: `2px solid ${alpha(colors.primary, 0.2)}`,
        flexWrap: "wrap",
        gap: 1
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: "50%",
            backgroundColor: colors.primary,
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.5 }
            }
          }} />
          {/* ✅ Texto blanco con 85% opacidad */}
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            {songs.length} canciones disponibles
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Refresh sx={{ fontSize: 12, color: colors.textTertiary }} />
          {/* ✅ Texto blanco con 65% opacidad */}
          <Typography variant="caption" sx={{ color: colors.textTertiary }}>
            Actualizado: {new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RandomSongsDisplay;