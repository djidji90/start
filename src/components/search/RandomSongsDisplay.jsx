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
  useTheme
} from "@mui/material";
import {
  MusicNote,
  Error as ErrorIcon
} from "@mui/icons-material";
import useRandomSongs from "../../components/hook/services/useRandomSongs";
import SongCard from "../../songs/SongCard";

const RandomSongsDisplay = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Usamos el hook completo
  const {
    songs,
    loading,
    error,
    isAuthenticated,
    retryAuth,
    isEmpty,
    showLoading,
    showError,
    showContent
  } = useRandomSongs();

  // Estados del componente
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: isMobile ? 2 : 3, px: isMobile ? 2 : 3 }}>
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          borderRadius: 2,
          boxShadow: isMobile ? 0 : 1 
        }}>
          <ErrorIcon sx={{ 
            fontSize: isMobile ? 32 : 40, 
            color: "error.main", 
            mb: isMobile ? 1 : 1.5 
          }} />
          <Typography 
            variant="h6" 
            gutterBottom 
            color="error.main"
            sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
          >
            Sesión requerida
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            paragraph
            sx={{ fontSize: isMobile ? "0.85rem" : "1rem" }}
          >
            {error || "Inicia sesión para ver las canciones"}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (showLoading) {
    return (
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: isMobile ? 4 : 6,
        minHeight: isMobile ? "30vh" : "40vh"
      }}>
        <CircularProgress size={isMobile ? 30 : 45} />
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 1.5,
            fontSize: isMobile ? "0.9rem" : "1rem"
          }}
        >
          Cargando canciones...
        </Typography>
      </Box>
    );
  }

  if (showError) {
    return (
      <Container maxWidth="md" sx={{ 
        mt: isMobile ? 2 : 3,
        px: isMobile ? 2 : 3 
      }}>
        <Alert
          severity="error"
          sx={{ 
            mb: 1.5,
            fontSize: isMobile ? "0.85rem" : "1rem"
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (isEmpty) {
    return (
      <Container maxWidth="sm" sx={{ px: isMobile ? 2 : 3 }}>
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          textAlign: "center",
          boxShadow: isMobile ? 0 : 1
        }}>
          <MusicNote sx={{ 
            fontSize: isMobile ? 32 : 40, 
            color: "text.secondary", 
            mb: isMobile ? 1 : 1.5 
          }} />
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
          >
            No hay canciones
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            paragraph
            sx={{ fontSize: isMobile ? "0.85rem" : "1rem" }}
          >
            No hay canciones disponibles.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: isMobile ? 1 : 2, 
        px: isMobile ? 0.5 : 2,
        maxWidth: "100%",
        overflow: "hidden"
      }}
    >
      {/* Grid de canciones - sin header */}
      <Grid container spacing={isMobile ? 1 : 1.5}>
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
                transition: "transform 0.2s ease",
                "&:active": {
                  transform: "scale(0.97)",
                  opacity: 0.9
                },
                // Hover solo en desktop
                "&:hover": !isMobile ? {
                  transform: "translateY(-3px)"
                } : {}
              }}
            >
              <SongCard
                song={song}
                sx={{
                  height: "100%",
                  // Hover solo en desktop
                  "&:hover": !isMobile ? {
                    boxShadow: 3
                  } : {}
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Información mínima optimizada para móvil */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: isMobile ? 1 : 2,
        pt: isMobile ? 1 : 1.5,
        borderTop: 1,
        borderColor: "divider",
        px: isMobile ? 0 : 0.5
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}
        >
          {songs.length} canciones
        </Typography>

        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}
        >
          {new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </Box>
    </Container>
  );
};

export default RandomSongsDisplay;