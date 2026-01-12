import React, { useState, useEffect, useRef } from "react";
import { 
  Box, Container, Typography, Paper, useTheme,
  useMediaQuery, Fade, Alert, Snackbar 
} from "@mui/material";
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";

const MainPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { 
    query,
    setQuery,
    structuredResults = { songs: [], artists: [], genres: [] },
    results = [],
    loading, 
    error, 
    closeResults,
    isOpen: hookIsOpen,
    searchMetrics,
    retrySearch
  } = useSearch();

  const [showResults, setShowResults] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [showCacheNotification, setShowCacheNotification] = useState(false);

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);

  /* -------------------- NOTIFICACIÓN DE CACHÉ -------------------- */
  useEffect(() => {
    if (searchMetrics?.fromCache) {
      setShowCacheNotification(true);
      const timer = setTimeout(() => {
        setShowCacheNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchMetrics]);

  /* -------------------- CONTROL DE RESULTADOS -------------------- */
  useEffect(() => {
    const hasResults =
      structuredResults?.songs?.length > 0 ||
      structuredResults?.artists?.length > 0 ||
      structuredResults?.genres?.length > 0;

    if (hookIsOpen || (hasResults && query.length >= 2)) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [hookIsOpen, structuredResults, query]);

  /* -------------------- CLICK FUERA -------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showResults &&
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target)
      ) {
        handleCloseResults();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showResults]);

  const handleCloseResults = () => {
    setShowResults(false);
    closeResults?.();
  };

  /* -------------------- SELECCIÓN DE CANCIONES (SOLO API) -------------------- */
  const handleSelectResult = (item, type) => {
    console.log('Item seleccionado:', { item, type });
    
    // 🔥 SOLO aceptar canciones con IDs de API válidos
    if (type !== "song" || !item.id || typeof item.id !== 'number') {
      console.log('⚠️ Solo se pueden seleccionar canciones con ID de API válido');
      handleCloseResults();
      return;
    }
    
    // Verificar si ya existe la canción
    const isDuplicate = selectedSongs.some(song => song.id === item.id);
    
    if (isDuplicate) {
      console.log('Canción ya existe en la lista');
      handleCloseResults();
      return;
    }
    
    // Crear objeto de canción simplificado
    const newSong = {
      id: item.id,
      title: item.title || "Sin título",
      artist: item.artist || "Artista desconocido",
      genre: item.genre || "Desconocido",
      duration: item.duration || 180,
      cover: item.cover || null,
      // Mantener compatibilidad con otros componentes
      image_url: item.image_url || null
    };
    
    setSelectedSongs(prev => [newSong, ...prev]);
    console.log('✅ Canción agregada:', newSong);
    
    handleCloseResults();
  };

  /* -------------------- MANEJO DE ERRORES -------------------- */
  const handleRetrySearch = () => {
    if (error && query.trim().length >= 2) {
      retrySearch();
    }
  };

  /* ============================ RENDER ============================ */
  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      pt: { xs: 3, md: 6 },
      pb: 8
    }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant="h1"
            sx={{ 
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 300,
              color: "#1a1a1a",
              fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            djidjimusic
          </Typography>
        </Box>

        {/* BÚSQUEDA */}
        <Box 
          ref={searchBarRef} 
          sx={{ maxWidth: 600, mx: "auto", mb: 8, position: "relative" }}
        >
          <Paper elevation={0} sx={{ borderRadius: "12px", bgcolor: "#fafafa" }}>
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              loading={loading}
              autoFocus={!isMobile}
              placeholder="Buscar canciones..."
            />
          </Paper>

          {/* RESULTADOS */}
          {showResults && (
            <Fade in timeout={200}>
              <Box ref={resultsRef} sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000, mt: 1 }}>
                <SearchResults
                  results={structuredResults}
                  loading={loading}
                  error={error?.message}
                  isOpen={showResults}
                  onClose={handleCloseResults}
                  onSelect={handleSelectResult}
                />
              </Box>
            </Fade>
          )}
        </Box>

        {/* ESTADÍSTICAS */}
        {query.trim().length >= 2 && (
          <Box sx={{ maxWidth: 600, mx: "auto", mb: 4, textAlign: "center" }}>
            {loading && <Typography variant="caption" sx={{ color: "#00838F" }}>Buscando...</Typography>}
            {searchMetrics && !loading && (
              <Typography variant="caption" sx={{ color: "#006064" }}>
                {results.length} resultados • {searchMetrics.time}ms
                {searchMetrics.fromCache && " • (desde caché)"}
              </Typography>
            )}
            {error && (
              <Typography variant="caption" sx={{ color: "#d32f2f", cursor: 'pointer' }} onClick={handleRetrySearch}>
                Error: {error.message} • Click para reintentar
              </Typography>
            )}
          </Box>
        )}

        {/* CANCIONES SELECCIONADAS */}
        {selectedSongs.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "#1a1a1a" }}>
              Canciones Seleccionadas
            </Typography>
            <SongCarousel songs={selectedSongs} />
          </Box>
        )}

        {/* ARTIST CAROUSEL */}
        <Box sx={{ mb: 8 }}>
          <ArtistCarousel />
        </Box>

        {/* POPULAR SONGS */}
        <Box>
          <PopularSongs />
        </Box>

        {/* NOTIFICACIÓN CACHÉ */}
        <Snackbar open={showCacheNotification} autoHideDuration={2000} onClose={() => setShowCacheNotification(false)}>
          <Alert severity="info" sx={{ bgcolor: '#E0F7FA', color: '#006064' }}>
            📦 Resultados desde caché • {searchMetrics?.time}ms
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainPage;