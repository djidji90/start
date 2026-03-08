// src/components/theme/musica/ArtistCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  alpha,
  useTheme,
  Tooltip,
  Stack
} from '@mui/material';
import { MusicNote } from '@mui/icons-material';

/**
 * Tarjeta horizontal para mostrar artista
 * @param {Object} artist - Datos del artista
 */
const ArtistCard = ({ artist }) => {
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
    navigate(`/perfil/${artist.username}`);
  };

  return (
    <Card
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${alpha(artistColor, 0.2)}`,
        boxShadow: isHovered 
          ? `0 4px 12px ${alpha(artistColor, 0.2)}`
          : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: artistColor,
          boxShadow: `0 8px 20px ${alpha(artistColor, 0.25)}`,
        },
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Avatar circular a la izquierda */}
      <Box sx={{ p: 1.5, pr: 1 }}>
        <Box
          sx={{
            position: 'relative',
            width: 56,
            height: 56,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2px solid ${isHovered ? artistColor : alpha(artistColor, 0.3)}`,
            boxShadow: isHovered ? `0 4px 12px ${alpha(artistColor, 0.3)}` : 'none',
            transition: 'all 0.2s ease',
          }}
        >
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
                bgcolor: alpha(artistColor, 0.8),
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
            >
              {getInitials()}
            </Box>
          )}
        </Box>
      </Box>

      {/* Contenido a la derecha */}
      <CardContent sx={{ 
        flex: 1, 
        p: 1.5, 
        pl: 0.5,
        '&:last-child': { pb: 1.5 }
      }}>
        <Stack spacing={0.5}>
          {/* Nombre y username */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.95rem',
                color: isHovered ? artistColor : 'text.primary',
                transition: 'color 0.2s ease',
              }}
            >
              {displayName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha('#000', 0.4),
                fontSize: '0.7rem',
              }}
            >
              @{artist.username}
            </Typography>
          </Box>

          {/* Badge de canciones y ubicación */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <MusicNote sx={{ fontSize: 12, color: artistColor }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {artist.songs_count} canciones
              </Typography>
            </Box>

            {artist.location && (
              <Typography variant="caption" sx={{ color: alpha('#000', 0.4) }}>
                📍 {artist.location}
              </Typography>
            )}
          </Box>

          {/* Bio corta si existe */}
          {artist.bio && (
            <Typography
              variant="caption"
              sx={{
                color: alpha('#000', 0.6),
                display: 'block',
                fontSize: '0.7rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 200,
              }}
            >
              {artist.bio}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;