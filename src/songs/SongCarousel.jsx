// ============================================
// src/components/songs/SongCarousel.jsx
// VERSIÓN OPTIMIZADA - COMPATIBLE CON MAINPAGE OSCURA
// ============================================

import React from "react";
import { 
  Grid, 
  Box, 
  Typography,
  IconButton,
  Tooltip,
  alpha
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SongCard from "../songs/SongCard";

// ============================================
// 🎨 IDENTIDAD VISUAL - MISMA QUE MAINPAGE
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.85)',
  textTertiary: 'rgba(255,255,255,0.65)',
  background: {
    dark: '#0A0A0A',
    medium: '#121212',
    light: '#1A1A1A',
    paper: 'rgba(30,30,30,0.9)'
  }
};

// ============================================
// 🎨 SOMBRAS UNIFORMES
// ============================================
const shadows = {
  small: (opacity = 0.2) => `0 4px 12px ${alpha('#000', opacity)}`,
  medium: (opacity = 0.25) => `0 8px 20px ${alpha('#000', opacity)}`,
  primary: (opacity = 0.3) => `0 8px 20px ${alpha(colors.primary, opacity)}`,
};

const SongCarousel = ({ 
  songs = [], 
  title,
  onRemoveSong,
  showRemoveButton = false,
  sx = {}
}) => {
  if (!songs.length) return null;

  const handleLike = (songId, liked) => {
    console.log(
      `❤️ Canción ${liked ? "liked" : "unliked"}:`,
      songId
    );
  };

  const handleMoreActions = (song) => {
    console.log("Más opciones:", song);
  };

  const handleRemoveClick = (songId, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (onRemoveSong && window.confirm("¿Eliminar esta canción de la lista?")) {
      onRemoveSong(songId);
    }
  };

  return (
    <Box sx={{ mb: 4, ...sx }}>
      {/* Header con título y contador */}
      {(title || showRemoveButton) && (
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${alpha(colors.primary, 0.2)}`,
          pb: 1.5
        }}>
          {title && (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.primary} 30%, ${colors.primaryLight} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: colors.primary, // fallback
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
              }}
            >
              {title}
            </Typography>
          )}

          {/* Contador de canciones - blanco con opacidad */}
          <Typography
            variant="body2"
            sx={{
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontWeight: 500,
              bgcolor: alpha(colors.primary, 0.1),
              px: 2,
              py: 0.5,
              borderRadius: 4,
              border: `1px solid ${alpha(colors.primary, 0.2)}`
            }}
          >
            {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
          </Typography>
        </Box>
      )}

      {/* Grid vertical responsivo */}
      <Grid container spacing={2}>
        {songs.map((song, index) => (
          <Grid 
            item 
            key={`${song.id}-${index}-${song.title || ''}-${song.artist || ''}`}
            xs={12}
            sm={6}
            md={4}
            lg={3}
          >
            <Box sx={{ 
              position: 'relative',
              height: '100%',
              '&:hover .remove-button': {
                opacity: 1,
                transform: 'translateY(0) scale(1)'
              }
            }}>
              {/* Botón eliminar - optimizado para fondo oscuro */}
              {showRemoveButton && onRemoveSong && (
                <Tooltip title="Eliminar de la lista" arrow>
                  <IconButton
                    className="remove-button"
                    onClick={(e) => handleRemoveClick(song.id, e)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 10,
                      backgroundColor: alpha(colors.background.dark, 0.8),
                      backdropFilter: 'blur(4px)',
                      color: colors.primary,
                      boxShadow: shadows.small(0.2),
                      border: `1px solid ${alpha(colors.primary, 0.3)}`,
                      opacity: 0,
                      transform: 'translateY(-4px) scale(0.9)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: colors.background.light,
                        opacity: 1,
                        transform: 'scale(1.1)',
                        color: colors.primaryLight,
                        borderColor: colors.primary,
                        boxShadow: shadows.primary(0.3)
                      }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* SongCard con estilos adaptados */}
              <SongCard
                song={song}
                variant="default"
                showIndex={index + 1}
                onLike={handleLike}
                onMoreActions={() => handleMoreActions(song)}
                sx={{
                  height: "100%",
                  bgcolor: colors.background.paper,
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha(colors.primary, 0.1)}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: shadows.medium(0.3),
                    borderColor: alpha(colors.primary, 0.3)
                  },
                  // Asegurar que los textos dentro de SongCard sean blancos
                  '& .MuiTypography-root': {
                    color: colors.textPrimary
                  },
                  '& .MuiTypography-secondary': {
                    color: colors.textSecondary
                  }
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SongCarousel;