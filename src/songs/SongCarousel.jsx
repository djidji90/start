// src/components/songs/SongCarousel.jsx - VERSIÓN ULTRA COMPACTA
// ✅ Cards súper pequeñas
// ✅ Totalmente responsive
// ✅ Sin numeración
// ✅ Máxima densidad de información
// ============================================

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
  Chip,
  Skeleton,
  Button,
  useMediaQuery
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SongCard from "./SongCard";

const SongCarousel = ({ 
  songs = [], 
  title,
  subtitle,
  onRemoveSong,
  showRemoveButton = false,
  onPlayAll,
  onShuffle,
  loading = false,
  variant = "ultraCompact", // Ultra compacto por defecto
  showViewMore = true,
  initialLimit = 12,
  sx = {}
}) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const [hoveredSection, setHoveredSection] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  // Breakpoints responsive
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  // Configuración ULTRA COMPACTA según variante
  const variants = {
    ultraCompact: {
      spacing: 1, // Espaciado mínimo
      // Grid responsive: más columnas en cada dispositivo
      grid: {
        xs: 6,    // Móvil: 2 columnas
        sm: 4,    // Tablet pequeña: 3 columnas
        md: 3,    // Tablet: 4 columnas
        lg: 2.4,  // Desktop: 5 columnas
        xl: 2     // Desktop grande: 6 columnas
      },
      showCount: false,
      showActions: true,
      cardVariant: "compact", // SongCard compacto
    },
    compact: {
      spacing: 1.5,
      grid: {
        xs: 6,
        sm: 4,
        md: 3,
        lg: 3,
        xl: 2.4
      },
      showCount: false,
      showActions: true,
      cardVariant: "compact",
    },
    default: {
      spacing: 2,
      grid: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 3,
        xl: 3
      },
      showCount: false,
      showActions: true,
      cardVariant: "default",
    }
  };

  const config = variants[variant] || variants.ultraCompact;
  
  // Determinar cuántas columnas mostrar según el breakpoint actual
  const getGridColumns = () => {
    if (isMobile) return { xs: config.grid.xs };
    if (isTablet) return { xs: config.grid.sm };
    return config.grid;
  };
  
  const gridProps = getGridColumns();
  
  // Limitar canciones visibles
  const visibleSongs = showAll ? songs : songs.slice(0, initialLimit);
  const hasMoreSongs = songs.length > initialLimit && !showAll && showViewMore;

  const handleRemoveClick = (songId, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (onRemoveSong && window.confirm("¿Eliminar esta canción de la lista?")) {
      onRemoveSong(songId);
    }
  };

  const handleViewMore = () => {
    setShowAll(true);
  };

  // Skeleton loading - adaptado a las columnas responsive
  if (loading) {
    const skeletonCount = isMobile ? 4 : isTablet ? 6 : 8;
    return (
      <Box sx={{ mb: 6, ...sx }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Skeleton variant="text" width={200} height={40} />
            {subtitle && <Skeleton variant="text" width={150} height={24} />}
          </Box>
          <Skeleton variant="rounded" width={100} height={36} />
        </Box>
        <Grid container spacing={config.spacing}>
          {[...Array(skeletonCount)].map((_, index) => (
            <Grid item {...gridProps} key={index}>
              <Skeleton 
                variant="rounded" 
                height={isMobile ? 180 : 200} 
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!songs.length) return null;

  return (
    <Fade in timeout={600}>
      <Box 
        sx={{ 
          mb: 4, 
          ...sx,
          position: 'relative',
        }}
        onMouseEnter={() => setHoveredSection(true)}
        onMouseLeave={() => setHoveredSection(false)}
      >
        {/* Header ultra compacto */}
        <Box sx={{ 
          mb: 2.5, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          flexWrap: 'wrap',
          gap: 1.5
        }}>
          <Box>
            {title && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QueueMusicIcon 
                  sx={{ 
                    color: primaryColor, 
                    fontSize: { xs: 22, sm: 24, md: 26 },
                    filter: hoveredSection ? `drop-shadow(0 2px 4px ${alpha(primaryColor, 0.3)})` : 'none',
                    transition: 'filter 0.3s ease',
                  }} 
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
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
                variant="caption"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.5),
                  fontWeight: 400,
                  fontSize: '0.7rem',
                  ml: 4,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            {/* Contador de canciones ultra compacto */}
            <Chip
              icon={<QueueMusicIcon sx={{ fontSize: 14 }} />}
              label={`${songs.length}`}
              size="small"
              sx={{
                bgcolor: alpha(primaryColor, 0.08),
                color: primaryColor,
                fontWeight: 600,
                borderRadius: 1.5,
                height: 28,
                '& .MuiChip-icon': { fontSize: 14, color: primaryColor },
                '& .MuiChip-label': { fontSize: '0.7rem', px: 1 }
              }}
            />

            {/* Acciones rápidas */}
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
                          width: 28,
                          height: 28,
                          '&:hover': {
                            bgcolor: alpha(primaryColor, 0.15),
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 14 }} />
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
                          width: 28,
                          height: 28,
                          '&:hover': {
                            bgcolor: alpha(primaryColor, 0.15),
                            transform: 'scale(1.05) rotate(20deg)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ShuffleIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </Box>

        {/* Grid ultra compacto - TOTALMENTE RESPONSIVE */}
        <Grid 
          container 
          spacing={config.spacing}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {visibleSongs.map((song, index) => (
            <Grow 
              key={`${song.id}-${index}`}
              in={true}
              timeout={200 + (index * 20)}
            >
              <Grid item {...gridProps}>
                <Box sx={{ 
                  position: 'relative',
                  height: '100%',
                  '&:hover .remove-button': {
                    opacity: 1,
                    transform: 'scale(1)',
                  }
                }}>
                  {/* Botón eliminar - ultra compacto */}
                  {showRemoveButton && onRemoveSong && (
                    <Tooltip title="Eliminar" arrow placement="top">
                      <IconButton
                        className="remove-button"
                        onClick={(e) => handleRemoveClick(song.id, e)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          zIndex: 10,
                          bgcolor: alpha(theme.palette.background.paper, 0.95),
                          color: '#d32f2f',
                          boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.15)}`,
                          opacity: 0,
                          transform: 'scale(0.8)',
                          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          backdropFilter: 'blur(4px)',
                          width: 24,
                          height: 24,
                          '&:hover': {
                            bgcolor: '#ffebee',
                            opacity: 1,
                            transform: 'scale(1.05)',
                          }
                        }}
                      >
                        <ClearIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* SongCard ultra compacto */}
                  <SongCard
                    song={song}
                    variant="compact" // Fuerza el modo compacto
                    showIndex={false}
                  />
                </Box>
              </Grid>
            </Grow>
          ))}
        </Grid>

        {/* Botón "Ver más" compacto */}
        {hasMoreSongs && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="text"
              onClick={handleViewMore}
              endIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.5,
                color: primaryColor,
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: alpha(primaryColor, 0.05),
                },
              }}
            >
              Ver {songs.length - initialLimit} más
            </Button>
          </Box>
        )}

        {/* Mensaje empty state compacto */}
        {songs.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: alpha(primaryColor, 0.02),
              border: `1px solid ${alpha(primaryColor, 0.1)}`,
            }}
          >
            <QueueMusicIcon sx={{ fontSize: 32, color: alpha(theme.palette.text.primary, 0.2), mb: 1 }} />
            <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.5) }}>
              No hay canciones
            </Typography>
          </Paper>
        )}
      </Box>
    </Fade>
  );
};

export default SongCarousel;