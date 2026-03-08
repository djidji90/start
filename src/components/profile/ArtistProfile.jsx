// src/components/profile/ArtistProfile.jsx
import React, { useState } from 'react';
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
import MetaTags from '../../components/profile/MetaTags'; // 👈 IMPORTAR META TAGS

const ArtistProfile = () => {
  const { username } = useParams();
  const [sortBy, setSortBy] = useState('popular');
  
  const {
    profile,
    songs,
    stats,
    loading,
    error,
    hasMore,
    loadAllPages,
    sortSongs,
    refresh
  } = useProfileData(username);

  // Manejar cambio de ordenamiento
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    sortSongs(newSort);
  };

  // Manejar carga de más canciones
  const handleLoadMore = () => {
    loadAllPages();
  };

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
      {/* 🏷️ META TAGS DINÁMICOS PARA COMPARTIR EN REDES */}
      <MetaTags profile={profile} username={username} />
      
      <Fade in timeout={500}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Cabecera */}
          <ProfileHeader 
            profile={profile}
            isOwner={false} // TODO: Implementar lógica de autenticación
          />

          {/* Estadísticas */}
          <ProfileStats 
            stats={stats} 
            genres={stats.genres}
          />

          {/* Canciones */}
          <ProfileSongs
            songs={songs}
            currentSort={sortBy}
            onSortChange={handleSortChange}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            loading={loading}
          />
        </Container>
      </Fade>
    </>
  );
};

export default ArtistProfile;