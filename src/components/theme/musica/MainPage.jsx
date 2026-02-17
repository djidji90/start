import React, { useState, useEffect, useRef } from "react";
import {
  Box, Container, Typography, Paper, useTheme,
  useMediaQuery, Fade, Alert, Snackbar, Grow, IconButton, alpha
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";
import RandomSongsDisplay from "../../../components/search/RandomSongsDisplay";

// ============================================
// 🎨 IDENTIDAD VISUAL
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  textDark: '#1a1a1a',
  textLight: '#FFFFFF',
  gray600: '#666666',
  gray500: '#9E9E9E',
  gray400: '#BDBDBD',
  gray300: '#E0E0E0',
  gray200: '#e0e0e0',
  gray100: '#fafafa',
};

// ============================================
// 🎵 HERO SECTION CON MEJORAS
// ============================================
const Hero = ({ 
  query, 
  setQuery, 
  loading, 
  showResults, 
  setShowResults,
  resultsRef, 
  searchBarRef, 
  structuredResults, 
  error, 
  handleSelectResult,
  closeResults
}) => {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: "80vh", md: "85vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        overflow: "hidden",
        mb: 4
      }}
    >
      {/* Background Image */}
      <Box sx={{ position: "absolute", inset: 0 }}>
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1518441902118-28a28c9c1e4b?auto=format&fit=crop&w=1600&q=80"
          alt="Auriculares sobre mesa de estudio musical"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
        <Box sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)"
        }} />
      </Box>

      {/* Content */}
      <Box sx={{
        position: "relative",
        zIndex: 10,
        maxWidth: "900px",
        textAlign: "center",
        px: 3,
        width: "100%"
      }}>
        
        {/* MARCA VISIBLE */}
        <Typography
          variant="h6"
          sx={{
            color: alpha(colors.primary, 0.9),
            fontWeight: 700,
            letterSpacing: "4px",
            textTransform: "uppercase",
            mb: 2,
            fontSize: "0.9rem"
          }}
        >
        
        </Typography>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.2rem", md: "3.8rem" },
            fontWeight: 800,
            lineHeight: 1.2,
            mb: 2,
            color: "white"
          }}
        >
          La casa de la{' '}
          <Box component="span" sx={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            música urbana
          </Box>{' '}
          de Guinea ecuatorial.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1rem", md: "1.2rem" },
            color: "rgba(255,255,255,0.8)",
            mb: 4,
            maxWidth: "650px",
            mx: "auto"
          }}
        >
          Escucha, descubre y apoya a los artistas que estan marcando la diferecia.
          Sube tu música, construye tu audiencia y forma parte del movimiento.
        </Typography>

        {/* CTA Buttons con React Router */}
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          mb: 4
        }}>
          <Box
            component="button"
            onClick={() => navigate("")}
            sx={{
              bgcolor: colors.primary,
              color: "white",
              border: "none",
              px: 5,
              py: 2,
              borderRadius: "16px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
              "&:hover": {
                bgcolor: colors.primaryDark,
                transform: "translateY(-2px)",
                boxShadow: `0 8px 20px ${alpha(colors.primary, 0.4)}`
              }
            }}
          >
            🎧 Explorar música
          </Box>

          <Box
            component="button"
            onClick={() => navigate("")}
            sx={{
              bgcolor: "white",
              color: colors.textDark,
              border: "none",
              px: 5,
              py: 2,
              borderRadius: "16px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
              }
            }}
          >
            🎤 Subir mi música
          </Box>
        </Box>

        {/* SEARCHBAR INTEGRADO EN HERO (DEBAJO DE LOS BOTONES) */}
        <Box
          ref={searchBarRef}
          sx={{
            maxWidth: "600px",
            mx: "auto",
            mb: 4,
            width: "100%",
            position: "relative"
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              bgcolor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              '&:focus-within': {
                borderColor: colors.primary,
                boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.3)}`,
              },
              transition: 'all 0.2s ease'
            }}
          >
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              loading={loading}
              autoFocus={false}
              placeholder="Busca artistas, canciones..."
              sx={{
                input: { color: "white" },
                '& .MuiInputBase-input::placeholder': {
                  color: "rgba(255,255,255,0.5)"
                }
              }}
            />
          </Paper>

          {/* Resultados de búsqueda */}
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
                  onClose={() => {
                    setShowResults(false);
                    closeResults?.();
                  }}
                  onSelect={handleSelectResult}
                />
              </Box>
            </Fade>
          )}
        </Box>

        {/* Social Proof */}
        <Typography
          sx={{
            mt: 2,
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "2px"
          }}
        >
          para toda mi gente
        </Typography>
      </Box>
    </Box>
  );
};

// ============================================
// 🎵 MAIN PAGE COMPLETA
// ============================================
const MainPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    query,
    setQuery,
    structuredResults = { songs: [], artists: [], genres: [] },
    loading,
    error,
    closeResults,
    isOpen: hookIsOpen,
    searchMetrics
  } = useSearch();

  const [showResults, setShowResults] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState(() => {
    try {
      const stored = localStorage.getItem("djidjimusic_selected_songs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showCacheNotification, setShowCacheNotification] = useState(false);
  const [newlyAddedSong, setNewlyAddedSong] = useState(null);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [showLimitNotification, setShowLimitNotification] = useState(false);

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);
  const selectedSongsRef = useRef(null);

  const MAX_SELECTED_SONGS = 50;

  // Persistencia
  useEffect(() => {
    localStorage.setItem("djidjimusic_selected_songs", JSON.stringify(selectedSongs));
  }, [selectedSongs]);

  // Notificaciones
  useEffect(() => {
    if (searchMetrics?.fromCache) {
      setShowCacheNotification(true);
      setTimeout(() => setShowCacheNotification(false), 2000);
    }
  }, [searchMetrics]);

  useEffect(() => {
    if (newlyAddedSong) {
      setShowAddNotification(true);
      setTimeout(() => {
        setShowAddNotification(false);
        setNewlyAddedSong(null);
      }, 1500);
    }
  }, [newlyAddedSong]);

  // Control de resultados
  useEffect(() => {
    const hasResults =
      structuredResults?.songs?.length > 0 ||
      structuredResults?.artists?.length > 0 ||
      structuredResults?.genres?.length > 0;

    setShowResults(hookIsOpen || (hasResults && query.length >= 2));
  }, [hookIsOpen, structuredResults, query]);

  // Click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showResults &&
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target)
      ) {
        setShowResults(false);
        closeResults?.();
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [showResults, closeResults]);

  const handleSelectResult = (item, type) => {
    if (type !== "song" || !item?.id) {
      setShowResults(false);
      closeResults?.();
      return;
    }

    const songId = String(item.id);

    if (selectedSongs.some(song => String(song.id) === songId)) {
      setShowResults(false);
      closeResults?.();
      return;
    }

    if (selectedSongs.length >= MAX_SELECTED_SONGS) {
      setShowLimitNotification(true);
      setTimeout(() => setShowLimitNotification(false), 2000);
      setShowResults(false);
      closeResults?.();
      return;
    }

    const newSong = {
      id: songId,
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
        selectedSongsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    setShowResults(false);
    closeResults?.();
  };

  const handleRemoveSong = (songId) => {
    setSelectedSongs(prev => prev.filter(song => String(song.id) !== String(songId)));
  };

  const handleClearAllSongs = () => {
    if (selectedSongs.length > 0 && window.confirm(`🗑️ Eliminar todas las ${selectedSongs.length} canciones?`)) {
      setSelectedSongs([]);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* HERO con todas las mejoras */}
      <Hero 
        query={query}
        setQuery={setQuery}
        loading={loading}
        showResults={showResults}
        setShowResults={setShowResults}
        resultsRef={resultsRef}
        searchBarRef={searchBarRef}
        structuredResults={structuredResults}
        error={error}
        handleSelectResult={handleSelectResult}
        closeResults={closeResults}
      />

      <Container maxWidth="lg" sx={{ px: { xs: 1.5, md: 3 } }}>
        {/* CONTADOR FLOTANTE */}
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

        {/* CANCIONES SELECCIONADAS */}
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
                sx={{ color: colors.gray600, '&:hover': { color: colors.primary } }}
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

        {/* SEPARADOR */}
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

        {/* SECCIONES DE CONTENIDO */}
        <Box sx={{ mb: 6 }}>
          <RandomSongsDisplay />
        </Box>

        <Box sx={{ mb: 6 }}>
          <ArtistCarousel />
        </Box>

        <Box sx={{ mb: 6 }}>
          <PopularSongs />
        </Box>

        {/* FOOTER */}
        <Box sx={{
          mt: 6,
          pt: 4,
          pb: 2,
          textAlign: 'center',
          borderTop: `1px solid ${alpha(colors.primary, 0.1)}`
        }}>
          <Typography variant="body2" sx={{ color: colors.gray600, fontWeight: 400 }}>
            djidjimusic · El sonido del barrio
          </Typography>
          <Typography variant="caption" sx={{ color: alpha(colors.gray600, 0.6), display: 'block', mt: 1 }}>
            MALABO • BATA • GUINEA ECUATORIAL
          </Typography>
        </Box>

        {/* NOTIFICACIONES */}
        <Snackbar open={showCacheNotification} autoHideDuration={2000} onClose={() => setShowCacheNotification(false)}>
          <Alert severity="info" sx={{ bgcolor: alpha(colors.primary, 0.08), color: colors.primary }}>
            📦 Resultados desde caché • {searchMetrics?.time}ms
          </Alert>
        </Snackbar>

        <Snackbar open={showLimitNotification} autoHideDuration={2000} onClose={() => setShowLimitNotification(false)}>
          <Alert severity="warning" sx={{ bgcolor: '#FFF3E0', color: '#E65100' }}>
            🎵 Máximo {MAX_SELECTED_SONGS} canciones
          </Alert>
        </Snackbar>

        <Snackbar open={showAddNotification} autoHideDuration={1500} onClose={() => setShowAddNotification(false)}>
          <Alert severity="success" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}>
            ✅ Añadido: {newlyAddedSong?.title}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainPage;