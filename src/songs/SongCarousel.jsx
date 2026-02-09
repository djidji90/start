// src/components/songs/SongCarousel.jsx - VERSIÓN OPTIMIZADA
import React from "react";
import { 
  Grid, 
  Box, 
  Typography,
  IconButton,
  Tooltip
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SongCard from "../songs/SongCard";

const SongCarousel = ({ 
  songs = [], 
  title,
  onRemoveSong,           // Callback para eliminar canción (opcional)
  showRemoveButton = false, // Mostrar botón eliminar (opcional)
  sx = {}                 // Estilos adicionales
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

  // Manejar eliminación con confirmación
  const handleRemoveClick = (songId, e) => {
    e.stopPropagation(); // Evitar propagación de eventos
    e.preventDefault();  // Prevenir comportamiento por defecto
    
    if (onRemoveSong && window.confirm("¿Eliminar esta canción de la lista?")) {
      onRemoveSong(songId);
    }
  };

  return (
    <Box sx={{ mb: 4, ...sx }}>
      {/* Header con título opcional */}
      {(title || showRemoveButton) && (
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {title && (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#1B5E20"
              }}
            >
              {title}
            </Typography>
          )}
          
          {/* Contador de canciones */}
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: '0.875rem',
              fontWeight: 500
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
                transform: 'translateY(0)'
              }
            }}>
              {/* Botón eliminar - solo visible si está habilitado */}
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
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#d32f2f',
                      boxShadow: 1,
                      opacity: 0.7,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#ffebee',
                        opacity: 1,
                        transform: 'scale(1.1)',
                        color: '#b71c1c'
                      }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Card de canción - sin modificaciones */}
              <SongCard
                song={song}
                variant="default"
                showIndex={index + 1}
                onLike={handleLike}
                onMoreActions={() => handleMoreActions(song)}
                sx={{
                  height: "100%",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4
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