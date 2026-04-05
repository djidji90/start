// src/components/profile/ArtistProfile.jsx
// VERSIÓN LIMPIA - PLAYLIST AUTOMÁTICA POR DEFECTO
// ✅ Sin botones redundantes
// ✅ Al hacer click en una canción → playlist con todas las canciones del artista
// ✅ SongCard mantiene toda su funcionalidad original
// ============================================

import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Alert,
  Fade,
  Button,
  Paper,
  Typography,
  alpha,
  Slide,
  IconButton,
  useTheme,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import { AuthContext } from '../../components/hook/UseAut';
import useProfileData from '../../components/hook/services/useProfileData';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileSongs from '../../components/profile/ProfileSongs';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton';
import UserNotFound from '../../components/profile/UserNotFound';
import MetaTags from '../../components/profile/MetaTags';

// 🆕 Import del sistema de reproducción
import { usePlayer } from '../../components/PlayerContext';

const LOGIN_ROUTE = '/login';

const ArtistProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { isAuthenticated } = useContext(AuthContext);
  
  // Hook del reproductor
  const player = usePlayer();

  const [sortBy, setSortBy] = useState('popular');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const {
    profile,
    songs,
    stats,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMoreSongs,
    sortSongs,
  } = useProfileData(username);

  // 🔍 Detectar origen de usuario
  const isExternalReferrer =
    !document.referrer ||
    (!document.referrer.includes(window.location.origin) &&
      document.referrer !== '');

  // 🔐 Control de prompt inteligente
  useEffect(() => {
    const visited = sessionStorage.getItem('visitedProfile');

    if (
      !isAuthenticated &&
      !promptDismissed &&
      !loading &&
      profile &&
      (isExternalReferrer || !visited)
    ) {
      const timer = setTimeout(() => {
        setShowLoginPrompt(true);
      }, 1800);

      return () => clearTimeout(timer);
    }

    sessionStorage.setItem('visitedProfile', 'true');
  }, [isAuthenticated, promptDismissed, loading, profile, isExternalReferrer]);

  // 🔐 Persistencia dismiss
  useEffect(() => {
    const lastDismissed = localStorage.getItem('loginPromptDismissed');

    if (lastDismissed) {
      const days =
        (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);

      if (days <= 7) {
        setPromptDismissed(true);
      } else {
        localStorage.removeItem('loginPromptDismissed');
      }
    }
  }, []);

  const handleLoginRedirect = () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate(LOGIN_ROUTE);
  };

  const handleDismissPrompt = () => {
    setShowLoginPrompt(false);
    setPromptDismissed(true);
    localStorage.setItem('loginPromptDismissed', Date.now().toString());
  };

  const handleSortChange = useCallback(
    (newSort) => {
      setSortBy(newSort);
      sortSongs(newSort);
    },
    [sortSongs]
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMoreSongs();
    }
  }, [hasMore, loadingMore, loadMoreSongs]);

  // ============================================
  // 🎯 REPRODUCCIÓN CON PLAYLIST AUTOMÁTICA (POR DEFECTO)
  // ============================================

  /**
   * Al hacer click en una canción:
   * 1. Crea playlist con TODAS las canciones del artista
   * 2. Comienza reproduciendo desde la canción seleccionada
   * 3. El usuario puede navegar siguiente/anterior automáticamente
   */
const handlePlaySong = useCallback((song) => {
  console.log('🎵 [ArtistProfile] handlePlaySong llamado con:', song?.title);
  console.log('🎵 [ArtistProfile] songs disponibles:', songs.length);
  
  if (!song?.id) {
    console.log('❌ [ArtistProfile] No hay song.id');
    return;
  }

  if (!isAuthenticated) {
    console.log('🔒 [ArtistProfile] Usuario no autenticado');
    setSnackbar({
      open: true,
      message: '🔒 Inicia sesión para escuchar música'
    });
    return;
  }

  const songIndex = songs.findIndex(s => s.id === song.id);
  console.log('🎵 [ArtistProfile] songIndex:', songIndex);
  
  if (songIndex !== -1 && songs.length > 0) {
    const playlistSongs = songs.slice(songIndex);
    console.log('🎵 [ArtistProfile] Creando playlist con', playlistSongs.length, 'canciones');
    console.log('🎵 [ArtistProfile] Playlist:', playlistSongs.map(s => s.title));
    
    player.setPlaylistAndPlay(playlistSongs, 0, true);
  } else {
    console.log('🎵 [ArtistProfile] Reproduciendo solo:', song.title);
    player.playSong(song);
  }
}, [songs, player, isAuthenticated]);

  // ⏳ Loading
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProfileSkeleton />
      </Container>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // 👤 Usuario no encontrado
  if (!profile) {
    return <UserNotFound username={username} />;
  }

  return (
    <>
      <MetaTags profile={profile} username={username} />

      {/* 🔥 LOGIN PROMPT PREMIUM */}
      <Slide direction="down" in={showLoginPrompt} mountOnEnter unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1200,
            mx: 'auto',
            maxWidth: 680,
            mt: 1,
            mb: 2,
            borderRadius: 4,
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.95)} 0%, 
              ${alpha(theme.palette.primary.dark, 0.95)} 100%)`,
            border: `1px solid ${alpha('#fff', 0.2)}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <Box sx={{ p: 2.2, position: 'relative' }}>
            <IconButton
              size="small"
              onClick={handleDismissPrompt}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: alpha('#fff', 0.7),
                '&:hover': {
                  color: '#fff',
                  bgcolor: alpha('#fff', 0.1),
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: alpha('#fff', 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LoginIcon sx={{ color: '#fff' }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ color: '#fff', fontWeight: 700 }}
                >
                  🎧 Descubre el sonido de Guinea Ecuatorial
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: alpha('#fff', 0.85) }}
                >
                  Escucha música, guarda favoritos y apoya a los artistas
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="small"
                onClick={handleLoginRedirect}
                sx={{
                  bgcolor: '#fff',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  borderRadius: 3,
                  px: 2.5,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.9),
                  },
                }}
              >
                Entrar ahora
              </Button>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* CONTENIDO */}
      <Fade in timeout={500}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ProfileHeader profile={profile} isOwner={false} />

          <ProfileStats stats={stats} genres={stats.genres} />

          {/* 🔒 Mensaje contextual para no autenticados */}
          {!isAuthenticated && songs.length > 0 && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 3,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: '#555' }}>
                🔒 Inicia sesión para escuchar música completa
              </Typography>

              <Button
                size="small"
                onClick={handleLoginRedirect}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                Iniciar sesión
              </Button>
            </Box>
          )}

          {/* 
            ✅ ProfileSongs - Internamente usa SongCard
            ✅ Le pasamos onPlaySong para que al hacer click en una canción
               se active la playlist automática
            ✅ SongCard mantiene toda su funcionalidad original
          */}
          <ProfileSongs
            songs={songs}
            currentSort={sortBy}
            onSortChange={handleSortChange}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            loading={loading}
            loadingMore={loadingMore}
            onPlaySong={handlePlaySong}
          />
        </Container>
      </Fade>

      {/* Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ArtistProfile;