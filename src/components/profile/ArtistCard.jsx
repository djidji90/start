// src/components/theme/musica/ArtistCard.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Avatar,
  Box,
  alpha,
  useTheme,
  Tooltip,
  Fade
} from '@mui/material';
import { MusicNote, Verified as VerifiedIcon } from '@mui/icons-material';

// Colores fuera del componente para evitar recreación
const ARTIST_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#10B981',
  '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'
];

const getArtistColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) - hash) + username.charCodeAt(i);
    hash = hash & hash;
  }
  return ARTIST_COLORS[Math.abs(hash) % ARTIST_COLORS.length];
};

const ArtistCard = ({ artist, index = 0 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const artistColor = useMemo(() => getArtistColor(artist.username), [artist.username]);
  
  const displayName = useMemo(() => 
    artist.full_name || artist.name || artist.username,
    [artist.full_name, artist.name, artist.username]
  );
  
  const profileUrl = useMemo(() => 
    artist.slug 
      ? `/perfil/${artist.slug}` 
      : artist.username 
        ? `/perfil/${artist.username}` 
        : `/perfil/${artist.id}`,
    [artist.slug, artist.username, artist.id]
  );

  const getInitials = useCallback(() => {
    const name = artist.full_name || artist.name;
    if (name && name !== artist.username) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
    }
    return artist.username.substring(0, 2).toUpperCase();
  }, [artist.full_name, artist.name, artist.username]);

  const handleClick = useCallback(() => {
    navigate(profileUrl);
  }, [navigate, profileUrl]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleImageError = useCallback(() => setImageError(true), []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <Fade in timeout={500 + index * 100}>
      <Box
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Ver perfil de ${displayName}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          width: '100%',
          maxWidth: 180,
          mx: 'auto',
          transition: 'transform 0.2s ease',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          outline: 'none',
          '&:focus-visible': {
            boxShadow: `0 0 0 3px ${alpha(artistColor, 0.5)}`,
            borderRadius: '50%',
          },
        }}
      >
        {/* Contenedor circular */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1',
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: isHovered 
              ? `0 8px 20px ${alpha(artistColor, 0.4)}`
              : '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&::after': isHovered ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              boxShadow: `inset 0 0 0 2px ${alpha(artistColor, 0.5)}`,
              pointerEvents: 'none',
            } : {},
          }}
        >
          {artist.avatar_url && !imageError ? (
            <Avatar
              src={artist.avatar_url}
              alt={displayName}
              onError={handleImageError}
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${alpha(artistColor, 0.9)}, ${alpha(artistColor, 0.7)})`,
                color: 'white',
                fontSize: '2rem',
                fontWeight: 600,
              }}
            >
              {getInitials()}
            </Box>
          )}

          {artist.is_verified && (
            <Tooltip title="Artista Verificado" arrow placement="top">
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  bgcolor: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 2,
                }}
              >
                <VerifiedIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
              </Box>
            </Tooltip>
          )}

          {isHovered && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: alpha('#000', 0.3),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: alpha(artistColor, 0.9),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MusicNote sx={{ color: 'white', fontSize: 24 }} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Información */}
        <Box sx={{ textAlign: 'center', mt: 1.5, width: '100%', px: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.5,
            width: '100%'
          }}>
            <Tooltip title={displayName} arrow>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: isHovered ? artistColor : 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </Typography>
            </Tooltip>
            {artist.is_verified && (
              <Tooltip title="Verificado" arrow>
                <VerifiedIcon sx={{ fontSize: 16, color: '#3b82f6', flexShrink: 0 }} />
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, mt: 0.5 }}>
            <MusicNote sx={{ fontSize: 10, color: alpha('#000', 0.4) }} />
            <Typography variant="caption" sx={{ color: alpha('#000', 0.5), fontWeight: 500 }}>
              {artist.songs_count || 0} canciones
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{ color: alpha('#000', 0.3), fontSize: '0.65rem', display: 'block', mt: 0.25 }}
          >
            @{artist.username}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default React.memo(ArtistCard);