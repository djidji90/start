// ============================================
// components/theme/musica/MainPage.jsx
// VERSIÓN PREMIUM OPTIMIZADA - NIVEL SPOTIFY+
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

// 🔥 NUEVO: Importar hook de descarga
import useDownload from "../../../components/hook/services/useDownload";

// ============================================
// 🎨 IDENTIDAD VISUAL OPTIMIZADA
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)', // WCAG AA compliant
  textTertiary: 'rgba(255,255,255,0.5)', // Para elementos decorativos
  background: {
    dark: '#0A0A0A',
    medium: '#121212',
    light: '#1A1A1A',
  }
};

// ============================================
// 🎨 SHADOWS UNIFORMES
// ============================================
const shadows = {
  small: (opacity = 0.15) => `0 4px 12px ${alpha('#000', opacity)}`,
  medium: (opacity = 0.2) => `0 8px 20px ${alpha('#000', opacity)}`,
  large: (opacity = 0.25) => `0 12px 28px ${alpha('#000', opacity)}`,
  primary: (opacity = 0.25) => `0 8px 20px ${alpha(colors.primary, opacity)}`,
  glow: (opacity = 0.15) => `0 0 20px ${alpha(colors.primary, opacity)}`,
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
// 🎵 HERO SECTION OPTIMIZADO
// ============================================
const Hero = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const heroRef = useRef(null);

  return (
    <Box 
      ref={heroRef}
      component="section" 
      sx={{ 
        position: "relative", 
        width: "100%", 
        minHeight: { xs: "70vh", md: "90vh" },
        maxHeight: { xs: "600px", md: "none" },
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        color: "white", 
        overflow: "hidden", 
        mb: 4 
      }}
    >
      {/* Background Image con optimización de performance */}
      <Box sx={{ position: "absolute", inset: 0, willChange: 'transform' }}>
        {!imageError ? (
          <Box
            component="img"
            src="/igor.jpg"
            alt="Igor - Artista destacado"
            loading="eager"
            fetchpriority="high"
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
              transition: 'opacity 0.5s ease-in-out, transform 0.3s ease',
              transform: 'scale(1.02)',
              '@media (hover: hover)': {
                '&:hover': {
                  transform: 'scale(1.05)',
                }
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

        {/* Overlay profesional optimizado */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%),
            linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)
          `,
          '&::before': {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 70% 30%, ${alpha(colors.primary, 0.08)} 0%, transparent 60%)`,
            mixBlendMode: 'overlay',
            pointerEvents: 'none'
          }
        }} />
      </Box>

      {/* Content con espaciado optimizado */}
      <Box sx={{
        position: "relative",
        zIndex: 10,
        maxWidth: "800px",
        textAlign: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 0 }
      }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "4rem" },
            fontWeight: 800,
            lineHeight: 1.2,
            mb: { xs: 2, md: 3 },
            color: colors.textPrimary,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          La casa digital de los amantes del EcuaBeats.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.3rem" },
            color: colors.textSecondary,
            mb: { xs: 3, md: 5 },
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          Escucha, descubre y apoya a los artistas que estan marcando la diferencia.
          Sube tu música, construye tu audiencia y forma parte del movimiento.
        </Typography>

        {/* CTA Buttons - Espaciado optimizado */}
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 0 }
        }}>
          <Box
            component="button"
            onClick={() => navigate('')}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              bgcolor: colors.primary,
              color: colors.textPrimary,
              border: "none",
              px: { xs: 3, md: 5 },
              py: { xs: 1.5, md: 2 },
              borderRadius: "16px",
              fontSize: { xs: "1rem", md: "1.1rem" },
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: shadows.primary(0.3),
              backdropFilter: "blur(4px)",
              "&:hover": {
                bgcolor: colors.primaryDark,
                transform: "translateY(-2px)",
                boxShadow: shadows.primary(0.4)
              }
            }}
          >
            🎧 Explorar música
          </Box>

          <Box
            component="button"
            onClick={() => navigate('')}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              bgcolor: "rgba(255,255,255,0.1)",
              color: colors.textPrimary,
              border: "1.5px solid rgba(255,255,255,0.2)",
              px: { xs: 3, md: 5 },
              py: { xs: 1.5, md: 2 },
              borderRadius: "16px",
              fontSize: { xs: "1rem", md: "1.1rem" },
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(4px)",
              boxShadow: shadows.small(0.1),
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.15)",
                transform: "translateY(-2px)",
                borderColor: "rgba(255,255,255,0.3)",
                boxShadow: shadows.medium(0.15)
              }
            }}
          >
            🎤 Subir mi música
          </Box>
        </Box>

        {/* Social Proof */}
        <Typography
          sx={{
            mt: { xs: 6, md: 8 },
            fontSize: "0.75rem",
            color: colors.textTertiary,
            letterSpacing: "2px",
          }}
        >
          TODO LO QUE SUENA EN LAS CALLES
        </Typography>
      </Box>
    </Box>
  );
};

// ============================================
// 🎵 COMPONENTE DE NOTIFICACIÓN UNIFICADO
// ============================================
const CustomSnackbar = ({ open, onClose, severity, message, icon, duration = 2000 }) => {
  const severityStyles = {
    info: {
      bgcolor: alpha('#1E1E1E', 0.95),
      color: colors.textPrimary,
      border: `1px solid ${alpha(colors.primary, 0.3)}`,
      iconColor: colors.primary
    },
    warning: {
      bgcolor: alpha('#332211', 0.95),
      color: '#FFB74D',
      border: '1px solid #FFB74D40',
      iconColor: '#FFB74D'
    },
    success: {
      bgcolor: alpha('#1A3322', 0.95),
      color: '#81C784',
      border: '1px solid #81C78440',
      iconColor: '#81C784'
    }
  };

  const style = severityStyles[severity];

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={duration} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        icon={icon}
        severity={severity}
        sx={{ 
          bgcolor: style.bgcolor,
          color: style.color,
          backdropFilter: 'blur(12px)',
          border: style.border,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '& .MuiAlert-icon': {
            color: style.iconColor
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// ============================================
// 🎵 MAIN PAGE COMPLETA - VERSIÓN OPTIMIZADA
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

  // 🔥 NUEVO: Hook de descarga
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
  const [notifications, setNotifications] = useState({
    cache: false,
    limit: false,
    add: false
  });
  const [newlyAddedSong, setNewlyAddedSong] = useState(null);

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);
  const selectedSongsRef = useRef(null);

  const MAX_SELECTED_SONGS = 50;

  // 🔥 NUEVO: Exponer download API globalmente para pruebas
  useEffect(() => {
    window.downloadAPI = download;
    console.log('✅ downloadAPI disponible globalmente');

    return () => {
      delete window.downloadAPI;
    };
  }, [download]);

  // Persistencia
  useEffect(() => {
    localStorage.setItem("djidjimusic_selected_songs", JSON.stringify(selectedSongs));
  }, [selectedSongs]);

  // Notificaciones optimizadas
  useEffect(() => {
    if (searchMetrics?.fromCache) {
      setNotifications(prev => ({ ...prev, cache: true }));
      setTimeout(() => setNotifications(prev => ({ ...prev, cache: false })), 2000);
    }
  }, [searchMetrics]);

  useEffect(() => {
    if (newlyAddedSong) {
      setNotifications(prev => ({ ...prev, add: true }));
      setTimeout(() => {
        setNotifications(prev => ({ ...prev, add: false }));
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
      setNotifications(prev => ({ ...prev, limit: true }));
      setTimeout(() => setNotifications(prev => ({ ...prev, limit: false })), 2000);
      setShowResults(false);
      closeResults?.();
      return;
    }

    const imageUrl = item.image_url || item.cover || item.album_cover || item.thumbnail || null;
    const finalImageUrl = imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'Song')}&background=FF6B35&color=fff&size=200&bold=true&length=2&font-size=0.50`;

    const newSong = {
      id: songId,
      title: item.title || "Sin título",
      artist: item.artist || "Artista desconocido",
      artist_id: item.artist_id || item.artistId || null,
      genre: item.genre || "Desconocido",
      duration: item.duration || 180,
      cover: finalImageUrl,
      image_url: finalImageUrl,
      image: finalImageUrl,
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
    <Box sx={{ 
      background: `linear-gradient(180deg, 
        ${colors.background.dark} 0%, 
        ${colors.background.medium} 30%, 
        ${colors.background.light} 70%, 
        ${alpha(colors.primary, 0.05)} 100%)`,
      minHeight: "100vh",
      transition: "background 0.3s ease"
    }}>
      {/* HERO */}
      <Hero />

      <Container maxWidth="lg" sx={{ px: { xs: 1.5, md: 3 } }}>
        {/* CONTADOR FLOTANTE OPTIMIZADO */}
        {selectedSongs.length > 0 && (
          <Box
            sx={{
              position: 'fixed',
              top: { xs: 16, sm: 24, md: 32 },
              right: { xs: 16, sm: 24, md: 32 },
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              color: colors.textPrimary,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 700,
              boxShadow: shadows.primary(0.3),
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                transform: 'scale(1.08) translateY(-2px)',
                boxShadow: shadows.primary(0.4)
              }
            }}
            onClick={() => selectedSongsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            title={`${selectedSongs.length} canción(es) seleccionada(s)`}
          >
            <MusicNoteIcon sx={{ fontSize: { xs: 18, sm: 20 }, mr: 0.5 }} />
            {selectedSongs.length}
          </Box>
        )}

        {/* BARRA DE BÚSQUEDA OPTIMIZADA */}
        <Box ref={searchBarRef} sx={{ maxWidth: 600, mx: "auto", mb: 4, position: "relative" }}>
          <Paper elevation={0} sx={{
            borderRadius: "16px",
            bgcolor: "rgba(30,30,30,0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: shadows.medium(0.3),
            '&:focus-within': {
              borderColor: colors.primary,
              bgcolor: "rgba(40,40,40,0.9)",
              boxShadow: shadows.primary(0.2),
            },
            transition: 'all 0.2s ease'
          }}>
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              loading={loading}
              autoFocus={!isMobile}
              placeholder="Buscar canciones, artistas..."
              sx={{
                input: { 
                  color: colors.textPrimary,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  "&::placeholder": {
                    color: colors.textTertiary,
                    fontSize: { xs: '0.9rem', sm: '0.95rem' }
                  }
                },
                "& .MuiInputBase-input": {
                  py: { xs: 1.5, sm: 1.8 }
                },
                "& .MuiSvgIcon-root": {
                  color: colors.textTertiary,
                  fontSize: { xs: '1.3rem', sm: '1.4rem' }
                }
              }}
            />
          </Paper>

          {!query && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 2,
                color: colors.textTertiary,
                fontStyle: 'italic',
                fontSize: { xs: '0.8rem', sm: '0.85rem' }
              }}
            >
              🎧 busca, descubre y disfruta
            </Typography>
          )}

          {/* Resultados de búsqueda */}
          {showResults && (
            <Fade in timeout={200}>
              <Box ref={resultsRef} sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 1400,
                mt: 1.5
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
        </Box>

        {/* CANCIONES SELECCIONADAS */}
        {selectedSongs.length > 0 && (
          <Box ref={selectedSongsRef} sx={{ mb: 8 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              borderBottom: `2px solid ${alpha(colors.primary, 0.2)}`,
              pb: 1.5
            }}>
              <Typography variant="h5" sx={{
                fontWeight: 700,
                color: colors.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
              }}>
                <MusicNoteIcon sx={{ color: colors.primary, fontSize: { xs: '1.5rem', md: '1.8rem' } }} />
                TUS BEATS ({selectedSongs.length})
              </Typography>
              <IconButton
                onClick={handleClearAllSongs}
                size="small"
                sx={{ 
                  color: colors.textTertiary, 
                  '&:hover': { 
                    color: colors.primary,
                    backgroundColor: alpha(colors.primary, 0.1)
                  },
                  p: { xs: 1, sm: 1.5 }
                }}
                title="Eliminar todas"
              >
                <DeleteSweepIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />
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

        {/* SEPARADOR ELEGANTE OPTIMIZADO */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1.5, sm: 2 },
          my: { xs: 5, sm: 6 }
        }}>
          <Box sx={{
            width: { xs: '40px', sm: '60px' },
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
            borderRadius: '3px',
            opacity: 0.5
          }} />
          <Typography sx={{ 
            color: alpha(colors.primary, 0.6), 
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            transform: 'rotate(15deg)',
          }}>
            ✦
          </Typography>
          <Box sx={{
            width: { xs: '40px', sm: '60px' },
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
            borderRadius: '3px',
            opacity: 0.5
          }} />
        </Box>

        {/* SECCIONES DE CONTENIDO */}
        <Box sx={{ mb: 8 }}>
          <RandomSongsDisplay />
        </Box>

        <Box sx={{ mb: 8 }}>
          <ArtistCarousel />
        </Box>

        <Box sx={{ mb: 8 }}>
          <PopularSongs />
        </Box>

        {/* FOOTER OPTIMIZADO */}
        <Box sx={{
          mt: 8,
          pt: 5,
          pb: 3,
          textAlign: 'center',
          borderTop: `1px solid ${alpha(colors.primary, 0.12)}`,
        }}>
          <Typography variant="body1" sx={{ 
            color: colors.textSecondary,
            fontWeight: 500,
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            letterSpacing: '2px',
            mb: 1
          }}>
            EL SONIDO ES NUESTRO
          </Typography>
          <Typography variant="caption" sx={{ 
            color: colors.textTertiary,
            display: 'block', 
            mt: 1.5,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            letterSpacing: '1px'
          }}>
            djidjimusic © {new Date().getFullYear()} • todos los ritmos, un solo lugar
          </Typography>
        </Box>

        {/* NOTIFICACIONES UNIFICADAS */}
        <CustomSnackbar
          open={notifications.cache}
          onClose={() => setNotifications(prev => ({ ...prev, cache: false }))}
          severity="info"
          message={`📦 Resultados desde caché • ${searchMetrics?.time}ms`}
        />

        <CustomSnackbar
          open={notifications.limit}
          onClose={() => setNotifications(prev => ({ ...prev, limit: false }))}
          severity="warning"
          message={`🎵 Máximo ${MAX_SELECTED_SONGS} canciones`}
        />

        <CustomSnackbar
          open={notifications.add}
          onClose={() => setNotifications(prev => ({ ...prev, add: false }))}
          severity="success"
          message={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {newlyAddedSong?.cover && (
                <Box
                  component="img"
                  src={newlyAddedSong.cover}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '4px',
                    objectFit: 'cover',
                    border: `1px solid ${alpha(colors.primary, 0.3)}`
                  }}
                />
              )}
              {newlyAddedSong?.title}
            </Box>
          }
        />
      </Container>
    </Box>
  );
};

export default MainPage;