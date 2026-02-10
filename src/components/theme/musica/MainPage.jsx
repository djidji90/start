import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Box, Container, Typography, Paper, useTheme,
  useMediaQuery, Fade, Alert, Snackbar, Grow, IconButton
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";
import RandomSongsDisplay from "../../../components/search/RandomSongsDisplay";

/* -------------------- SISTEMA DE IDENTIDAD POR USUARIO -------------------- */

// Generar o recuperar ID único de usuario
const getOrCreateUserId = () => {
  let userId = localStorage.getItem('djidjimusic_user_id');
  
  if (!userId) {
    // Crear ID único: timestamp + random string + userAgent hash
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const userAgentHash = btoa(navigator.userAgent).substr(0, 8);
    
    userId = `user_${timestamp}_${randomStr}_${userAgentHash}`;
    localStorage.setItem('djidjimusic_user_id', userId);
    
    console.log('✅ Nuevo usuario creado:', userId);
  }
  
  return userId;
};

// Obtener clave única para las canciones del usuario
const getUserSongsKey = (userId) => {
  return `djidjimusic_selected_songs_${userId}`;
};

/* -------------------- COMPONENTE PRINCIPAL -------------------- */

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
  
  // Obtener ID de usuario y clave de almacenamiento
  const [userId] = useState(() => getOrCreateUserId());
  const userSongsKey = getUserSongsKey(userId);
  
  // Cargar canciones seleccionadas DESDE LA CLAVE DEL USUARIO ACTUAL
  const [selectedSongs, setSelectedSongs] = useState(() => {
    try {
      const stored = localStorage.getItem(userSongsKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading songs from localStorage:", error);
      return [];
    }
  });
  
  const [showCacheNotification, setShowCacheNotification] = useState(false);
  const [newlyAddedSong, setNewlyAddedSong] = useState(null);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [currentUserId] = useState(userId); // Guardar userId para referencia

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);
  const selectedSongsRef = useRef(null);

  /* -------------------- PERSISTENCIA EN LOCALSTORAGE -------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(userSongsKey, JSON.stringify(selectedSongs));
      console.log('💾 Canciones guardadas para usuario:', userId);
    } catch (error) {
      console.error("Error saving songs to localStorage:", error);
    }
  }, [selectedSongs, userSongsKey, userId]);

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
  const handleSelectResult = useCallback((item, type) => {
    console.log('Item seleccionado:', { item, type, userId: currentUserId });

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
      addedAt: new Date().toISOString(),
      userId: currentUserId // Registrar qué usuario la añadió
    };

    setSelectedSongs(prev => [newSong, ...prev]);
    setNewlyAddedSong(newSong);
    console.log('✅ Canción agregada para usuario:', currentUserId);

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
  }, [selectedSongs, currentUserId]);

  /* -------------------- ELIMINAR CANCIÓN -------------------- */
  const handleRemoveSong = useCallback((songId) => {
    setSelectedSongs(prev => prev.filter(song => song.id !== songId));
  }, []);

  /* -------------------- ELIMINAR TODAS LAS CANCIONES -------------------- */
  const handleClearAllSongs = useCallback(() => {
    if (selectedSongs.length > 0 && window.confirm(`¿Eliminar todas las ${selectedSongs.length} canciones seleccionadas?`)) {
      setSelectedSongs([]);
    }
  }, [selectedSongs.length]);

  /* -------------------- CAMBIAR DE USUARIO (OPCIONAL) -------------------- */
  const handleSwitchUser = useCallback(() => {
    if (window.confirm("¿Crear un nuevo perfil? Esto creará una lista nueva.")) {
      // Borrar ID actual para forzar creación de uno nuevo
      localStorage.removeItem('djidjimusic_user_id');
      // Recargar la página para generar nuevo usuario
      window.location.reload();
    }
  }, []);

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

      {/* INDICADOR DE USUARIO ACTUAL (OPCIONAL) */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1999,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          color: '#666',
          display: { xs: 'none', sm: 'block' },
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(245, 245, 245, 0.95)'
          }
        }}
        onClick={handleSwitchUser}
        title="Click para cambiar de perfil"
      >
        👤 Perfil {userId.substr(5, 8)}...
      </Box>

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
          <Typography 
            variant="caption" 
            sx={{ 
              display: { xs: 'block', sm: 'none' },
              color: '#666',
              mt: 1
            }}
          >
            Perfil: {userId.substr(5, 6)}...
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

        {/* CANCIONES SELECCIONADAS */}
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
            
            {/* SongCarousel con todas las canciones */}
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