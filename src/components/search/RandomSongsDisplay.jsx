import React from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Refresh,
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
    refresh,
    retryAuth,
    isEmpty,
    showLoading,
    showError,
    showContent
  } = useRandomSongs();

  // Estados del componente
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <ErrorIcon sx={{ fontSize: 40, color: "error.main", mb: 1.5 }} />
          <Typography variant="h6" gutterBottom color="error.main">
            Sesión requerida
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {error || "Inicia sesión para ver las canciones"}
          </Typography>
          <Button variant="contained" onClick={retryAuth} fullWidth>
            Reintentar
          </Button>
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
        py: 6
      }}>
        <CircularProgress size={isMobile ? 35 : 45} />
        <Typography variant="body1" sx={{ mt: 1.5 }}>
          Cargando canciones...
        </Typography>
      </Box>
    );
  }

  if (showError) {
    return (
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Alert
          severity="error"
          sx={{ mb: 1.5 }}
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
        <Button variant="contained" onClick={refresh} startIcon={<Refresh />}>
          Reintentar
        </Button>
      </Container>
    );
  }

  if (isEmpty) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <MusicNote sx={{ fontSize: 40, color: "text.secondary", mb: 1.5 }} />
          <Typography variant="h6" gutterBottom>
            No hay canciones
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            No hay canciones disponibles.
          </Typography>
          <Button variant="contained" onClick={refresh} startIcon={<Refresh />}>
            Buscar canciones
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: isMobile ? 1 : 2 }}>
      {/* Header optimizado - TÍTULO Y BOTÓN ELIMINADOS */}
      <Box sx={{
        display: "flex",
        justifyContent: "flex-end", // Solo el botón a la derecha
        alignItems: "center",
        mb: 2,
        flexWrap: "wrap",
        gap: 1.5
      }}>
        {/* Solo queda el botón de refrescar */}
        <Button
          variant="outlined"
          onClick={refresh}
          startIcon={<Refresh />}
          size={isMobile ? "medium" : "small"}
          sx={{ minWidth: "auto" }}
        >
          {isMobile ? "Nuevas" : "Nuevas"}
        </Button>
      </Box>

      {/* Grid vertical optimizado */}
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
                transition: "transform 0.2s ease",
                "&:active": isMobile ? {
                  transform: "scale(0.98)"
                } : {},
                "&:hover": !isMobile ? {
                  transform: "translateY(-3px)"
                } : {}
              }}
            >
              <SongCard
                song={song}
                sx={{
                  height: "100%",
                  "&:hover": !isMobile ? {
                    boxShadow: 3
                  } : {}
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Información mínima optimizada */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        pt: 1.5,
        borderTop: 1,
        borderColor: "divider",
        px: 0.5
      }}>
        <Typography variant="caption" color="text.secondary">
          {songs.length} canciones
        </Typography>

        <Typography variant="caption" color="text.secondary">
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