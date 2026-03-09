// src/components/profile/MetaTags.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Componente para generar meta tags dinámicos para perfiles
 * @param {Object} profile - Datos del perfil
 * @param {string} username - Nombre de usuario
 */
const MetaTags = ({ profile, username }) => {
  // Datos del perfil
  const fullName = profile?.full_name || username;
  const bio = profile?.profile?.bio || `Artista en DjidjiMusic. Descubre su música y apoya el talento de Guinea Ecuatorial.`;
  // ✅ Usar la imagen local como respaldo
  const avatarUrl = profile?.profile?.avatar_url || '/web-app-icon-192-v2.png';
  const songsCount = profile?.profile?.songs_uploaded || 0;
  
  // URL canónica
  const canonicalUrl = `https://djidjimusic.com/perfil/${username}`;
  
  // Título y descripción
  const title = `${fullName} | DjidjiMusic`;
  const description = bio.length > 160 
    ? `${bio.substring(0, 157)}...` 
    : bio;

  return (
    <Helmet>
      {/* Básicos */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={avatarUrl} />
      <meta property="og:image:alt" content={`Foto de perfil de ${fullName}`} />
      <meta property="og:site_name" content="DjidjiMusic" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={avatarUrl} />
      <meta name="twitter:image:alt" content={`Foto de perfil de ${fullName}`} />
      
      {/* Datos adicionales del perfil */}
      <meta property="profile:username" content={username} />
      {profile?.full_name && <meta property="profile:full_name" content={profile.full_name} />}
      
      {/* WhatsApp / Telegram (usan Open Graph) */}
      <meta property="og:locale" content="es_ES" />
      
      {/* Para dispositivos móviles */}
      <meta name="theme-color" content="#3B82F6" />
    </Helmet>
  );
};

export default MetaTags;