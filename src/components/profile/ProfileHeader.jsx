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
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ShareButton from '../../components/profile/ShareButton'; // 👈 IMPORTAR SHARE BUTTON

/**
 * Componente para mostrar la cabecera del perfil de usuario/artista
 * @param {Object} profile - Datos del perfil (de uploaded_by)
 * @param {boolean} isOwner - Si el perfil visto es del usuario actual
 * @param {Function} onEdit - Función para editar perfil (solo si isOwner)
 */
const ProfileHeader = ({ profile, isOwner = false, onEdit }) => {
  const theme = useTheme();

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  /**
   * Obtener iniciales del nombre de usuario
   */
  const getInitials = () => {
    if (profile?.full_name && profile.full_name !== '') {
      return profile.full_name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.username?.substring(0, 2).toUpperCase() || '?';
  };

  /**
   * Formatear fecha de registro
   */
  const formatJoinDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM yyyy", { locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  /**
   * Obtener nombre para mostrar
   */
  const getDisplayName = () => {
    if (profile?.full_name && profile.full_name !== '') {
      return profile.full_name;
    }
    return profile?.username || 'Usuario';
  };

  // ============================================
  // RENDER
  // ============================================

  if (!profile) return null;

  const primaryColor = theme.palette.primary.main;

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
        {/* Botón de edición (solo si es el dueño) */}
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
                '&:hover': {
                  bgcolor: alpha(primaryColor, 0.2),
                }
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
            src={profile.profile?.avatar_url}
            alt={getDisplayName()}
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
            {!profile.profile?.avatar_url && getInitials()}
          </Avatar>

          {/* Información */}
          <Box sx={{
            flex: 1,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            {/* Nombre y username */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5,
                fontSize: { xs: '1.8rem', sm: '2.2rem' }
              }}
            >
              {getDisplayName()}
            </Typography>

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
            {profile.profile?.bio && (
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  maxWidth: 600,
                  lineHeight: 1.6,
                }}
              >
                {profile.profile.bio}
              </Typography>
            )}

            {/* Metadata chips + Share Button */}
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'center',
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              {/* Ubicación */}
              {profile.profile?.location && (
                <Chip
                  icon={<LocationOn sx={{ fontSize: 16 }} />}
                  label={profile.profile.location}
                  size="small"
                  sx={{
                    bgcolor: alpha(primaryColor, 0.1),
                    color: primaryColor,
                    '& .MuiChip-icon': { color: primaryColor }
                  }}
                />
              )}

              {/* Website */}
              {profile.profile?.website && (
                <Chip
                  icon={<LinkIcon sx={{ fontSize: 16 }} />}
                  label={profile.profile.website.replace(/^https?:\/\//, '')}
                  size="small"
                  component="a"
                  href={profile.profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                  sx={{
                    bgcolor: alpha(primaryColor, 0.1),
                    color: primaryColor,
                    '& .MuiChip-icon': { color: primaryColor },
                    '&:hover': {
                      bgcolor: alpha(primaryColor, 0.2),
                    }
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

              {/* 🔥 BOTÓN DE COMPARTIR */}
              <ShareButton profile={profile} username={profile.username} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileHeader;