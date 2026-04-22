// src/components/profile/ArtistProfile.jsx
import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Alert,
  Fade,
  Button,
  Typography,
  alpha,
  useTheme,
  CircularProgress,
  Paper
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { AuthContext } from '../hook/UseAut';
import useArtistDetail from '../../components/hook/services/useArtistDetail';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileSongs from './ProfileSongs';
import MetaTags from './MetaTags';
import ProfileSkeleton from './ProfileSkeleton';

const ArtistProfile = () => {
  const { slug, username: legacyUsername } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated } = useContext(AuthContext);
  
  const identifier = slug || legacyUsername;
  const { artist: profile, loading, error } = useArtistDetail(identifier);

  const handleLoginRedirect = () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, color: 'error.main' }}>
            😕 {error}
          </Typography>
          <Button onClick={() => navigate('/artistas')} variant="contained">
            ← Explorar artistas
          </Button>
        </Paper>
      </Container>
    );
  }

  // 👤 Usuario no encontrado
  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Artista no encontrado
          </Typography>
          <Button onClick={() => navigate('/artistas')} variant="contained">
            ← Explorar artistas
          </Button>
        </Paper>
      </Container>
    );
  }

  // Preparar stats para ProfileStats
  const statsData = {
    totalSongs: profile.stats?.total_songs || profile.songs?.length || 0,
    totalPlays: profile.stats?.total_plays || 0,
    totalLikes: profile.stats?.total_likes || 0,
    totalDownloads: profile.stats?.total_downloads || 0,
    genres: []
  };

  return (
    <>
      <MetaTags profile={profile} username={profile.username} />

      <Fade in timeout={500}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Cabecera del perfil */}
          <ProfileHeader profile={profile} isOwner={false} />

          {/* Estadísticas */}
          <ProfileStats stats={statsData} genres={statsData.genres} />

          {/* Mensaje para no autenticados */}
          {!isAuthenticated && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 3,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LoginIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="body2">
                  🔒 Inicia sesión para escuchar música completa
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={handleLoginRedirect}
                sx={{ textTransform: 'none' }}
              >
                Iniciar sesión
              </Button>
            </Box>
          )}

          {/* Lista de canciones */}
          <ProfileSongs songs={profile.songs || []} loading={loading} />
        </Container>
      </Fade>
    </>
  );
};

export default ArtistProfile;