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
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <ErrorIcon sx={{ fontSize: 50, color: "error.main", mb: 2 }} />
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
        py: 8
      }}>
        <CircularProgress size={isMobile ? 40 : 50} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando canciones...
        </Typography>
      </Box>
    );
  }

  if (showError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
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
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <MusicNote sx={{ fontSize: 50, color: "text.secondary", mb: 2 }} />
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
    <Container maxWidth="xl" sx={{ py: 3, px: isMobile ? 1 : 3 }}>
      {/* Header limpio */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexWrap: "wrap",
        gap: 2
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="medium">
          Selección Especial
        </Typography>

        <Button
          variant="outlined"
          onClick={refresh}
          startIcon={<Refresh />}
          size={isMobile ? "medium" : "small"}
        >
          {isMobile ? "Nuevas" : "Nuevas canciones"}
        </Button>
      </Box>

      {/* Grid vertical - SCROLL VERTICAL */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {songs.map((song) => (
          <Grid 
            item 
            key={song.id} 
            xs={12} 
            sm={6} 
            md={4} 
            lg={3}
          >
            <Box
              sx={{
                transition: "transform 0.2s ease",
                "&:active": isMobile ? {
                  transform: "scale(0.98)"
                } : {},
                "&:hover": !isMobile ? {
                  transform: "translateY(-4px)"
                } : {}
              }}
            >
              <SongCard
                song={song}
                sx={{
                  height: "100%",
                  "&:hover": !isMobile ? {
                    boxShadow: 4
                  } : {}
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Información mínima */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
        pt: 2,
        borderTop: 1,
        borderColor: "divider",
        px: isMobile ? 0.5 : 1
      }}>
        <Typography variant="caption" color="text.secondary">
          {songs.length} canciones disponibles
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Actualizado: {new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </Box>
    </Container>
  );
};

export default RandomSongsDisplay;