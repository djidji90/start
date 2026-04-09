// ======================================================
// COMPONENTE: MetaTags.jsx
// DESCRIPCIÓN: SEO y meta tags dinámicos para perfiles
// VERSIÓN: PRODUCCIÓN - Estable y optimizada
// ======================================================

import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

// ==================== CONFIGURACIÓN ====================
const CONFIG = {
  SITE_NAME: 'DjidjiMusic',
  SITE_TWITTER: '@DjidjiMusic',
  THEME_COLOR: '#3B82F6',
  DEFAULT_BIO: `Artista en DjidjiMusic. 
    Descubre su música y apoya el talento de Guinea Ecuatorial.`,
  TWITTER_CARD: 'summary_large_image',
  OG_LOCALE: 'es_ES',
  OG_TYPE: 'profile',
  // ✅ Imagen por defecto (web-app-manifest-192x192.png)
  DEFAULT_AVATAR: '/web-app-manifest-192x192.png',
  // ✅ Tamaño optimizado para redes sociales
  OG_IMAGE_WIDTH: '1200',
  OG_IMAGE_HEIGHT: '630',
};

// ==================== UTILIDADES ====================
const cleanText = (text, maxLength = 160) => {
  const cleaned = text.replace(/\s+/g, ' ').replace(/[<>]/g, '').trim();
  return cleaned.length > maxLength 
    ? `${cleaned.substring(0, maxLength - 3)}...` 
    : cleaned;
};

const getValidImageUrl = (url) => {
  // ✅ Usar imagen por defecto si no hay avatar
  if (!url || url === '') return CONFIG.DEFAULT_AVATAR;
  
  // Si ya es una URL absoluta
  if (url.startsWith('http')) return url;
  
  // Si es una URL relativa
  if (process.env.NODE_ENV === 'development') {
    return url.startsWith('/') ? url : `/${url}`;
  }
  
  if (process.env.REACT_APP_API_URL) {
    return `${process.env.REACT_APP_API_URL}${url.startsWith('/') ? url : `/${url}`}`;
  }
  
  return url.startsWith('/') ? url : `/${url}`;
};

// ✅ URL base dinámica (más segura para producción)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://djidjimusic.com';
};

// ==================== COMPONENTE PRINCIPAL ====================
const MetaTags = ({ profile, username }) => {
  // ---------- EXTRACCIÓN DE DATOS ----------
  const fullName = profile?.full_name || username;
  const rawBio = profile?.profile?.bio || CONFIG.DEFAULT_BIO;
  const description = cleanText(rawBio);
  const avatarUrl = getValidImageUrl(profile?.profile?.avatar_url);
  const songsCount = profile?.profile?.songs_uploaded || 0;
  
  // ---------- URLs dinámicas ----------
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/perfil/${username}`;
  const pageTitle = `${fullName} | ${CONFIG.SITE_NAME}`;

  // ==================== RENDER ====================
  return (
    <Helmet>
      {/* ----- BÁSICOS ----- */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ----- OPEN GRAPH / FACEBOOK / WHATSAPP ----- */}
      <meta property="og:type" content={CONFIG.OG_TYPE} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={avatarUrl} />
      <meta property="og:image:alt" content={`Foto de perfil de ${fullName}`} />
      {/* ✅ Tamaño optimizado para redes sociales */}
      <meta property="og:image:width" content={CONFIG.OG_IMAGE_WIDTH} />
      <meta property="og:image:height" content={CONFIG.OG_IMAGE_HEIGHT} />
      <meta property="og:site_name" content={CONFIG.SITE_NAME} />
      <meta property="og:locale" content={CONFIG.OG_LOCALE} />

      {/* ----- TWITTER ----- */}
      <meta name="twitter:card" content={CONFIG.TWITTER_CARD} />
      <meta name="twitter:site" content={CONFIG.SITE_TWITTER} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={avatarUrl} />
      <meta name="twitter:image:alt" content={`Foto de perfil de ${fullName}`} />

      {/* ----- DATOS DE PERFIL ----- */}
      <meta property="profile:username" content={username} />
      {profile?.full_name && (
        <meta property="profile:full_name" content={profile.full_name} />
      )}

      {/* ----- ESTADÍSTICAS DEL PERFIL (opcional) ----- */}
      {songsCount > 0 && (
        <meta name="profile:songs_count" content={songsCount} />
      )}

      {/* ----- DISPOSITIVOS MÓVILES ----- */}
      <meta name="theme-color" content={CONFIG.THEME_COLOR} />
      
      {/* ----- GEO LOCALIZACIÓN ----- */}
      <meta name="geo.region" content="GQ" />

      {/* ----- SCHEMA.ORG ESTRUCTURADO ----- */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": fullName,
          "url": canonicalUrl,
          "image": avatarUrl,
          "description": description,
          "nationality": "Equatorial Guinea",
          "knowsLanguage": "Spanish",
          ...(songsCount > 0 && {
            "additionalProperty": {
              "@type": "PropertyValue",
              "name": "songsPublished",
              "value": songsCount
            }
          })
        })}
      </script>
      
      {/* ----- PRECONNECT para mejorar rendimiento ----- */}
      <link rel="preconnect" href="https://api.djidjimusic.com" />
      <link rel="dns-prefetch" href="https://api.djidjimusic.com" />
    </Helmet>
  );
};

// ==================== PROPTYPES ====================
MetaTags.propTypes = {
  profile: PropTypes.shape({
    full_name: PropTypes.string,
    profile: PropTypes.shape({
      bio: PropTypes.string,
      avatar_url: PropTypes.string,
      songs_uploaded: PropTypes.number,
    }),
  }),
  username: PropTypes.string.isRequired,
};

export default MetaTags;