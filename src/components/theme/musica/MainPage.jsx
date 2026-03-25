  // src/components/theme/musica/MainPage.jsx
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
    alpha,
    Fab,
    Tooltip,
    Grid
  } from "@mui/material";
  import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
  import MusicNoteIcon from "@mui/icons-material/MusicNote";
  import CloudUploadIcon from "@mui/icons-material/CloudUpload";
  import { TrendingUp, PlayCircle, AccessTime, Whatshot } from '@mui/icons-material';
  import { useNavigate } from 'react-router-dom';
  import SearchBar from "../../../components/search/SearchBar";
  import SearchResults from "../../../components/search/SearchResults";
  import { useSearch } from "../../../components/hook/services/useSearch";
  import SongCarousel from "../../../songs/SongCarousel";
  import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
  import PopularSongs from "../../../components/theme/musica/PopularSongs";
  import RandomSongsDisplay from "../../../components/search/RandomSongsDisplay";
  import useDownload from "../../../components/hook/services/useDownload";

  // 🔥 IMPORTS PARA DESCUBRIMIENTO
  import {
    useTrending,
    useTopPlays,
    useRecent,
    useGenres,
    useDiscoveryMainPage
  } from '../../../components/hook/services/useDiscovery';
  import DiscoverySection from '../../../components/discovery/DiscoverySection';
  import GenreCarousel from '../../../components/discovery/GenreCarousel';

  // 🔥 Importar componentes existentes
  import UploadModal from "../../../upload/UploadModal";
  import ArtistCard from "../../../components/profile/ArtistCard";
  import useArtists from "../../../components/hook/services/useArtists";
  import ArtistCarouselHorizontal from "../../../components/profile/ArtistCarouselHorizontal";

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

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(song.title || '?')}&background=3B82F6&color=fff&size=200&bold=true&length=2&font-size=0.50`;
  };

  // ============================================
  // 🎵 HERO SECTION CON UPLOAD (SIN REDIRECCIÓN)
  // ============================================
  const Hero = ({ onUploadClick }) => {
    const theme = useTheme();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleExploreClick = () => {
      console.log('🎧 Explorar música - Próximamente');
    };

    const handleUploadClick = () => {
      console.log('🎤 Abrir modal de subida');
      onUploadClick();
    };

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
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${alpha(theme.palette.primary.light, 0.8)} 100%)`,
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
              background: `radial-gradient(circle at 70% 30%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 60%)`,
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
              onClick={handleExploreClick}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                border: "none",
                px: 5,
                py: 2,
                borderRadius: "16px",
                fontSize: "1.1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                backdropFilter: "blur(4px)",
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                }
              }}
            >
              🎧 Explorar música
            </Box>

            <Box
              component="button"
              onClick={handleUploadClick}
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
  // 🎵 MAIN PAGE CON FAB DE UPLOAD
  // ============================================
  const MainPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    // 🔥 Estado para modal de upload
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [showFab, setShowFab] = useState(false);

    // 🔥 Hook para obtener artistas
    const { artists, loading: artistsLoading } = useArtists();

    // 🔥 HOOKS DE DESCUBRIMIENTO - Solo las secciones esenciales
    const discovery = useDiscoveryMainPage(20);

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

    // 🔥 Hook de descarga
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

    // Mostrar FAB con fade después de montar
    useEffect(() => {
      const timer = setTimeout(() => setShowFab(true), 500);
      return () => clearTimeout(timer);
    }, []);

    // 🔥 Exponer download API globalmente para pruebas
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

      const imageUrl = item.image_url || item.cover || item.album_cover || item.thumbnail || null;
      const finalImageUrl = imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'Song')}&background=3B82F6&color=fff&size=200&bold=true&length=2&font-size=0.50`;

      const newSong = {
        id: songId,
        title: item.title || "Sin título",
        artist: item.artist || "Artista desconocido",
        artist_id: item.artist_id || item.artistId || null,
        genre: item.genre || "Desconocido",
        duration: item.duration,
        cover: finalImageUrl,
        image_url: finalImageUrl,
        image: finalImageUrl,
        addedAt: new Date().toISOString(),
        downloads_count: item.downloads_count || 0,
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

    // ============================================
    // HANDLER PARA REPRODUCCIÓN
    // ============================================
    const handlePlaySong = (song) => {
      console.log('🎵 Reproducir:', song.title);
      // Aquí puedes conectar con tu player global
    };

    // ============================================
    // HANDLER PARA MÁS OPCIONES
    // ============================================
    const handleMoreOptions = (song) => {
      console.log('Más opciones para:', song.title);
      // Aquí puedes abrir un menú contextual o modal
      const action = window.confirm(
        `¿Qué deseas hacer con "${song.title}"?\n\n` +
        `• Ver detalles\n` +
        `• Agregar a playlist\n` +
        `• Compartir`
      );
      
      if (action) {
        navigate(`/song/${song.id}`);
      }
    };

    // ============================================
    // HANDLER PARA LIKES
    // ============================================
    const handleLike = (song) => {
      console.log('❤️ Like:', song.title);
      // Aquí conectar con tu sistema de likes
    };

    return (
      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh", 
        position: "relative" 
      }}>
        <Hero onUploadClick={() => setUploadModalOpen(true)} />

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
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 700,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
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
              bgcolor: theme.palette.mode === 'light' 
                ? theme.palette.grey[100] 
                : theme.palette.grey[900],
              border: `1px solid ${theme.palette.divider}`,
              '&:focus-within': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
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
                  color: theme.palette.text.secondary,
                  fontStyle: 'italic'
                }}
              >
                🎧 busca descubre y disfruta
              </Typography>
            )}
          </Box>

          {/* ============================================ */}
          {/* 🎵 SECCIÓN TUS BEATS - VERSIÓN PREMIUM */}
          {/* ============================================ */}
          {selectedSongs.length > 0 && (
            <Box ref={selectedSongsRef} sx={{ mb: 6 }}>
              {/* Header con diseño premium */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                position: 'relative',
              }}>
                {/* Línea decorativa izquierda */}
                <Box sx={{
                  width: 4,
                  height: 32,
                  background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`,
                  borderRadius: 2,
                  mr: 2,
                }} />

                {/* Título con icono animado */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  flex: 1,
                }}>
                  <Box sx={{
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                      animation: 'pulse 2s infinite',
                      zIndex: 0,
                    },
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                      '50%': { transform: 'scale(1.2)', opacity: 0.8 },
                      '100%': { transform: 'scale(0.95)', opacity: 0.5 },
                    }
                  }}>
                    <MusicNoteIcon 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontSize: 32,
                        filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})`,
                        position: 'relative',
                        zIndex: 1,
                      }} 
                    />
                  </Box>

                  <Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 800,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                      }}
                    >
                      TUS BEATS
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: alpha(theme.palette.primary.main, 0.6),
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        display: 'block',
                      }}
                    >
                      {selectedSongs.length} {selectedSongs.length === 1 ? 'canción seleccionada' : 'canciones seleccionadas'}
                    </Typography>
                  </Box>
                </Box>

                {/* Botón eliminar con diseño premium */}
                <Tooltip title="Eliminar todas las canciones" arrow>
                  <IconButton
                    onClick={handleClearAllSongs}
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.2),
                        transform: 'scale(1.05)',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.error.main, 0.3)}`,
                        '& .MuiSvgIcon-root': {
                          transform: 'rotate(10deg)',
                        }
                      },
                    }}
                  >
                    <DeleteSweepIcon sx={{ 
                      fontSize: 24,
                      transition: 'transform 0.2s ease',
                    }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Contenido con animación */}
              <Grow in timeout={500}>
                <Box>
                  <SongCarousel
                    songs={selectedSongs}
                    title=""
                    onRemoveSong={handleRemoveSong}
                    showRemoveButton={true}
                    variant="compact"
                  />
                </Box>
              </Grow>
            </Box>
          )}

          {/* 🔥 CARRUSEL DE ARTISTAS - ESTILO SPOTIFY */}
          {!artistsLoading && artists.length > 0 && (
            <ArtistCarouselHorizontal
              artists={artists}
              title=""
              loading={artistsLoading}
            />
          )}

          {/* SEPARADOR MÍNIMO */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            my: 3
          }}>
            <Box sx={{
              width: '30px',
              height: '1px',
              background: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '1px'
            }} />
            <Typography sx={{ color: alpha(theme.palette.primary.main, 0.3), fontSize: '0.9rem' }}>◈</Typography>
            <Box sx={{
              width: '30px',
              height: '1px',
              background: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '1px'
            }} />
          </Box>

          {/* ============================================ */}
          {/* 🎯 SECCIONES DE DESCUBRIMIENTO - SOLO ESENCIALES */}
          {/* ============================================ */}

          {/* 🎸 CARRUSEL DE GÉNEROS - ESTILO SPOTIFY */}
          {!discovery.genres.isLoading && discovery.genres.data?.data?.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  letterSpacing: '-0.01em'
                }}
              >
                <MusicNoteIcon sx={{ color: theme.palette.primary.main, fontSize: '1.4rem' }} />
                Explorar por Géros
              </Typography>

              <GenreCarousel
                genres={discovery.genres.data.data}
                onGenreClick={(genre) => navigate(`/genre/${encodeURIComponent(genre.name)}`)}
              />
            </Box>
          )}

          {/* 🔥 SECCIÓN: Tendencias - Lo más popular */}
          <DiscoverySection
            title="Tendencias"
            subtitle="Lo más popular ahora"
            icon={<Whatshot />}
            queryResult={discovery.trending}
            limit={20}
            showIndex={true}
            onPlay={handlePlaySong}
            onLike={handleLike}
            onMore={handleMoreOptions}
            onSongClick={(song) => navigate(`/song/${song.id}`)}
          />

          {/* ▶️ SECCIÓN: Más Escuchadas - En reproducción */}
          <DiscoverySection
            title="Más Escuchadas"
            subtitle="lo que mas se escucha"
            icon={<PlayCircle />}
            queryResult={discovery.plays}
            limit={20}
            onPlay={handlePlaySong}
            onLike={handleLike}
            onMore={handleMoreOptions}
            onSongClick={(song) => navigate(`/song/${song.id}`)}
          />

          {/* ⏰ SECCIÓN: Novedades - Recién agregado */}
          <DiscoverySection
            title="Novedades"
            subtitle="las mas nuevas"
            icon={<AccessTime />}
            queryResult={discovery.recent}
            limit={20}
            showIndex={false}
            onPlay={handlePlaySong}
            onLike={handleLike}
            onMore={handleMoreOptions}
            onSongClick={(song) => navigate(`/song/${song.id}`)}
          />

          {/* ============================================ */}
          {/* TU CÓDIGO EXISTENTE CONTINÚA AQUÍ */}
          {/* ============================================ */}

          <Box sx={{ mb: 6 }}>
            <RandomSongsDisplay />
          </Box>

          <Box sx={{ mb: 6 }}>
            <ArtistCarousel />
          </Box>

          <Box sx={{ mb: 6 }}>
            <PopularSongs />
          </Box>

          {/* FOOTER MÍNIMO */}
          <Box sx={{
            mt: 5,
            pt: 3,
            pb: 2,
            textAlign: 'center',
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.8), fontWeight: 400, fontSize: '0.8rem' }}>
              EL SONIDO ES NUESTRO
            </Typography>
          </Box>

          {/* NOTIFICACIONES */}
          <Snackbar open={showCacheNotification} autoHideDuration={2000} onClose={() => setShowCacheNotification(false)}>
            <Alert 
              severity="info" 
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.08), 
                color: theme.palette.primary.main,
                fontSize: '0.8rem'
              }}
            >
              📦 Resultados desde caché • {searchMetrics?.time}ms
            </Alert>
          </Snackbar>

          <Snackbar open={showLimitNotification} autoHideDuration={2000} onClose={() => setShowLimitNotification(false)}>
            <Alert 
              severity="warning" 
              sx={{ 
                bgcolor: alpha(theme.palette.warning.main, 0.1), 
                color: theme.palette.warning.dark,
                fontSize: '0.8rem'
              }}
            >
              🎵 Máximo {MAX_SELECTED_SONGS} canciones
            </Alert>
          </Snackbar>

          <Snackbar open={showAddNotification} autoHideDuration={1500} onClose={() => setShowAddNotification(false)}>
            <Alert
              severity="success"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '0.8rem'
              }}
            >
              {newlyAddedSong?.cover && (
                <Box
                  component="img"
                  src={newlyAddedSong.cover}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '4px',
                    objectFit: 'cover'
                  }}
                />
              )}
              ✅ {newlyAddedSong?.title}
            </Alert>
          </Snackbar>
        </Container>

        {/* FAB DE UPLOAD */}
        <Fade in={showFab} timeout={800}>
          <Tooltip 
            title="Subir mi música" 
            placement="left"
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: theme.palette.mode === 'light' ? '#1a1a1a' : theme.palette.grey[800],
                  color: 'white',
                  fontSize: '0.8rem',
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }
            }}
          >
            <Fab
              onClick={() => setUploadModalOpen(true)}
              sx={{
                position: 'fixed',
                bottom: { xs: 16, md: 24 },
                right: { xs: 16, md: 24 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                color: 'white',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                width: { xs: 56, md: 64 },
                height: { xs: 56, md: 64 },
                '&:hover': {
                  transform: 'scale(1.05)',
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 10px 22px ${alpha(theme.palette.primary.main, 0.4)}`
                },
                transition: 'all 0.2s ease',
                zIndex: 1200,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <CloudUploadIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
            </Fab>
          </Tooltip>
        </Fade>

        {/* MODAL DE UPLOAD */}
        <UploadModal 
          open={uploadModalOpen} 
          onClose={() => setUploadModalOpen(false)} 
        />
      </Box>
    );
  };

  export default MainPage;