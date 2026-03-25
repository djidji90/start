import React from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
  Button,
  Fade,
  Skeleton,
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
// SKELETON COMPONENT PARA RANDOM SONGS
// ============================================

/**
 * SongCardSkeleton - Esqueleto para cada tarjeta de canción
 */
const SongCardSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: { xs: 280, sm: 300, md: 320 },
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      {/* Imagen/Arte de la canción */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={200}
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          transform: "none"
        }}
      />
      
      {/* Contenido de la tarjeta */}
      <Box sx={{ p: 2 }}>
        {/* Título de la canción */}
        <Skeleton
          variant="text"
          width="85%"
          height={24}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            mb: 1,
            borderRadius: 1
          }}
        />
        
        {/* Nombre del artista */}
        <Skeleton
          variant="text"
          width="60%"
          height={20}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 1
          }}
        />
        
        {/* Metadata adicional (duración, género, etc) */}
        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
          <Skeleton
            variant="rounded"
            width={50}
            height={24}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1.5
            }}
          />
          <Skeleton
            variant="rounded"
            width={70}
            height={24}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1.5
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * RandomSongsSkeleton - Grid completo de skeletons
 */
const RandomSongsSkeleton = ({ cards = 8 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // Determinar cuántos skeletons mostrar según el dispositivo
  const getCardsCount = () => {
    if (isMobile) return Math.min(cards, 4);
    if (theme.breakpoints.down("lg")) return Math.min(cards, 6);
    return Math.min(cards, 8);
  };
  
  const skeletonCount = getCardsCount();
  
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header Skeleton */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexWrap: "wrap",
        gap: 2
      }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width={200}
            height={40}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 1,
              mb: 1
            }}
          />
          <Skeleton
            variant="text"
            width={150}
            height={20}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1
            }}
          />
        </Box>
        
        <Skeleton
          variant="rounded"
          width={120}
          height={36}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 3
          }}
        />
      </Box>
      
      {/* Grid de Skeletons */}
      <Grid container spacing={isMobile ? 1.5 : 2}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Grid
            item
            key={`skeleton-${index}`}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            sx={{ display: "flex" }}
          >
            <Fade in={true} timeout={300 * (index * 0.1)}>
              <Box sx={{ width: "100%" }}>
                <SongCardSkeleton />
              </Box>
            </Fade>
          </Grid>
        ))}
      </Grid>
      
      {/* Footer Skeleton */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
        pt: 2,
        borderTop: `2px solid ${alpha(theme.palette.divider, 0.5)}`,
        flexWrap: "wrap",
        gap: 1
      }}>
        <Skeleton
          variant="text"
          width={120}
          height={20}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 1
          }}
        />
        
        <Skeleton
          variant="text"
          width={150}
          height={20}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 1
          }}
        />
      </Box>
    </Container>
  );
};

// ============================================
// COMPONENTE PRINCIPAL MEJORADO
// ============================================

const RandomSongsDisplay = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Usamos el hook completo
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

  // Estados del componente
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
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
              backdropFilter: "blur(10px)"
            }}
          >
            <ErrorIcon sx={{ 
              fontSize: 60, 
              color: theme.palette.error.main, 
              mb: 2,
              filter: "drop-shadow(0 4px 8px rgba(244, 67, 54, 0.3))"
            }} />

            <Typography variant="h5" gutterBottom fontWeight={600}>
              Sesión requerida
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
              {error || "Inicia sesión para descubrir nueva música"}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/Login")}
              startIcon={<LoginIcon />}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4]
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

  // ✅ ESTADO DE CARGA MEJORADO CON SKELETON
  if (showLoading) {
    return <RandomSongsSkeleton cards={8} />;
  }

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
                py: 1.5
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  ¡Ups! Algo salió mal
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 25px ${theme.palette.primary.main}40`
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
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)"
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
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
              backdropFilter: "blur(10px)"
            }}
          >
            <MusicNote sx={{ 
              fontSize: 60, 
              color: theme.palette.text.secondary, 
              mb: 2,
              opacity: 0.8
            }} />

            <Typography variant="h5" gutterBottom fontWeight={600}>
              No hay canciones disponibles
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
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
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4]
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

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: isMobile ? 1 : 2 }}>
      {/* Header con opción de refrescar */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexWrap: "wrap",
        gap: 2
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Selección para ti
          </Typography>
          <Typography variant="caption" color="text.secondary">
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
            px: 3,
            "&:hover": {
              borderWidth: 2,
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[2]
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
                    boxShadow: 6
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
                  borderRadius: 3
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Footer informativo */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
        pt: 2,
        borderTop: `2px solid ${theme.palette.divider}`,
        flexWrap: "wrap",
        gap: 1
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: "50%",
            backgroundColor: theme.palette.success.main,
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.5 }
            }
          }} />
          <Typography variant="caption" color="text.secondary">
            {songs.length} canciones disponibles
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Refresh sx={{ fontSize: 12, color: theme.palette.text.disabled }} />
          <Typography variant="caption" color="text.secondary">
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