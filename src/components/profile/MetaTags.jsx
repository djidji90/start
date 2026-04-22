// src/components/profile/MetaTags.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const CONFIG = {
  SITE_NAME: 'DjidjiMusic',
  SITE_TWITTER: '@DjidjiMusic',
  THEME_COLOR: '#FF4D4D',
  DEFAULT_BIO: 'Artista en DjidjiMusic. Descubre su música y apoya el talento de Guinea Ecuatorial.',
  TWITTER_CARD: 'summary_large_image',
  OG_LOCALE: 'es_ES',
  OG_TYPE: 'profile',
  DEFAULT_AVATAR: '/web-app-manifest-192x192.png',
  OG_IMAGE_WIDTH: '1200',
  OG_IMAGE_HEIGHT: '630',
};

const cleanText = (text, maxLength = 160) => {
  if (!text) return CONFIG.DEFAULT_BIO;
  const cleaned = text.replace(/\s+/g, ' ').replace(/[<>]/g, '').trim();
  return cleaned.length > maxLength 
    ? `${cleaned.substring(0, maxLength - 3)}...` 
    : cleaned;
};

const getValidImageUrl = (url) => {
  if (!url || url === '') return CONFIG.DEFAULT_AVATAR;
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://djidjimusic.com';
};

const MetaTags = ({ profile, username }) => {
  // 🆕 Datos planos del nuevo endpoint SEO
  const fullName = profile?.full_name || profile?.name || username;
  const rawBio = profile?.bio || CONFIG.DEFAULT_BIO;
  const description = cleanText(rawBio);
  const avatarUrl = getValidImageUrl(profile?.avatar_url);
  const songsCount = profile?.songs_count || 0;
  
  // 🆕 URL con slug (prioridad) o username (fallback)
  const baseUrl = getBaseUrl();
  const profileSlug = profile?.slug || username;
  const canonicalUrl = `${baseUrl}/perfil/${profileSlug}`;
  const pageTitle = `${fullName} | ${CONFIG.SITE_NAME}`;

  // Construir ubicación para Schema.org
  const location = [profile?.city, profile?.country].filter(Boolean).join(', ');

  return (
    <Helmet>
      {/* Básicos */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={CONFIG.OG_TYPE} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={avatarUrl} />
      <meta property="og:image:alt" content={`Foto de perfil de ${fullName}`} />
      <meta property="og:image:width" content={CONFIG.OG_IMAGE_WIDTH} />
      <meta property="og:image:height" content={CONFIG.OG_IMAGE_HEIGHT} />
      <meta property="og:site_name" content={CONFIG.SITE_NAME} />
      <meta property="og:locale" content={CONFIG.OG_LOCALE} />

      {/* Twitter */}
      <meta name="twitter:card" content={CONFIG.TWITTER_CARD} />
      <meta name="twitter:site" content={CONFIG.SITE_TWITTER} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={avatarUrl} />
      <meta name="twitter:image:alt" content={`Foto de perfil de ${fullName}`} />

      {/* Profile data */}
      <meta property="profile:username" content={username} />
      {fullName && <meta property="profile:full_name" content={fullName} />}
      {songsCount > 0 && <meta name="profile:songs_count" content={String(songsCount)} />}

      {/* Mobile */}
      <meta name="theme-color" content={CONFIG.THEME_COLOR} />
      <meta name="geo.region" content="GQ" />

      {/* Schema.org estructurado */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": fullName,
          "url": canonicalUrl,
          "image": avatarUrl,
          "description": description,
          "nationality": "Equatorial Guinea",
          ...(location && {
            "homeLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": profile?.city || '',
                "addressCountry": profile?.country || 'GQ'
              }
            }
          }),
          ...(songsCount > 0 && {
            "additionalProperty": {
              "@type": "PropertyValue",
              "name": "songsPublished",
              "value": songsCount
            }
          })
        })}
      </script>
      
      {/* Preconnect para rendimiento */}
      <link rel="preconnect" href="https://api.djidjimusic.com" />
      <link rel="dns-prefetch" href="https://api.djidjimusic.com" />
    </Helmet>
  );
};

MetaTags.propTypes = {
  profile: PropTypes.shape({
    full_name: PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
    bio: PropTypes.string,
    avatar_url: PropTypes.string,
    songs_count: PropTypes.number,
    city: PropTypes.string,
    country: PropTypes.string,
  }),
  username: PropTypes.string.isRequired,
};

export default MetaTags;