// src/components/songs/SongCarousel.jsx - VERSIÓN PREMIUM
import React, { useState } from "react";
import { 
  Grid, 
  Box, 
  Typography,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  Paper,
  alpha,
  useTheme,
  Chip
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SongCard from "../songs/SongCard";

const SongCarousel = ({ 
  songs = [], 
  title,
  subtitle,
  onRemoveSong,
  showRemoveButton = false,
  onPlayAll,
  onShuffle,
  variant = "default", // "default", "compact", "featured"
  sx = {}
}) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const [hoveredSection, setHoveredSection] = useState(false);

  if (!songs.length) return null;

  // Configuración según variante
  const variants = {
    default: {
      spacing: 2,
      grid: { xs: 12, sm: 6, md: 4, lg: 3 },
      showCount: true,
      showActions: true,
      cardVariant: "default",
    },
    compact: {
      spacing: 1.5,
      grid: { xs: 6, sm: 4, md: 3, lg: 2.4 },
      showCount: false,
      showActions: false,
      cardVariant: "compact",
    },
    featured: {
      spacing: 2,
      grid: { xs: 12, sm: 6, md: 6, lg: 4 },
      showCount: true,
      showActions: true,
      cardVariant: "detailed",
    }
  };

  const config = variants[variant] || variants.default;

  const handleLike = (songId, liked) => {
    console.log(`❤️ Canción ${liked ? "liked" : "unliked"}:`, songId);
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
    <Fade in timeout={600}>
      <Box 
        sx={{ 
          mb: 6, 
          ...sx,
          position: 'relative',
          '&::before': variant === 'featured' ? {
            content: '""',
            position: 'absolute',
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
            background: `radial-gradient(circle at 70% 30%, ${alpha(primaryColor, 0.03)} 0%, transparent 70%)`,
            zIndex: 0,
            pointerEvents: 'none',
          } : {},
        }}
        onMouseEnter={() => setHoveredSection(true)}
        onMouseLeave={() => setHoveredSection(false)}
      >
        {/* Header premium */}
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          position: 'relative',
          zIndex: 2,
        }}>
          <Box>
            {title && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <QueueMusicIcon 
                  sx={{ 
                    color: primaryColor, 
                    fontSize: 28,
                    filter: hoveredSection ? `drop-shadow(0 4px 8px ${alpha(primaryColor, 0.3)})` : 'none',
                    transition: 'filter 0.3s ease',
                  }} 
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
                    background: `linear-gradient(135deg, ${primaryColor}, ${alpha(primaryColor, 0.7)})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {title}
                </Typography>
              </Box>
            )}
            
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: alpha('#000', 0.5),
                  fontWeight: 400,
                  fontSize: '0.9rem',
                  ml: 5,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Contador de canciones con diseño premium */}
            <Chip
              icon={<QueueMusicIcon sx={{ fontSize: 16 }} />}
              label={`${songs.length} ${songs.length === 1 ? 'canción' : 'canciones'}`}
              size="small"
              sx={{
                bgcolor: alpha(primaryColor, 0.08),
                color: primaryColor,
                fontWeight: 600,
                borderRadius: 2,
                '& .MuiChip-icon': { color: primaryColor },
              }}
            />

            {/* Acciones rápidas (solo en variantes que lo permitan) */}
            {config.showActions && (
              <Fade in timeout={300}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {onPlayAll && (
                    <Tooltip title="Reproducir todas" arrow>
                      <IconButton
                        size="small"
                        onClick={onPlayAll}
                        sx={{
                          bgcolor: alpha(primaryColor, 0.05),
                          color: primaryColor,
                          width: 36,
                          height: 36,
                          '&:hover': {
                            bgcolor: alpha(primaryColor, 0.15),
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onShuffle && (
                    <Tooltip title="Reproducir aleatorio" arrow>
                      <IconButton
                        size="small"
                        onClick={onShuffle}
                        sx={{
                          bgcolor: alpha(primaryColor, 0.05),
                          color: primaryColor,
                          width: 36,
                          height: 36,
                          '&:hover': {
                            bgcolor: alpha(primaryColor, 0.15),
                            transform: 'scale(1.1) rotate(20deg)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ShuffleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </Box>

        {/* Grid de canciones con animación de entrada */}
        <Grid 
          container 
          spacing={config.spacing}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {songs.map((song, index) => (
            <Grow 
              key={`${song.id}-${index}`}
              in={true}
              timeout={300 + (index * 50)}
            >
              <Grid item {...config.grid}>
                <Box sx={{ 
                  position: 'relative',
                  height: '100%',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                  '&:hover .remove-button': {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                  }
                }}>
                  {/* Badge de posición (opcional) */}
                  {config.showCount && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        zIndex: 15,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${primaryColor}, ${alpha(primaryColor, 0.7)})`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: `0 4px 8px ${alpha(primaryColor, 0.3)}`,
                        border: '2px solid white',
                      }}
                    >
                      {index + 1}
                    </Box>
                  )}

                  {/* Botón eliminar premium */}
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
                          bgcolor: alpha('#fff', 0.98),
                          color: '#d32f2f',
                          boxShadow: `0 4px 12px ${alpha('#000', 0.15)}`,
                          opacity: 0,
                          transform: 'translateY(-4px) scale(0.9)',
                          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          backdropFilter: 'blur(4px)',
                          border: `1px solid ${alpha('#d32f2f', 0.2)}`,
                          width: 32,
                          height: 32,
                          '&:hover': {
                            bgcolor: '#ffebee',
                            opacity: 1,
                            transform: 'scale(1.1)',
                            color: '#b71c1c',
                            boxShadow: `0 6px 16px ${alpha('#d32f2f', 0.3)}`,
                          }
                        }}
                      >
                        <ClearIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Card de canción */}
                  <SongCard
                    song={song}
                    variant={config.cardVariant}
                    showIndex={false}
                    onLike={handleLike}
                    onMoreActions={() => handleMoreActions(song)}
                  />
                </Box>
              </Grid>
            </Grow>
          ))}
        </Grid>

        {/* Mensaje cuando no hay canciones */}
        {songs.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: alpha(primaryColor, 0.02),
              border: `1px solid ${alpha(primaryColor, 0.1)}`,
            }}
          >
            <QueueMusicIcon sx={{ fontSize: 48, color: alpha('#000', 0.2), mb: 2 }} />
            <Typography variant="h6" sx={{ color: alpha('#000', 0.5), mb: 1 }}>
              No hay canciones en esta lista
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#000', 0.3) }}>
              Las canciones aparecerán aquí cuando las añadas
            </Typography>
          </Paper>
        )}
      </Box>
    </Fade>
  );
};

export default SongCarousel;