import React, { useState, useEffect, useRef } from "react";
import { 
  Box, Container, Typography, Paper, useTheme,
  useMediaQuery, Fade, Alert, Snackbar, Grow, IconButton, alpha, styled
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
import '@fontsource-variable/inter';

// ============================================
// 🎨 CONFIGURACIÓN DE MARCA
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  secondary: '#2D3047',
  textDark: '#2D3047',
  textLight: '#FFFFFF',
  gray100: '#F5F7FA',
  gray200: '#E4E7EB',
  gray600: '#7B8794',
  gray800: '#3E4C59',
};

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontFamily: "'Inter Variable', sans-serif",
}));

// ============================================
// 🎵 FRASES DE IDENTIDAD
// ============================================
const frasesIdentidad = [
  "Malabo na wi yon.",
  "El sonido es nuestro.",
  "Chunks de barrio.",
  "Ñumbili está en la base.",
  "Desde el barrio pa'l mundo.",
  "Bata suena así.",
  "Annobón también existe.",
  "Flow de aquí, sin copia.",
  "La calle tiene ritmo.",
  "Esto es nuestro."
];

// ============================================
// 🚀 COMPONENTE PRINCIPAL
// ============================================
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
      const stored = localStorage.getItem("djidjimusic_selected_songs");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  });
  const [showCacheNotification, setShowCacheNotification] = useState(false);
  const [newlyAddedSong, setNewlyAddedSong] = useState(null);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [fraseIndex, setFraseIndex] = useState(0);
  const [openClearDialog, setOpenClearDialog] = useState(false);

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);
  const selectedSongsRef = useRef(null);

  // ========================================
  // 🕒 ROTACIÓN DE FRASES (6s)
  // ========================================
  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIndex(prev => (prev + 1) % frasesIdentidad.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // ========================================
  // 💾 PERSISTENCIA EN LOCALSTORAGE
  // ========================================
  useEffect(() => {
    try {
      localStorage.setItem("djidjimusic_selected_songs", JSON.stringify(selectedSongs));
    } catch (error) {
      console.error("Error saving songs:", error);
    }
  }, [selectedSongs]);

  // ========================================
  // 🔔 NOTIFICACIÓN DE CACHÉ
  // ========================================
  useEffect(() => {
    if (searchMetrics?.fromCache) {
      setShowCacheNotification(true);
      const timer = setTimeout(() => setShowCacheNotification(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchMetrics]);

  // ========================================
  // 🔔 NOTIFICACIÓN DE CANCIÓN AÑADIDA
  // ========================================
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

  // ========================================
  // 🔍 CONTROL DE RESULTADOS
  // ========================================
  useEffect(() => {
    const hasResults =
      structuredResults?.songs?.length > 0 ||
      structuredResults?.artists?.length > 0 ||
      structuredResults?.genres?.length > 0;

    setShowResults(hookIsOpen || (hasResults && query.length >= 2));
  }, [hookIsOpen, structuredResults, query]);

  // ========================================
  // 👆 CLICK FUERA DE RESULTADOS
  // ========================================
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

  // ========================================
  // 🎵 SELECCIÓN DE CANCIONES
  // ========================================
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
      selectedSongsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);

    handleCloseResults();
  };

  const handleRemoveSong = (songId) => {
    setSelectedSongs(prev => prev.filter(song => song.id !== songId));
  };

  const handleClearAllSongs = () => {
    setOpenClearDialog(true);
  };

  const confirmClearAll = () => {
    setSelectedSongs([]);
    setOpenClearDialog(false);
  };

  const handleRetrySearch = () => {
    if (error && query.trim().length >= 2) retrySearch();
  };

  // Destino fijo
  const destinoHoy = "Malabo";

  return (
    <Box sx={{
      backgroundColor: "#ffffff",
      minHeight: "100vh",
      position: "relative"
    }}>
      {/* ========== CONTADOR FLOTANTE ========== */}
      {selectedSongs.length > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 60,
              right: 16,
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              minWidth: 40,
              height: 40,
              px: selectedSongs.length > 99 ? 1.5 : 1,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 700,
              boxShadow: `0 6px 16px ${alpha(colors.primary, 0.4)}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 8px 20px ${alpha(colors.primary, 0.5)}`,
              }
            }}
            onClick={() => selectedSongsRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            })}
            title={`${selectedSongs.length} beat(s) seleccionado(s)`}
          >
            <MusicNoteIcon sx={{ fontSize: 18 }} />
            {selectedSongs.length}
          </Box>
        </motion.div>
      )}

      <Container maxWidth="lg" sx={{ px: { xs: 1.5, md: 3 }, py: 4 }}>
        
        {/* ========== HEADER ========== */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: 1.5, 
            mb: 1.5 
          }}>
            <motion.div
              animate={{ 
                rotate: [-3, 3, -3],
                y: [0, -2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <Typography sx={{ fontSize: { xs: "36px", md: "48px" } }}>
                🚀
              </Typography>
            </motion.div>
            
            <GradientText
              variant="h1"
              sx={{ 
                fontSize: { xs: "2.4rem", md: "3.5rem" },
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              djidjimusic
            </GradientText>
          </Box>

          <Fade in={true} key={fraseIndex} timeout={500}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: colors.primary, 
                fontWeight: 600, 
                fontStyle: "italic",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                textShadow: `0 2px 8px ${alpha(colors.primary, 0.2)}`,
              }}
            >
              “{frasesIdentidad[fraseIndex]}”
            </Typography>
          </Fade>

          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: colors.gray600, 
              mt: 1.5,
              fontSize: { xs: "0.95rem", md: "1.1rem" },
            }}
          >
            <span style={{ color: colors.primary, fontWeight: 600 }}>Hoy suena como en {destinoHoy}</span>
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
              boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
            }
          }}>
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              loading={loading}
              autoFocus={!isMobile}
              placeholder="Busca canciones, artistas..."
            />
          </Paper>

          {!query && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1, 
                color: colors.gray600,
                fontStyle: 'italic'
              }}
            >
              🎧 Empieza tu sesión — Busca una canción
            </Typography>
          )}

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
        </Box>

        {/* ========== SECCIÓN: TUS BEATS ========== */}
        {selectedSongs.length > 0 ? (
          <Box ref={selectedSongsRef} sx={{ mb: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              borderLeft: `4px solid ${colors.primary}`,
              pl: 2
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: colors.textDark,
              }}>
                🎛️ TUS BEATS ({selectedSongs.length})
              </Typography>
              <IconButton 
                onClick={handleClearAllSongs}
                size="small"
                sx={{ 
                  color: colors.gray600,
                  '&:hover': { 
                    color: colors.primary,
                    backgroundColor: alpha(colors.primary, 0.04)
                  }
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
                  onRemoveSong={handleRemoveSong}
                  showRemoveButton
                />
              </Box>
            </Grow>
          </Box>
        ) : (
          <Box sx={{ 
            mb: 6, 
            p: 4, 
            textAlign: 'center',
            bgcolor: alpha(colors.gray100, 0.5),
            borderRadius: 4,
            border: `1px dashed ${colors.gray200}`
          }}>
            <Typography sx={{ fontSize: '48px', mb: 2, opacity: 0.5 }}>📀</Typography>
            <Typography variant="h6" sx={{ color: colors.gray600, fontWeight: 500 }}>
              Aún no tienes beats
            </Typography>
            <Typography variant="body2" sx={{ color: colors.gray600, mt: 1 }}>
              Busca canciones y empieza tu sesión
            </Typography>
          </Box>
        )}

        {/* ========== SEPARADOR ========== */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          my: 5 
        }}>
          <Box sx={{ 
            width: '30px', 
            height: '2px', 
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
            borderRadius: '2px'
          }} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Typography sx={{ color: alpha(colors.primary, 0.4), fontSize: '1.2rem' }}>♪</Typography>
            <Typography sx={{ color: alpha(colors.primary, 0.6), fontSize: '1.4rem' }}>♫</Typography>
            <Typography sx={{ color: alpha(colors.primary, 0.4), fontSize: '1.2rem' }}>♪</Typography>
          </Box>
          <Box sx={{ 
            width: '30px', 
            height: '2px', 
            background: `linear-gradient(90deg, ${colors.primaryLight}, ${colors.primary})`,
            borderRadius: '2px'
          }} />
        </Box>

        {/* ========== SECCIONES DE CONTENIDO ========== */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: colors.textDark,
              borderLeft: `4px solid ${colors.primary}`,
              pl: 2,
              mb: 3
            }}
          >
            🎲 DESCUBRE SONIDOS
          </Typography>
          <RandomSongsDisplay />
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: colors.textDark,
              borderLeft: `4px solid ${colors.primary}`,
              pl: 2,
              mb: 3
            }}
          >
            🇬🇶 LOS NUESTROS
          </Typography>
          <ArtistCarousel />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: colors.textDark,
              borderLeft: `4px solid ${colors.primary}`,
              pl: 2,
              mb: 3
            }}
          >
            🔥 LO QUE SUENA
          </Typography>
          <PopularSongs />
        </Box>

        {/* ========== FOOTER ========== */}
        <Box sx={{ 
          mt: 8, 
          pt: 4, 
          pb: 2, 
          textAlign: 'center',
          borderTop: `1px solid ${alpha(colors.primary, 0.1)}`
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.gray600,
              fontWeight: 500
            }}
          >
            Hecho en Guinea Ecuatorial · pa'l mundo entero 🇬🇶
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: alpha(colors.gray600, 0.7),
              display: 'block',
              mt: 1,
              letterSpacing: 1.5
            }}
          >
            DJIDJIMUSIC ® — 15 DESTINOS · UN SOLO SONIDO
          </Typography>
        </Box>

        {/* ========== DIÁLOGO DE CONFIRMACIÓN ========== */}
        <Dialog 
          open={openClearDialog} 
          onClose={() => setOpenClearDialog(false)} 
          maxWidth="xs" 
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: colors.textDark }}>
            Eliminar todos los beats
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: colors.gray600 }}>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenClearDialog(false)} 
              sx={{ color: colors.gray600 }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmClearAll}
              sx={{ 
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                color: 'white',
                '&:hover': { 
                  background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)` 
                }
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

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
              color: colors.primaryDark,
              border: `1px solid ${alpha(colors.primary, 0.2)}`,
            }}
          >
            📦 Resultados desde caché · {searchMetrics?.time}ms
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
              bgcolor: alpha('#4CAF50', 0.08), 
              color: '#2E7D32',
              border: `1px solid ${alpha('#4CAF50', 0.2)}`,
            }}
          >
            ✅ Beat añadido: <strong>{newlyAddedSong?.title}</strong> · {newlyAddedSong?.artist}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainPage;