// ============================================
// src/pages/MainPage.jsx - VERSIÓN COMPLETA CORREGIDA
// ✅ Incluye downloads_count en canciones seleccionadas
// ✅ Sin placeholder de duración (mantiene null)
// ✅ Contador de descargas visible en SongCarousel
// ============================================

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Alert,
  Snackbar,
  Grow,
  IconButton,
  alpha
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { useNavigate } from 'react-router-dom';
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";
import RandomSongsDisplay from "../../../components/search/RandomSongsDisplay";

// 🔥 Hook de descarga
import useDownload from "../../../components/hook/services/useDownload";

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
// 🎵 FUNCIÓN AUXILIAR PARA IMAGEN DE CANCIÓN
// ============================================
const getSongImageUrl = (song) => {
  if (!song) return null;

  const possibleImageProps = [
    song.cover,
    song.image_url,
    song.image,
    song.album_cover,
    song.thumbnail,
    song.coverImage,
    song.coverUrl
  ];

  const imageUrl = possibleImageProps.find(url => url && typeof url === 'string' && url.trim() !== '');

  if (imageUrl) {
    return imageUrl;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(song.title || '?')}&background=FF6B35&color=fff&size=200&bold=true&length=2&font-size=0.50`;
};

// ============================================
// 🎵 HERO SECTION PROFESIONAL
// ============================================
const Hero = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        height: "90vh",
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
        {!imageError ? (
          <Box
            component="img"
            src="/igor.jpg"
            alt="Igor - Artista destacado"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.log('Error cargando imagen');
              setImageError(true);
            }}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out, transform 8s ease',
              transform: 'scale(1.02)',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          />
        ) : (
          <Box sx={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 50%, #FFA07A 100%)`,
          }} />
        )}

        {/* Overlay profesional */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%),
            linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%),
            radial-gradient(circle at 30% 50%, transparent 0%, rgba(0,0,0,0.2) 100%)
          `,
          '&::before': {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 70% 30%, ${alpha(colors.primary, 0.1)} 0%, transparent 60%)`,
            mixBlendMode: 'overlay'
          }
        }} />

        {/* Efecto de luz superior */}
        <Box sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
          pointerEvents: "none"
        }} />
      </Box>

      {/* Contenido */}
      <Box sx={{
        position: "relative",
        zIndex: 10,
        maxWidth: "800px",
        textAlign: "center",
        px: 3
      }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", md: "4rem" },
            fontWeight: 800,
            lineHeight: 1.2,
            mb: 3,
            color: "white",
            textShadow: '2px 2px 4px rgba(0,0,0,0.3), 4px 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          La casa digital de los amantes del EcuaBeats.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1.1rem", md: "1.3rem" },
            color: "rgba(255,255,255,0.95)",
            mb: 5,
            maxWidth: "600px",
            mx: "auto",
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          Escucha, descubre y apoya a los artistas que estan marcando la diferencia.
          Sube tu música, construye tu audiencia y forma parte del movimiento.
        </Typography>

        {/* Botones CTA */}
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: 2
        }}>
          <Box
            component="button"
            onClick={() => navigate('')}
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
              backdropFilter: "blur(4px)",
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
            onClick={() => navigate('')}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.3)",
              px: 5,
              py: 2,
              borderRadius: "16px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(4px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.25)",
                transform: "translateY(-2px)",
                borderColor: "white",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
              }
            }}
          >
            🎤 Subir mi música
          </Box>
        </Box>

        {/* Social Proof */}
        <Typography
          sx={{
            mt: 8,
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "2px",
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          TODO LO QUE SUENA EN LAS CALLES
        </Typography>
      </Box>
    </Box>
  );
};

// ============================================
// 🎵 MAIN PAGE COMPLETA (VERSIÓN CORREGIDA)
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

  // Hook de descarga
  const download = useDownload();

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

  // Exponer download API globalmente para pruebas
  useEffect(() => {
    window.downloadAPI = download;
    console.log('✅ downloadAPI disponible globalmente');
    console.log('📦 Métodos:', Object.keys(download));
    console.log('💡 Para probar: window.downloadAPI.downloadSong("70", "merci beaucoup", "pop_smoke")');

    return () => {
      delete window.downloadAPI;
    };
  }, [download]);

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
    const hasResults = structuredResults?.songs?.length > 0 ||
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

  // ============================================
  // ✅ HANDLER CORREGIDO - Incluye downloads_count
  // ============================================
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

    // Determinar la URL de la imagen correcta
    const imageUrl = item.image_url || item.cover || item.album_cover || item.thumbnail || null;

    // Si no hay imagen, usar placeholder con iniciales
    const finalImageUrl = imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'Song')}&background=FF6B35&color=fff&size=200&bold=true&length=2&font-size=0.50`;

    // ✅ VERSIÓN CORREGIDA: Incluye TODOS los campos necesarios
    const newSong = {
      id: songId,
      title: item.title || "Sin título",
      artist: item.artist || "Artista desconocido",
      artist_id: item.artist_id || item.artistId || null,
      genre: item.genre || "Desconocido",
      // ⚠️ IMPORTANTE: Mantener duration como viene del backend (puede ser null)
      duration: item.duration, // Sin placeholder
      cover: finalImageUrl,
      image_url: finalImageUrl,
      image: finalImageUrl,
      addedAt: new Date().toISOString(),
      // ✅ NUEVO: Incluir contador de descargas
      downloads_count: item.downloads_count || 0,
      // ✅ NUEVO: Incluir otros campos útiles
      likes_count: item.likes_count || 0,
      plays_count: item.plays_count || 0,
      file_key: item.file_key,
      is_public: item.is_public,
      uploaded_by: item.uploaded_by
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
      {/* HERO */}
      <Hero />

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

        {/* BARRA DE BÚSQUEDA */}
        <Box ref={searchBarRef} sx={{ maxWidth: 600, mx: "auto", mb: 4, position: "relative" }}>
          <Paper elevation={0} sx={{
            borderRadius: "12px",
            bgcolor: colors.gray100,
            border: `1px solid ${colors.gray200}`,
            '&:focus-within': {
              borderColor: colors.gray500,
              boxShadow: `0 0 0 3px ${alpha(colors.gray500, 0.15)}`,
            },
            transition: 'all 0.2s ease'
          }}>
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              loading={loading}
              autoFocus={!isMobile}
              placeholder="Buscar canciones, artistas..."
            />
          </Paper>

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
                  onClose={() => setShowResults(false)}
                  onSelect={handleSelectResult}
                />
              </Box>
            </Fade>
          )}

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
              🎧 busca descubre y disfruta
            </Typography>
          )}
        </Box>

        {/* CANCIONES SELECCIONADAS - AHORA CON CONTADOR DE DESCARGAS */}
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
            EL SONIDO ES NUESTRO
          </Typography>
          <Typography variant="caption" sx={{ color: alpha(colors.gray600, 0.6), display: 'block', mt: 1 }}>
            {/* empty */}
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
          <Alert
            severity="success"
            sx={{
              bgcolor: '#E8F5E9',
              color: '#2E7D32',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {newlyAddedSong?.cover && (
              <Box
                component="img"
                src={newlyAddedSong.cover}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '4px',
                  objectFit: 'cover'
                }}
              />
            )}
            ✅ Añadido: {newlyAddedSong?.title}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainPage;