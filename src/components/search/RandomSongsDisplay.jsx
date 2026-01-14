// src/components/songs/RandomSongsDisplay.jsx - VERSIÓN FINAL
import React, { useRef, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Refresh,
  MusicNote,
  Error as ErrorIcon,
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";
import useRandomSongs from "../../components/hook/services/useRandomSongs";
import SongCard from "../../songs/SongCard";

const RandomSongsDisplay = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const scrollContainerRef = useRef(null);
  const [touchStart, setTouchStart] = React.useState(0);

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

  // Touch handlers para móvil
  const handleTouchStart = (e) => {
    if (isMobile && scrollContainerRef.current) {
      setTouchStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (isMobile && scrollContainerRef.current && touchStart !== 0) {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const diff = touchStart - touchX;
      scrollContainerRef.current.scrollLeft += diff;
      setTouchStart(touchX);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setTouchStart(0);
    }
  };

  // Scroll manual con flechas
  const scrollLeftManual = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ 
        left: isMobile ? -300 : -400, 
        behavior: 'smooth' 
      });
    }
  };

  const scrollRightManual = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ 
        left: isMobile ? 300 : 400, 
        behavior: 'smooth' 
      });
    }
  };

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

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Solo controles esenciales */}
          <IconButton
            onClick={scrollLeftManual}
            size={isMobile ? "medium" : "small"}
            title="Anterior"
            sx={isMobile ? { p: 1 } : {}}
          >
            <ChevronLeft fontSize={isMobile ? "medium" : "small"} />
          </IconButton>

          <IconButton
            onClick={scrollRightManual}
            size={isMobile ? "medium" : "small"}
            title="Siguiente"
            sx={isMobile ? { p: 1 } : {}}
          >
            <ChevronRight fontSize={isMobile ? "medium" : "small"} />
          </IconButton>

         
        </Stack>
      </Box>

      {/* Contenedor de scroll simple */}
      <Box
        ref={scrollContainerRef}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        sx={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          py: isMobile ? 1 : 2,
          px: isMobile ? 0.5 : 1,
          gap: isMobile ? 1.5 : 2,
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": {
            display: "none"
          }
        }}
      >
        {songs.map((song) => (
          <Box
            key={song.id}
            sx={{
              flexShrink: 0,
              width: isMobile ? "220px" : "260px",
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
        ))}
      </Box>

      {/* Información mínima */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        px: isMobile ? 0.5 : 1
      }}>
       
        
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