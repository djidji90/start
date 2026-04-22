// src/components/profile/ProfileHeader.jsx
import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  alpha,
  useTheme,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  Link as LinkIcon,
  CalendarToday,
  Edit as EditIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ShareButton from './ShareButton';

const ProfileHeader = ({ profile, isOwner = false, onEdit }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const getInitials = () => {
    const name = profile?.full_name || profile?.name;
    if (name && name !== '') {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.username?.substring(0, 2).toUpperCase() || '?';
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    try {
      const date = new Date(dateString);
      return format(date, "MMMM yyyy", { locale: es });
    } catch {
      return 'Fecha desconocida';
    }
  };

  const getDisplayName = () => {
    return profile?.full_name || profile?.name || profile?.username || 'Usuario';
  };

  // Construir ubicación desde city + country
  const getLocation = () => {
    return [profile?.city, profile?.country].filter(Boolean).join(', ');
  };

  // ============================================
  // RENDER
  // ============================================

  if (!profile) return null;

  const displayName = getDisplayName();
  const location = getLocation();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(primaryColor, 0.05)} 0%, ${alpha(primaryColor, 0.02)} 100%)`,
        border: `1px solid ${alpha(primaryColor, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoración de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha(primaryColor, 0.03),
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Botón de edición */}
        {isOwner && onEdit && (
          <Tooltip title="Editar perfil" arrow>
            <IconButton
              onClick={onEdit}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bgcolor: alpha(primaryColor, 0.1),
                color: primaryColor,
                '&:hover': { bgcolor: alpha(primaryColor, 0.2) }
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3,
        }}>
          {/* Avatar */}
          <Avatar
            src={profile.avatar_url}
            alt={displayName}
            sx={{
              width: { xs: 100, sm: 120 },
              height: { xs: 100, sm: 120 },
              border: `4px solid ${alpha(primaryColor, 0.2)}`,
              boxShadow: `0 8px 20px ${alpha(primaryColor, 0.2)}`,
              bgcolor: alpha(primaryColor, 0.1),
              color: primaryColor,
              fontSize: { xs: '2.5rem', sm: '3rem' },
              fontWeight: 600,
            }}
          >
            {!profile.avatar_url && getInitials()}
          </Avatar>

          {/* Información */}
          <Box sx={{
            flex: 1,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            {/* Nombre con badge de verificación */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.8rem', sm: '2.2rem' }
                }}
              >
                {displayName}
              </Typography>
              {profile.is_verified && (
                <Tooltip title="Artista Verificado" arrow>
                  <VerifiedIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                </Tooltip>
              )}
            </Box>

            <Typography
              variant="subtitle1"
              sx={{
                color: alpha(primaryColor, 0.8),
                fontWeight: 500,
                mb: 2,
              }}
            >
              @{profile.username}
            </Typography>

            {/* Bio */}
            {profile.bio && (
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  maxWidth: 600,
                  lineHeight: 1.6,
                }}
              >
                {profile.bio}
              </Typography>
            )}

            {/* Metadata chips */}
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'center',
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              {/* Ubicación */}
              {location && (
                <Chip
                  icon={<LocationOn sx={{ fontSize: 16 }} />}
                  label={location}
                  size="small"
                  sx={{
                    bgcolor: alpha(primaryColor, 0.1),
                    color: primaryColor,
                    '& .MuiChip-icon': { color: primaryColor }
                  }}
                />
              )}

              {/* Website (si existe) */}
              {profile.website && (
                <Chip
                  icon={<LinkIcon sx={{ fontSize: 16 }} />}
                  label={profile.website.replace(/^https?:\/\//, '')}
                  size="small"
                  component="a"
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                  sx={{
                    bgcolor: alpha(primaryColor, 0.1),
                    color: primaryColor,
                    '& .MuiChip-icon': { color: primaryColor },
                    '&:hover': { bgcolor: alpha(primaryColor, 0.2) }
                  }}
                />
              )}

              {/* Miembro desde */}
              <Chip
                icon={<CalendarToday sx={{ fontSize: 16 }} />}
                label={`Miembro desde ${formatJoinDate(profile.date_joined)}`}
                size="small"
                sx={{
                  bgcolor: alpha(primaryColor, 0.1),
                  color: primaryColor,
                  '& .MuiChip-icon': { color: primaryColor }
                }}
              />

              {/* Botón de compartir */}
              <ShareButton profile={profile} username={profile.username} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileHeader;