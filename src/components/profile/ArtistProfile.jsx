// src/components/profile/ArtistProfile.jsx
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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import { AuthContext } from '../../components/hook/UseAut'; // 👈 IMPORTAR CONTEXTO
import useProfileData from '../../components/hook/services/useProfileData';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileSongs from '../../components/profile/ProfileSongs';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton';
import UserNotFound from '../../components/profile/UserNotFound';
import MetaTags from '../../components/profile/MetaTags';

const ArtistProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  
  // 👈 USAR CONTEXTO DIRECTAMENTE
  const { isAuthenticated } = useContext(AuthContext);
  
  const [sortBy, setSortBy] = useState('popular');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

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

  // Detectar si viene de enlace externo y no está autenticado
  useEffect(() => {
    // Verificar si el usuario llegó desde un enlace externo (WhatsApp, Telegram, etc.)
    const isExternalReferrer = !document.referrer || 
      (!document.referrer.includes(window.location.origin) && document.referrer !== '');
    
    // Mostrar prompt solo si:
    // 1. No está autenticado
    // 2. No ha sido dismissado antes en esta sesión
    // 3. (Opcional) Viene de enlace externo o es su primera visita
    if (!isAuthenticated && !promptDismissed && !loading && profile) {
      // Pequeño delay para no interrumpir la carga inicial
      const timer = setTimeout(() => {
        setShowLoginPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, promptDismissed, loading, profile]);

  const handleLoginRedirect = () => {
    // Guardar la URL actual para volver después del login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/Login'); // Ajusta la ruta de login según tu app
  };

  const handleDismissPrompt = () => {
    setShowLoginPrompt(false);
    setPromptDismissed(true);
    // Opcional: guardar en localStorage para no mostrar en mucho tiempo
    localStorage.setItem('loginPromptDismissed', Date.now().toString());
  };

  // Verificar si ya dismissió antes (persistente)
  useEffect(() => {
    const lastDismissed = localStorage.getItem('loginPromptDismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      // Si han pasado más de 7 días, mostrar de nuevo
      if (daysSinceDismissed > 7) {
        localStorage.removeItem('loginPromptDismissed');
      } else {
        setPromptDismissed(true);
      }
    }
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    sortSongs(newSort);
  }, [sortSongs]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMoreSongs();
    }
  }, [hasMore, loadingMore, loadMoreSongs]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProfileSkeleton />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return <UserNotFound username={username} />;
  }

  return (
    <>
      <MetaTags profile={profile} username={username} />

      {/* Banner de autenticación - No intrusivo y elegante */}
      <Slide direction="down" in={showLoginPrompt} mountOnEnter unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            mx: 'auto',
            maxWidth: 600,
            mt: 1,
            mb: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.95)} 0%, ${alpha('#2563EB', 0.95)} 100%)`,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ p: 2, position: 'relative' }}>
            <IconButton
              size="small"
              onClick={handleDismissPrompt}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 4 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LoginIcon sx={{ color: 'white' }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                  🎵 ¿Quieres escuchar música?
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                  Inicia sesión para reproducir canciones y guardar tus favoritos
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="small"
                onClick={handleLoginRedirect}
                sx={{
                  bgcolor: 'white',
                  color: '#3B82F6',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  }
                }}
              >
                Iniciar sesión
              </Button>
            </Box>
          </Box>
        </Paper>
      </Slide>

      <Fade in timeout={500}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ProfileHeader 
            profile={profile}
            isOwner={false}
          />

          <ProfileStats 
            stats={stats} 
            genres={stats.genres}
          />

          {/* Mensaje contextual en las canciones si no está autenticado */}
          {!isAuthenticated && songs.length > 0 && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#3B82F6', 0.05),
                border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: '#666' }}>
                🔒 Las canciones se mostrarán, pero necesitas iniciar sesión para reproducirlas
              </Typography>
              <Button
                size="small"
                onClick={handleLoginRedirect}
                sx={{
                  color: '#3B82F6',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Iniciar sesión
              </Button>
            </Box>
          )}

          <ProfileSongs
            songs={songs}
            currentSort={sortBy}
            onSortChange={handleSortChange}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            loading={loading}
            loadingMore={loadingMore}
          />
        </Container>
      </Fade>
    </>
  );
};

export default React.memo(ArtistProfile);