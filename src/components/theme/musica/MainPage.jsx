import React, { useState, useEffect, useRef } from "react";
import { 
  Box, Container, Typography, Paper, useTheme,
  useMediaQuery, Fade, Alert, Snackbar, Grow, IconButton, alpha
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";
import RandomSongsDisplay from "../../../components/search/RandomSongsDisplay";
import { motion } from "framer-motion";

// ============================================
// 🎨 IDENTIDAD VISUAL (MISMO COLOR, SIN ROMPER)
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  textDark: '#1a1a1a',
  gray600: '#666666',
  gray100: '#fafafa',
  gray200: '#e0e0e0'
};

// Clave para localStorage
const SELECTED_SONGS_STORAGE_KEY = "djidjimusic_selected_songs";

// ============================================
// 🎵 FRASES DE IDENTIDAD (SOLO TEXTO, SIN COMPLEJIDAD)
// ============================================
const frasesIdentidad = [
  "Malabo na wi yon.",
  "El sonido es nuestro.",
  "Chunks de barrio.",
  "Desde el barrio pa'l mundo.",
  "Bata suena así.",
  "Esto es nuestro."
];

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
  const [selectedSongs, setSelectedSongs] = useState(() => {
    try {
      const stored = localStorage.getItem(SELECTED_SONGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading songs:", error);
      return [];
    }
  });
  const [showCacheNotification, setShowCacheNotification] = useState(false);
  const [newlyAddedSong, setNewlyAddedSong] = useState(null);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [fraseIndex, setFraseIndex] = useState(0);

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);
  const selectedSongsRef = useRef(null);

  // ========================================
  // 🕒 ROTACIÓN DE FRASES (CADA 6s)
  // ========================================
  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIndex(prev => (prev + 1) % frasesIdentidad.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------- PERSISTENCIA -------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_SONGS_STORAGE_KEY, JSON.stringify(selectedSongs));
    } catch (error) {
      console.error("Error saving songs:", error);
    }
  }, [selectedSongs]);

  /* -------------------- NOTIFICACIÓN DE CACHÉ -------------------- */
  useEffect(() => {
    if (searchMetrics?.fromCache) {
      setShowCacheNotification(true);
      const timer = setTimeout(() => setShowCacheNotification(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchMetrics]);

  /* -------------------- NOTIFICACIÓN AL AÑADIR -------------------- */
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showResults]);

  const handleCloseResults = () => {
    setShowResults(false);
    closeResults?.();
  };

  /* -------------------- SELECCIÓN DE CANCIONES -------------------- */
  const handleSelectResult = (item, type) => {
    if (type !== "song" || !item.id) {
      handleCloseResults();
      return;
    }

    if (selectedSongs.some(song => song.id === item.id)) {
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
    setNewlyAddedSong(newSong);

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

  const handleRemoveSong = (songId) => {
    setSelectedSongs(prev => prev.filter(song => song.id !== songId));
  };

  const handleClearAllSongs = () => {
    if (selectedSongs.length > 0 && window.confirm(`¿Eliminar todas las ${selectedSongs.length} canciones seleccionadas?`)) {
      setSelectedSongs([]);
    }
  };

  const handleRetrySearch = () => {
    if (error && query.trim().length >= 2) retrySearch();
  };

  return (
    <Box sx={{
      backgroundColor: "#ffffff",
      pt: { xs: 2, md: 4 },
      pb: 4,
      minHeight: "100vh"
    }}>
      {/* ========== CONTADOR FLOTANTE ========== */}
      {selectedSongs.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 60,
            right: 16,
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: 700,
            boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 6px 16px ${alpha(colors.primary, 0.4)}`
            }
          }}
          onClick={() => selectedSongsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          title={`${selectedSongs.length} canción(es) seleccionada(s)`}
        >
          <MusicNoteIcon sx={{ fontSize: 18, mr: 0.5 }} />
          {selectedSongs.length}
        </Box>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 1.5, md: 3 } }}>
        
        {/* ========== HEADER CON IDENTIDAD ========== */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          
          {/* TÍTULO CON GRADIENTE SUTIL */}
          <Typography 
            variant="h1"
            sx={{ 
              fontSize: { xs: "2.2rem", md: "3.2rem" },
              fontWeight: 700,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              mb: 1.5,
              letterSpacing: '-0.5px'
            }}
          >
            djidjimusic
          </Typography>

          {/* FRASE ROTATIVA - IDENTIDAD PURA */}
          <Fade in key={fraseIndex} timeout={500}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: colors.primary, 
                fontWeight: 500, 
                fontStyle: "italic",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                mb: 1
              }}
            >
              “{frasesIdentidad[fraseIndex]}”
            </Typography>
          </Fade>

          {/* MENSAJE SUTIL DE PERTENENCIA */}
          <Typography 
            variant="caption" 
            sx={{ 
              color: alpha(colors.primary, 0.7),
              display: 'block',
              fontSize: '0.85rem',
              letterSpacing: 1
            }}
          >
           
          </Typography>
        </Box>

        {/* ========== BÚSQUEDA ========== */}
        <Box 
          ref={searchBarRef} 
          sx={{ maxWidth: 600, mx: "auto", mb: 4, position: "relative" }}
        >
          <Paper elevation={0} sx={{ 
            borderRadius: "12px", 
            bgcolor: colors.gray100,
            border: `1px solid ${colors.gray200}`,
            '&:focus-within': {
              borderColor: colors.primary,
              boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`
            }
          }}>
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              loading={loading}
              autoFocus={!isMobile}
              placeholder="Buscar canciones, artistas..."
            />
          </Paper>

          {/* RESULTADOS */}
          {showResults && (
            <Fade in timeout={200}>
              <Box ref={resultsRef} sx={{ 
                position: "absolute", 
                top: "100%", 
                left: 0, 
                right: 0, 
                zIndex: 1400, 
                mt: 1 
              }}>
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

          {/* LLAMADO SUTIL */}
          {!query && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1.5, 
                color: colors.gray600,
                fontStyle: 'italic'
              }}
            >
              🎧 Busca y empieza a disfrutar
            </Typography>
          )}
        </Box>

        {/* ========== CANCIONES SELECCIONADAS ========== */}
        {selectedSongs.length > 0 && (
          <Box ref={selectedSongsRef} sx={{ mb: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              borderBottom: `2px solid ${alpha(colors.primary, 0.2)}`,
              pb: 1
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: colors.textDark,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <MusicNoteIcon sx={{ color: colors.primary }} />
                TUS BEATS ({selectedSongs.length})
              </Typography>
              <IconButton 
                onClick={handleClearAllSongs}
                size="small"
                sx={{ 
                  color: colors.gray600,
                  '&:hover': { color: colors.primary }
                }}
                title="Eliminar todas"
              >
                <DeleteSweepIcon />
              </IconButton>
            </Box>

            <Grow in timeout={500}>
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

        {/* SEPARADOR CON IDENTIDAD */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1.5,
          my: 4 
        }}>
          <Box sx={{ 
            width: '40px', 
            height: '2px', 
            background: `linear-gradient(90deg, ${colors.primary}, ${alpha(colors.primary, 0.3)})`,
            borderRadius: '2px'
          }} />
          <Typography sx={{ color: alpha(colors.primary, 0.5), fontSize: '1.1rem' }}>♫</Typography>
          <Box sx={{ 
            width: '40px', 
            height: '2px', 
            background: `linear-gradient(90deg, ${alpha(colors.primary, 0.3)}, ${colors.primary})`,
            borderRadius: '2px'
          }} />
        </Box>

        {/* ========== SECCIONES DE CONTENIDO ========== */}
        <Box sx={{ mb: 6 }}>
          <RandomSongsDisplay />
        </Box>

        <Box sx={{ mb: 6 }}>
          <ArtistCarousel />
        </Box>

        <Box sx={{ mb: 6 }}>
          <PopularSongs />
        </Box>

        {/* ========== FOOTER IDENTITARIO ========== */}
        <Box sx={{ 
          mt: 6, 
          pt: 4, 
          pb: 2, 
          textAlign: 'center',
          borderTop: `1px solid ${alpha(colors.primary, 0.1)}`
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.gray600,
              fontWeight: 400,
              fontStyle: 'italic'
            }}
          >
            
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: alpha(colors.gray600, 0.6),
              display: 'block',
              mt: 1,
              letterSpacing: 1
            }}
          >
            EL SONIDO ES NUESTRO
          </Typography>
        </Box>

        {/* ========== NOTIFICACIONES ========== */}
        <Snackbar 
          open={showCacheNotification} 
          autoHideDuration={2000} 
          onClose={() => setShowCacheNotification(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="info" 
            sx={{ 
              bgcolor: alpha(colors.primary, 0.08), 
              color: colors.primary,
              border: `1px solid ${alpha(colors.primary, 0.2)}`
            }}
          >
            📦 Resultados desde caché • {searchMetrics?.time}ms
          </Alert>
        </Snackbar>

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
            ✅ Añadido: <strong>{newlyAddedSong?.title}</strong> · {newlyAddedSong?.artist}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainPage;