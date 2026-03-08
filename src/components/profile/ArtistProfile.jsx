// src/components/profile/ArtistProfile.jsx
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Alert,
  Fade
} from '@mui/material';
import useProfileData from '../../components/hook/services/useProfileData';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileSongs from '../../components/profile/ProfileSongs';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton';
import UserNotFound from '../../components/profile/UserNotFound';
import MetaTags from '../../components/profile/MetaTags';

const ArtistProfile = () => {
  const { username } = useParams();
  const [sortBy, setSortBy] = useState('popular');

  // 🔥 Obtener loadingMore del hook
  const {
    profile,
    songs,
    stats,
    loading,
    loadingMore,  // ← NUEVO: estado para carga adicional
    error,
    hasMore,
    loadMoreSongs, // ← NUEVO: usar esta función en lugar de loadAllPages
    sortSongs,
  } = useProfileData(username);

  // Manejar cambio de ordenamiento
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    sortSongs(newSort);
  }, [sortSongs]);

  // 🔥 Manejar carga de más canciones (optimizado)
  const handleLoadMore = useCallback(() => {
    // Solo cargar si hay más y no está cargando actualmente
    if (hasMore && !loadingMore) {
      loadMoreSongs();
    }
  }, [hasMore, loadingMore, loadMoreSongs]);

  // Mostrar skeleton mientras carga
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProfileSkeleton />
      </Container>
    );
  }

  // Mostrar error si algo falla
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Mostrar página personalizada de usuario no encontrado
  if (!profile) {
    return <UserNotFound username={username} />;
  }

  return (
    <>
      {/* 🏷️ META TAGS DINÁMICOS */}
      <MetaTags profile={profile} username={username} />

      <Fade in timeout={500}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Cabecera */}
          <ProfileHeader 
            profile={profile}
            isOwner={false}
          />

          {/* Estadísticas */}
          <ProfileStats 
            stats={stats} 
            genres={stats.genres}
          />

          {/* Canciones - AHORA CON loadingMore */}
          <ProfileSongs
            songs={songs}
            currentSort={sortBy}
            onSortChange={handleSortChange}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            loading={loading}
            loadingMore={loadingMore}  // ← NUEVA PROP
          />
        </Container>
      </Fade>
    </>
  );
};

export default React.memo(ArtistProfile); 