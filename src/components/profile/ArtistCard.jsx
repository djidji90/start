// src/components/theme/musica/ArtistCard.jsx
import React, { useState } from 'react';
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
import { MusicNote, Verified as VerifiedIcon } from '@mui/icons-material'; // ✅ AÑADIDO

/**
 * Tarjeta circular para mostrar artista (estilo Spotify)
 * @param {Object} artist - Datos del artista
 * @param {number} index - Índice para animación
 */
const ArtistCard = ({ artist, index = 0 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryColor = theme.palette.primary.main;

  // Color único basado en el username
  const getArtistColor = (username) => {
    const colors = [
      '#3B82F6', '#8B5CF6', '#EC4899', '#10B981',
      '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = ((hash << 5) - hash) + username.charCodeAt(i);
      hash = hash & hash;
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const artistColor = getArtistColor(artist.username);

  // Obtener iniciales
  const getInitials = () => {
    if (artist.name && artist.name !== artist.username) {
      const nameParts = artist.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
    }
    return artist.username.substring(0, 2).toUpperCase();
  };

  const displayName = artist.name || artist.username;

  const handleClick = () => {
    navigate(`/perfil/${artist.id}`);
  };

  return (
    <Fade in timeout={500 + index * 100}>
      <Box
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
        }}
      >
        {/* Contenedor circular - como Spotify */}
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
          {/* Imagen o iniciales */}
          {artist.avatar_url && !imageError ? (
            <Avatar
              src={artist.avatar_url}
              alt={displayName}
              onError={() => setImageError(true)}
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

          {/* ✅ BADGE DE VERIFICACIÓN EN EL CÍRCULO (esquina inferior derecha) */}
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
                <VerifiedIcon 
                  sx={{ 
                    fontSize: 18, 
                    color: '#3b82f6',
                    '&:hover': { transform: 'scale(1.1)' }
                  }} 
                />
              </Box>
            </Tooltip>
          )}

          {/* Overlay en hover - estilo Spotify */}
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
                transition: 'all 0.2s ease',
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
                  transform: 'scale(0.8)',
                  animation: 'scaleIn 0.2s ease forwards',
                  '@keyframes scaleIn': {
                    from: { transform: 'scale(0.8)', opacity: 0 },
                    to: { transform: 'scale(1)', opacity: 1 },
                  },
                }}
              >
                <MusicNote sx={{ color: 'white', fontSize: 24 }} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Información debajo del círculo */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 1.5, 
          width: '100%',
          px: 1
        }}>
          {/* ✅ Nombre del artista CON BADGE junto al nombre */}
          <Tooltip title={displayName} arrow placement="top">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 0.5,
              width: '100%'
            }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: isHovered ? artistColor : 'text.primary',
                  transition: 'color 0.2s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </Typography>
              {artist.is_verified && (
                <Tooltip title="Artista Verificado" arrow>
                  <VerifiedIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: '#3b82f6',
                      flexShrink: 0
                    }} 
                  />
                </Tooltip>
              )}
            </Box>
          </Tooltip>

          {/* Badge de canciones */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.3,
            mt: 0.5
          }}>
            <MusicNote sx={{ fontSize: 10, color: alpha('#000', 0.4) }} />
            <Typography variant="caption" sx={{ color: alpha('#000', 0.5), fontWeight: 500 }}>
              {artist.songs_count} canciones
            </Typography>
          </Box>

          {/* Username (opcional, pequeño) */}
          <Typography
            variant="caption"
            sx={{
              color: alpha('#000', 0.3),
              fontSize: '0.65rem',
              display: 'block',
              mt: 0.25,
            }}
          >
            @{artist.username}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default ArtistCard;