import React, { useState, useEffect, useRef } from "react";
import { 
  Box, Container, Typography, Paper, useTheme,
  useMediaQuery, Fade, Alert, Snackbar, Grow, IconButton
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep"; // Para icono diferente
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";
import RandomSongsDisplay from "../../../components/search/RandomSongsDisplay";

// Clave para localStorage
const SELECTED_SONGS_STORAGE_KEY = "djidjimusic_selected_songs";

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
  // Cargar canciones seleccionadas desde localStorage al iniciar
  const [selectedSongs, setSelectedSongs] = useState(() => {
    try {
      const stored = localStorage.getItem(SELECTED_SONGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading songs from localStorage:", error);
      return [];
    }
  });
  const [showCacheNotification, setShowCacheNotification] = useState(false);
  const [newlyAddedSong, setNewlyAddedSong] = useState(null);
  const [showAddNotification, setShowAddNotification] = useState(false);

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);
  const selectedSongsRef = useRef(null);

  /* -------------------- PERSISTENCIA EN LOCALSTORAGE -------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_SONGS_STORAGE_KEY, JSON.stringify(selectedSongs));
    } catch (error) {
      console.error("Error saving songs to localStorage:", error);
    }
  }, [selectedSongs]);

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

  /* -------------------- NOTIFICACIÓN AL AÑADIR CANCIÓN -------------------- */
  useEffect(() => {
    if (newlyAddedSong) {
      setShowAddNotification(true);
      const timer = setTimeout(() => {
        setShowAddNotification(false);
        setNewlyAddedSong(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedSong]);

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

  /* -------------------- SELECCIÓN DE CANCIONES -------------------- */
  const handleSelectResult = (item, type) => {
    console.log('Item seleccionado:', { item, type });

    if (type !== "song" || !item.id) {
      console.log('⚠️ Solo se pueden seleccionar canciones con ID válido');
      handleCloseResults();
      return;
    }

    const isDuplicate = selectedSongs.some(song => song.id === item.id);

    if (isDuplicate) {
      console.log('Canción ya existe en la lista');
      handleCloseResults();
      return;
    }

    const newSong = {
      id: item.id,
      title: item.title || "Sin título",
      artist: item.artist || "Artista desconocido",
      genre: item.genre || "Desconocido",
      duration: item.duration || 180,
      cover: item.cover || null,
      image_url: item.image_url || null,
      addedAt: new Date().toISOString()
    };

    setSelectedSongs(prev => [newSong, ...prev]);
    setNewlyAddedSong(newSong); // Para mostrar notificación
    console.log('✅ Canción agregada:', newSong);

    // Scroll suave a la lista de canciones seleccionadas
    setTimeout(() => {
      if (selectedSongsRef.current) {
        selectedSongsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);

    handleCloseResults();
  };

  /* -------------------- ELIMINAR CANCIÓN -------------------- */
  const handleRemoveSong = (songId) => {
    setSelectedSongs(prev => prev.filter(song => song.id !== songId));
  };

  /* -------------------- ELIMINAR TODAS LAS CANCIONES -------------------- */
  const handleClearAllSongs = () => {
    if (selectedSongs.length > 0 && window.confirm(`¿Eliminar todas las ${selectedSongs.length} canciones seleccionadas?`)) {
      setSelectedSongs([]);
    }
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
      backgroundColor: "#ffffff",
      pt: { xs: 2, md: 4 },
      pb: 4
    }}>
      {/* CONTADOR FLOTANTE */}
      {selectedSongs.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#1976d2',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)',
            cursor: 'pointer',
            transition: 'transform 0.2s, background-color 0.2s',
            '&:hover': {
              backgroundColor: '#1565c0',
              transform: 'scale(1.05)'
            }
          }}
          onClick={() => {
            if (selectedSongsRef.current) {
              selectedSongsRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          }}
          title={`${selectedSongs.length} canción(es) seleccionada(s)`}
        >
          {selectedSongs.length}
        </Box>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 1.5, md: 3 } }}>
        {/* HEADER */}
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant="h1"
            sx={{ 
              fontSize: { xs: "2rem", md: "3rem" },
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
          sx={{ maxWidth: 600, mx: "auto", mb: 6, position: "relative" }}
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
          <Box sx={{ maxWidth: 600, mx: "auto", mb: 3, textAlign: "center" }}>
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

        {/* CANCIONES SELECCIONADAS - VERSIÓN CORREGIDA */}
        {selectedSongs.length > 0 && (
          <Box ref={selectedSongsRef} sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                Canciones Seleccionadas ({selectedSongs.length})
              </Typography>
              <IconButton 
                onClick={handleClearAllSongs}
                size="small"
                sx={{ 
                  color: "#d32f2f",
                  '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' }
                }}
                title="Eliminar todas las canciones"
              >
                <DeleteSweepIcon />
              </IconButton>
            </Box>
            
            {/* ✅ UN SOLO SongCarousel con TODAS las canciones */}
            <Grow in={true} timeout={500}>
              <Box>
                <SongCarousel 
                  songs={selectedSongs} 
                  title=""
                  onRemoveSong={handleRemoveSong}
                  showRemoveButton={true}
                />
              </Box>
            </Grow>
          </Box>
        )}

        {/* RANDOM SONGS DISPLAY */}
        <Box sx={{ mb: 6 }}>
          <RandomSongsDisplay />
        </Box>

        {/* ARTIST CAROUSEL */}
        <Box sx={{ mb: 6 }}>
          <ArtistCarousel />
        </Box>

        {/* POPULAR SONGS */}
        <Box>
          <PopularSongs />
        </Box>

        {/* NOTIFICACIÓN CACHÉ */}
        <Snackbar 
          open={showCacheNotification} 
          autoHideDuration={2000} 
          onClose={() => setShowCacheNotification(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="info" sx={{ bgcolor: '#E0F7FA', color: '#006064' }}>
            📦 Resultados desde caché • {searchMetrics?.time}ms
          </Alert>
        </Snackbar>

        {/* NOTIFICACIÓN AL AÑADIR CANCIÓN */}
        <Snackbar
          open={showAddNotification}
          autoHideDuration={1500}
          onClose={() => setShowAddNotification(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="success" 
            sx={{ 
              bgcolor: '#E8F5E9', 
              color: '#2E7D32',
              '& .MuiAlert-icon': { color: '#4CAF50' }
            }}
          >
            ✅ Añadido: <strong>{newlyAddedSong?.title}</strong> de {newlyAddedSong?.artist}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainPage;