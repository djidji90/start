// src/MainPage.jsx - VERSIÓN CORREGIDA
import React, { useState, useEffect, useRef } from "react";
import { 
  Box, Container, Typography, Paper,
  useTheme, useMediaQuery, Fade, Alert, Snackbar,
  CircularProgress
} from "@mui/material";
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";
import RandomSongsDisplay from "../../../components/search/RandomSongsDisplay";
import EventsCircularGrid from "../../../Paginas/EventsCircularGrid"; 
import useEvents from "../../../components/hook/services/useEvents";

// Importar el botón de upload
import UploadButton from "../../../upload/UploadButton";

const MainPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

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

  // Hook de eventos
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    toggleSaveEvent,
    updateFilters: updateEventsFilters,
    fetchEvents
  } = useEvents({
    pageSize: 9,
    filters: {
      status: 'upcoming',
      ordering: 'date',
    }
  });

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

  const handleSelectResult = (item, type) => {
    if (type !== "song" || !item.id || typeof item.id !== 'number') {
      handleCloseResults();
      return;
    }

    const isDuplicate = selectedSongs.some(song => song.id === item.id);
    if (isDuplicate) {
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
      image_url: item.image_url || null
    };

    setSelectedSongs(prev => [newSong, ...prev]);
    handleCloseResults();
  };

  // Funciones para eventos
  const handleEventSave = async (eventId, save) => {
    try {
      await toggleSaveEvent(eventId, save);
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };

  const handleEventFilterChange = (filter) => {
    updateEventsFilters({
      event_type: filter === 'all' ? '' : filter,
    });
  };

  /* ============================ RENDER ============================ */
  return (
    <Box sx={{
      backgroundColor: "#ffffff",
      minHeight: "100vh",
      pt: { xs: 2, md: 4 },
      pb: 4
    }}>
      {/* ELIMINADO: AppBar fija para el botón de upload */}
      {/* ELIMINADO: Espacio para la AppBar */}

      <Container maxWidth="lg" sx={{ px: { xs: 1.5, md: 3 } }}>
        {/* HEADER CON BOTÓN DE UPLOAD INTEGRADO */}
        <Box sx={{ 
          textAlign: "center", 
          mb: 3, 
          mt: 2,
          position: 'relative'
        }}>
          {/* Botón de Upload flotante a la derecha */}
          <Box sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            display: { xs: 'none', md: 'block' }
          }}>
            <UploadButton />
          </Box>
          
          <Typography 
            variant="h1"
            sx={{ 
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 300,
              color: "#1a1a1a",
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
            {loading && <Typography variant="caption">Buscando...</Typography>}
            {searchMetrics && !loading && (
              <Typography variant="caption">
                {results.length} resultados • {searchMetrics.time}ms
                {searchMetrics.fromCache && " • (desde caché)"}
              </Typography>
            )}
          </Box>
        )}

        {/* CANCIONES SELECCIONADAS */}
        {selectedSongs.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Canciones Seleccionadas
            </Typography>
            <SongCarousel songs={selectedSongs} />
          </Box>
        )}

        {/* RANDOM SONGS DISPLAY */}
        <Box sx={{ mb: 6 }}>
          <RandomSongsDisplay />
        </Box>

        {/* SECCIÓN DE EVENTOS */}
        <Box sx={{ mb: 6 }}>
          <EventsCircularGrid
            events={events}
            loading={eventsLoading}
            error={eventsError}
            title=""
            subtitle="noticias y evenntos relacionados con tus artistas favoritos"
            onEventSave={handleEventSave}
            showFilters={true}
            filters={['festivales', 'conciertos', 'noticias', 'malabosa']}
            onFilterChange={handleEventFilterChange}
            itemsPerPage={9}
            cardSize={isMobile ? 220 : isTablet ? 260 : 280}
            gridColumns={isMobile ? 1 : isTablet ? 2 : 3}
          />
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="info" icon={false}>
            📦 Resultados desde caché • {searchMetrics?.time}ms
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainPage;