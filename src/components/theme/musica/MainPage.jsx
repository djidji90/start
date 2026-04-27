// src/components/theme/musica/MainPage.jsx
// ============================================
// 🎵 MAIN PAGE - VERSIÓN PREMIUM OPTIMIZADA
// ✅ SongCarousel mejorado
// ✅ Playlist automática al hacer click
// ✅ Smart Playlists Hub integrado
// ✅ PlayerContext completamente integrado
// ✅ UI Premium con transiciones fluidas
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
  IconButton,
  alpha,
  Fab,
  Tooltip,
  LinearProgress,
  Slider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import RepeatIcon from "@mui/icons-material/Repeat";
import RepeatOneIcon from "@mui/icons-material/RepeatOne";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import CloseIcon from "@mui/icons-material/Close";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { PlayCircle, AccessTime, Whatshot } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Imports del sistema de reproducción
import { usePlayer } from '../../../components/PlayerContext';

// Imports de descubrimiento
import {
  useDiscoveryMainPage
} from '../../../components/hook/services/useDiscovery';

// Componentes UI
import PlaylistsSection from "../../../components/playlists/PlaylistsSection";
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";
import RandomSongsDisplay from "../../../components/search/RandomSongsDisplay";
import useDownload from "../../../components/hook/services/useDownload";
import DiscoverySection from '../../../components/discovery/DiscoverySection';
import GenreCarousel from '../../../components/discovery/GenreCarousel';
import UploadModal from "../../../upload/UploadModal";
import useArtists from "../../../components/hook/services/useArtists";
import ArtistCarouselHorizontal from "../../../components/profile/ArtistCarouselHorizontal";

// ============================================
// 🎵 COMPONENTE MINI PLAYER FLOTANTE
// ============================================
const FloatingMiniPlayer = ({ player, onClose, theme }) => {
  const [localVolume, setLocalVolume] = useState(player.volume || 0.7);

  const handleVolumeChange = (_, newValue) => {
    setLocalVolume(newValue);
    player.changeVolume(newValue);
  };

  if (!player.currentSong) return null;

  return (
    <Fade in={true}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1300,
          p: 1.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: 'blur(8px)',
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          minWidth: 260,
          maxWidth: 300,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={player.progressPercentage || 0}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: '3px 3px 0 0',
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            '& .MuiLinearProgress-bar': { bgcolor: theme.palette.primary.main }
          }}
        />

        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: 'absolute', top: 4, right: 4, color: theme.palette.text.secondary }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
          <Box
            component="img"
            src={player.currentSong?.cover || player.currentSong?.image_url || '/default-album.jpg'}
            alt={player.currentSong?.title}
            sx={{ width: 45, height: 45, borderRadius: 2, objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/default-album.jpg'; }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.85rem' }}>
              {player.currentSong?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
              {player.currentSong?.artist}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
          <Tooltip title="Aleatorio" arrow>
            <IconButton size="small" onClick={player.toggleShuffle} sx={{ color: player.shuffle ? theme.palette.primary.main : theme.palette.text.secondary }}>
              <ShuffleIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Anterior" arrow>
            <IconButton size="small" onClick={player.playPrevious}>
              <SkipPreviousIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={player.isPlaying ? "Pausar" : "Reproducir"} arrow>
            <IconButton
              onClick={player.togglePlay}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: theme.palette.primary.dark, transform: 'scale(1.05)' }
              }}
            >
              {player.isPlaying ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Siguiente" arrow>
            <IconButton size="small" onClick={player.playNext}>
              <SkipNextIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={player.repeatMode === 'one' ? "Repetir canción" : player.repeatMode === 'all' ? "Repetir playlist" : "Sin repetición"} arrow>
            <IconButton size="small" onClick={player.toggleRepeat} sx={{ color: player.repeatMode ? theme.palette.primary.main : theme.palette.text.secondary }}>
              {player.repeatMode === 'one' ? <RepeatOneIcon sx={{ fontSize: 16 }} /> : <RepeatIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {player.playlist.length > 1 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: '0.65rem' }}>
            {player.playlistIndex + 1} / {player.playlist.length}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5, pt: 0.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <IconButton size="small" onClick={() => player.changeVolume(localVolume === 0 ? 0.7 : 0)}>
            {localVolume === 0 ? <VolumeOffIcon sx={{ fontSize: 14 }} /> : <VolumeUpIcon sx={{ fontSize: 14 }} />}
          </IconButton>
          <Slider size="small" value={localVolume} onChange={handleVolumeChange} min={0} max={1} step={0.01} sx={{ width: 80 }} />
        </Box>
      </Paper>
    </Fade>
  );
};

// ============================================
// 🎵 HERO SECTION PREMIUM
// ============================================
const Hero = ({ onUploadClick }) => {
  const theme = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Box component="section" sx={{ position: "relative", width: "100%", height: "90vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white", overflow: "hidden", mb: 4 }}>
      <Box sx={{ position: "absolute", inset: 0 }}>
        {!imageError ? (
          <Box component="img" src="/igor.jpg" alt="Igor" onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} sx={{ width: "100%", height: "100%", objectFit: "cover", opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out, transform 8s ease', transform: 'scale(1.02)' }} />
        ) : (
          <Box sx={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${alpha(theme.palette.primary.light, 0.8)} 100%)` }} />
        )}
        <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%), linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)` }} />
      </Box>
      <Box sx={{ position: "relative", zIndex: 10, maxWidth: "800px", textAlign: "center", px: 3 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, fontWeight: 800, lineHeight: 1.2, mb: 3 }}>La casa digital de los amantes del EcuaBeats.</Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: "1.1rem", md: "1.3rem" }, mb: 5, maxWidth: "600px", mx: "auto" }}>Escucha, descubre y apoya a los artistas que están marcando la diferencia.</Typography>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "center", gap: 2 }}>
          <Box component="button" onClick={() => document.getElementById('discovery-sections')?.scrollIntoView({ behavior: 'smooth' })} sx={{ bgcolor: theme.palette.primary.main, color: "white", border: "none", px: 5, py: 2, borderRadius: "16px", fontSize: "1.1rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", '&:hover': { bgcolor: theme.palette.primary.dark, transform: "translateY(-2px)" } }}>🎧 Explorar música</Box>
          <Box component="button" onClick={onUploadClick} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", border: "2px solid rgba(255,255,255,0.3)", px: 5, py: 2, borderRadius: "16px", fontSize: "1.1rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", '&:hover': { bgcolor: "rgba(255,255,255,0.25)", transform: "translateY(-2px)" } }}>🎤 Subir mi música</Box>
        </Box>
      </Box>
    </Box>
  );
};

// ============================================
// 🎵 MAIN PAGE PRINCIPAL OPTIMIZADA
// ============================================
const MainPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const player = usePlayer();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(true);

  const { artists, loading: artistsLoading } = useArtists();
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

  const download = useDownload();

  const [showResults, setShowResults] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState(() => {
    try {
      const stored = localStorage.getItem("djidjimusic_selected_songs");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showCacheNotification, setShowCacheNotification] = useState(false);
  const [newlyAddedSong, setNewlyAddedSong] = useState(null);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [showLimitNotification, setShowLimitNotification] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    songId: null, 
    title: '' 
  });

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);
  const selectedSongsRef = useRef(null);

  const MAX_SELECTED_SONGS = 50;

  // Efectos iniciales
  useEffect(() => {
    const timer = setTimeout(() => setShowFab(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.downloadAPI = download;
    return () => { delete window.downloadAPI; };
  }, [download]);

  useEffect(() => {
    localStorage.setItem("djidjimusic_selected_songs", JSON.stringify(selectedSongs));
  }, [selectedSongs]);

  useEffect(() => {
    if (searchMetrics?.fromCache) {
      setShowCacheNotification(true);
      setTimeout(() => setShowCacheNotification(false), 2000);
    }
  }, [searchMetrics]);

  useEffect(() => {
    if (newlyAddedSong) {
      setShowAddNotification(true);
      setTimeout(() => { setShowAddNotification(false); setNewlyAddedSong(null); }, 1500);
    }
  }, [newlyAddedSong]);

  useEffect(() => {
    const hasResults = structuredResults?.songs?.length > 0 ||
      structuredResults?.artists?.length > 0 ||
      structuredResults?.genres?.length > 0;
    setShowResults(hookIsOpen || (hasResults && query.length >= 2));
  }, [hookIsOpen, structuredResults, query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showResults && searchBarRef.current && !searchBarRef.current.contains(e.target) &&
          resultsRef.current && !resultsRef.current.contains(e.target)) {
        setShowResults(false);
        closeResults?.();
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [showResults, closeResults]);

  // ============================================
  // 🎯 HANDLERS DE REPRODUCCIÓN OPTIMIZADOS
  // ============================================

  const handlePlaySong = (song) => {
    if (!song?.id) return;
    
    console.log('🎵 Reproducir:', song.title);
    
    const allSongs = [
      ...(discovery.trending?.data?.data || []),
      ...(discovery.plays?.data?.data || []),
      ...(discovery.recent?.data?.data || []),
      ...selectedSongs
    ];
    
    const uniqueSongs = [];
    const seenIds = new Set();
    for (const s of allSongs) {
      if (s?.id && !seenIds.has(s.id)) {
        seenIds.add(s.id);
        uniqueSongs.push(s);
      }
    }
    
    const songIndex = uniqueSongs.findIndex(s => s.id === song.id);
    
    if (songIndex !== -1) {
      const playlistSongs = uniqueSongs.slice(songIndex);
      console.log(`📋 Creando playlist con ${playlistSongs.length} canciones`);
      player.setPlaylistAndPlay(playlistSongs, 0, true);
      
      setSnackbar({
        open: true,
        message: `🎵 Reproduciendo: ${song.title} + ${playlistSongs.length - 1} canciones en cola`
      });
    } else {
      player.playSong(song);
    }
  };

  const handlePlaySection = (songs, sectionTitle) => {
    if (!songs || songs.length === 0) return;
    
    console.log(`🎵 Reproduciendo sección: ${sectionTitle} (${songs.length} canciones)`);
    player.setPlaylistAndPlay(songs, 0, true);
    
    setSnackbar({
      open: true,
      message: `🎵 Reproduciendo: ${sectionTitle} • ${songs.length} canciones`
    });
  };

  // 🎯 Handler mejorado para playlists curadas
  const handlePlayCuratedPlaylist = (songs, playlistName) => {
    if (!songs?.length) {
      console.warn(`⚠️ No hay canciones en ${playlistName}`);
      return;
    }
    
    console.log(`🎵 Reproduciendo playlist curada: ${playlistName} (${songs.length} canciones)`);
    player.setPlaylistAndPlay(songs, 0, true);
    
    setSnackbar({
      open: true,
      message: `🎵 Reproduciendo: ${playlistName} • ${songs.length} canciones`,
    });
  };

  const handlePlaySelectedSongs = () => {
    if (selectedSongs.length === 0) return;
    
    console.log(`🎵 Reproduciendo Tus Beats (${selectedSongs.length} canciones)`);
    player.setPlaylistAndPlay(selectedSongs, 0, true);
    
    setSnackbar({
      open: true,
      message: `🎵 Reproduciendo: Tus Beats • ${selectedSongs.length} canciones`
    });
  };

  const handleShuffleSelectedSongs = () => {
    if (selectedSongs.length === 0) return;
    
    const shuffled = [...selectedSongs].sort(() => Math.random() - 0.5);
    console.log(`🎲 Reproduciendo Tus Beats en modo aleatorio (${shuffled.length} canciones)`);
    player.setPlaylistAndPlay(shuffled, 0, true);
    
    setSnackbar({
      open: true,
      message: `🎲 Reproduciendo: Tus Beats (Aleatorio) • ${shuffled.length} canciones`
    });
  };

  // ============================================
  // HANDLERS DE SELECCIÓN Y ELIMINACIÓN
  // ============================================

  const handleSelectResult = (item, type) => {
    if (type !== "song" || !item?.id) {
      setShowResults(false);
      closeResults?.();
      return;
    }

    if (selectedSongs.some(song => String(song.id) === String(item.id))) {
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

    const imageUrl = item.image_url || item.cover || item.album_cover || null;
    const newSong = {
      id: String(item.id),
      title: item.title || "Sin título",
      artist: item.artist || "Artista desconocido",
      genre: item.genre || "Desconocido",
      duration: item.duration,
      cover: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'Song')}&background=3B82F6&color=fff&size=200&bold=true&length=2`,
      image_url: imageUrl,
      downloads_count: item.downloads_count || 0,
      likes_count: item.likes_count || 0,
      plays_count: item.plays_count || 0,
      addedAt: new Date().toISOString()
    };

    setSelectedSongs(prev => [newSong, ...prev]);
    setNewlyAddedSong(newSong);
    setShowResults(false);
    closeResults?.();
    
    setTimeout(() => {
      selectedSongsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleRemoveSong = (songId, songTitle) => {
    setConfirmDialog({ open: true, songId, title: songTitle });
  };

  const handleConfirmRemoveSong = () => {
    setSelectedSongs(prev => prev.filter(song => String(song.id) !== String(confirmDialog.songId)));
    setConfirmDialog({ open: false, songId: null, title: '' });
    setSnackbar({ open: true, message: `🗑️ Canción eliminada de Tus Beats` });
  };

  const handleClearAllSongs = () => {
    if (selectedSongs.length === 0) return;
    setConfirmDialog({ open: true, songId: 'ALL', title: 'Todas las canciones' });
  };

  const handleConfirmClearAll = () => {
    setSelectedSongs([]);
    setConfirmDialog({ open: false, songId: null, title: '' });
    setSnackbar({ open: true, message: `🗑️ Se eliminaron todas las ${selectedSongs.length} canciones` });
  };

  const handleMoreOptions = (song) => {
    navigate(`/song/${song.id}`);
  };

  const handleLike = (song) => {
    console.log('❤️ Like:', song.title);
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
      <Hero onUploadClick={() => setUploadModalOpen(true)} />
      {showMiniPlayer && <FloatingMiniPlayer player={player} onClose={() => setShowMiniPlayer(false)} theme={theme} />}

      <Container maxWidth="lg" sx={{ px: { xs: 1.5, md: 3 } }}>
        {/* Indicador flotante de Tus Beats */}
        {selectedSongs.length > 0 && (
          <Badge badgeContent={selectedSongs.length} color="primary" sx={{ position: 'fixed', top: 60, right: 16, zIndex: 1300, cursor: 'pointer' }} onClick={() => selectedSongsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <MusicNoteIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
          </Badge>
        )}

        {/* Barra de búsqueda */}
        <Box ref={searchBarRef} sx={{ maxWidth: 600, mx: "auto", mb: 4, position: "relative" }}>
          <Paper elevation={0} sx={{ borderRadius: "12px", bgcolor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900], border: `1px solid ${theme.palette.divider}` }}>
            <SearchBar query={query} onQueryChange={setQuery} loading={loading} autoFocus={!isMobile} placeholder="Buscar canciones, artistas..." />
          </Paper>
          {showResults && (
            <Fade in timeout={200}>
              <Box ref={resultsRef} sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1400, mt: 1 }}>
                <SearchResults results={structuredResults} loading={loading} error={error?.message} isOpen={showResults} onClose={() => setShowResults(false)} onSelect={handleSelectResult} />
              </Box>
            </Fade>
          )}
        </Box>

        {/* Tus Beats - Sección premium */}
        {selectedSongs.length > 0 && (
          <Box ref={selectedSongsRef} sx={{ mb: 6 }}>
            <SongCarousel 
              songs={selectedSongs} 
              title="TUS BEATS"
              subtitle=""
              onRemoveSong={handleRemoveSong} 
              showRemoveButton={true} 
              variant="featured"
              onPlayAll={handlePlaySelectedSongs}
              onShuffle={handleShuffleSelectedSongs}
              showViewMore={true}
              initialLimit={8}
              loading={false}
            />
          </Box>
        )}

        {/* Artistas */}
        {!artistsLoading && artists.length > 0 && <ArtistCarouselHorizontal artists={artists} title="" loading={artistsLoading} />}

        {/* Separador decorativo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <Box sx={{ width: '30px', height: '1px', bgcolor: alpha(theme.palette.primary.main, 0.2) }} />
          <Typography sx={{ color: alpha(theme.palette.primary.main, 0.3), px: 1 }}>◈</Typography>
          <Box sx={{ width: '30px', height: '1px', bgcolor: alpha(theme.palette.primary.main, 0.2) }} />
        </Box>

        {/* SECCIÓN DE DESCUBRIMIENTO PRINCIPAL */}
        <div id="discovery-sections">
          
          {/* Géneros */}
          {!discovery.genres.isLoading && discovery.genres.data?.data?.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
                <MusicNoteIcon sx={{ color: theme.palette.primary.main, mr: 1 }} /> 
                Explorar por Géneros
              </Typography>
              <GenreCarousel 
                genres={discovery.genres.data.data} 
                onGenreClick={(genre) => navigate(`/genre/${encodeURIComponent(genre.name)}`)} 
              />
            </Box>
          )}

          {/* ⭐ PLAYLISTS CURADAS - VERSIÓN SMART HUB ⭐ */}
          <PlaylistsSection onPlayPlaylist={handlePlayCuratedPlaylist} />

          {/* Tendencias */}
          <Box sx={{ position: 'relative', mb: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Tooltip title="Reproducir todas las tendencias" arrow>
                <IconButton
                  size="small"
                  onClick={() => handlePlaySection(discovery.trending?.data?.data || [], "Tendencias")}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <PlayCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
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
          </Box>

          {/* Más Escuchadas */}
          <Box sx={{ position: 'relative', mb: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Tooltip title="Reproducir todas las más escuchadas" arrow>
                <IconButton
                  size="small"
                  onClick={() => handlePlaySection(discovery.plays?.data?.data || [], "Más Escuchadas")}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <PlayCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <DiscoverySection
              title="Más Escuchadas"
              subtitle="Lo que más se escucha"
              icon={<PlayCircle />}
              queryResult={discovery.plays}
              limit={20}
              onPlay={handlePlaySong}
              onLike={handleLike}
              onMore={handleMoreOptions}
              onSongClick={(song) => navigate(`/song/${song.id}`)}
            />
          </Box>

          {/* Novedades */}
          <Box sx={{ position: 'relative', mb: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Tooltip title="Reproducir todas las novedades" arrow>
                <IconButton
                  size="small"
                  onClick={() => handlePlaySection(discovery.recent?.data?.data || [], "Novedades")}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <PlayCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <DiscoverySection
              title="Novedades"
              subtitle="Las más nuevas"
              icon={<AccessTime />}
              queryResult={discovery.recent}
              limit={20}
              showIndex={false}
              onPlay={handlePlaySong}
              onLike={handleLike}
              onMore={handleMoreOptions}
              onSongClick={(song) => navigate(`/song/${song.id}`)}
            />
          </Box>
        </div>

        {/* Componentes adicionales */}
        <RandomSongsDisplay />
        <ArtistCarousel />
        <PopularSongs />

        {/* Footer */}
        <Box sx={{ mt: 5, pt: 3, pb: 2, textAlign: 'center', borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.8) }}>
            EL SONIDO ES NUESTRO
          </Typography>
        </Box>

        {/* Notificaciones */}
        <Snackbar open={showCacheNotification} autoHideDuration={2000} onClose={() => setShowCacheNotification(false)}>
          <Alert severity="info" sx={{ fontSize: '0.8rem' }}>📦 Resultados desde caché • {searchMetrics?.time}ms</Alert>
        </Snackbar>
        <Snackbar open={showLimitNotification} autoHideDuration={2000} onClose={() => setShowLimitNotification(false)}>
          <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>🎵 Máximo {MAX_SELECTED_SONGS} canciones</Alert>
        </Snackbar>
        <Snackbar open={showAddNotification} autoHideDuration={1500} onClose={() => setShowAddNotification(false)}>
          <Alert severity="success" sx={{ fontSize: '0.8rem' }}>✅ {newlyAddedSong?.title}</Alert>
        </Snackbar>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity="info" sx={{ fontSize: '0.8rem' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>

      {/* FAB para subir música */}
      <Fade in={showFab} timeout={800}>
        <Tooltip title="Subir mi música" placement="left">
          <Fab onClick={() => setUploadModalOpen(true)} sx={{ position: 'fixed', bottom: { xs: 16, md: 24 }, right: { xs: 16, md: 24 }, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`, color: 'white', '&:hover': { transform: 'scale(1.05)' } }}>
            <CloudUploadIcon />
          </Fab>
        </Tooltip>
      </Fade>

      {/* Dialog de confirmación premium */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, songId: null, title: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.95)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DeleteSweepIcon color="error" />
            <Typography variant="h6" fontWeight={700}>Eliminar canciones</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            ¿Estás seguro de que deseas eliminar <strong>{confirmDialog.title || 'esta canción'}</strong>?
          </Typography>
          {confirmDialog.songId === 'ALL' && selectedSongs.length > 0 && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Esta acción eliminará las {selectedSongs.length} canciones de tu lista.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setConfirmDialog({ open: false, songId: null, title: '' })}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDialog.songId === 'ALL' ? handleConfirmClearAll : handleConfirmRemoveSong}
            variant="contained"
            color="error"
            startIcon={<DeleteSweepIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <UploadModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
    </Box>
  );
};

export default MainPage;