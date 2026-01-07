// src/components/songs/SongCard.jsx - VERSIÓN CORREGIDA DEFINITIVA
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Chip,
  Tooltip
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  VolumeUp,
  AccessTime
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { usePlayer } from "../components/PlayerContext";

const SongCard = ({ song, showIndex = false, onLike, onMoreActions }) => {
  const theme = useTheme();
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    currentSong,
    isPlaying,
    isLoading,
    playSong,
    pause,
    togglePlay, // ← ESTA SÍ EXISTE en tu PlayerContext
    progress,
    volume
  } = usePlayer();

  const isCurrent = currentSong?.id === song.id;
  const playing = isCurrent && isPlaying;
  const loadingCurrent = isCurrent && isLoading;

  // CORRECCIÓN CRÍTICA: handlePlay simplificado
  const handlePlay = async (e) => {
    e.stopPropagation();
    
    console.log('🎵 SongCard handlePlay:', {
      songId: song.id,
      songTitle: song.title,
      isCurrent,
      isPlaying,
      hasTogglePlay: typeof togglePlay === 'function'
    });
    
    if (isCurrent) {
      // Si es la canción actual, usar togglePlay
      console.log('🔁 Usando togglePlay para canción actual');
      if (typeof togglePlay === 'function') {
        togglePlay();
      } else {
        // Fallback si togglePlay no está disponible
        console.warn('togglePlay no disponible, usando pause/playSong');
        if (isPlaying) {
          pause();
        } else {
          playSong(song);
        }
      }
    } else {
      // Si es una canción diferente, reproducirla
      console.log('▶️ Reproduciendo nueva canción');
      playSong(song);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const newLikedState = !liked;
    setLiked(newLikedState);
    onLike?.(song.id, newLikedState);
  };

  const handleCardClick = (e) => {
    // Solo manejar clics si no es en botones
    if (!e.target.closest('button')) {
      handlePlay(e);
    }
  };

  // Formatear duración
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatear progreso si es la canción actual
  const formatProgress = () => {
    if (!isCurrent || !progress.current) return '';
    const current = Math.floor(progress.current);
    const total = Math.floor(progress.duration) || song.duration || 180;
    const percent = total > 0 ? (current / total) * 100 : 0;
    return `${Math.floor(current / 60)}:${(current % 60).toString().padStart(2, '0')} / ${formatDuration(total)}`;
  };

  return (
    <Card
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 4,
        overflow: "visible",
        cursor: "pointer",
        bgcolor: isCurrent ? alpha('#00838F', 0.05) : "#FFFFFF",
        border: isCurrent ? "2px solid #00838F" : "1px solid #E6F2EE",
        boxShadow: isCurrent 
          ? `0 8px 24px ${alpha('#00838F', 0.15)}`
          : "0 8px 24px rgba(0,0,0,0.04)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: isCurrent
            ? `0 14px 40px ${alpha('#00838F', 0.25)}`
            : "0 14px 40px rgba(0,0,0,0.12)",
          borderColor: isCurrent ? '#006064' : alpha('#00838F', 0.3)
        }
      }}
    >
      {/* Indicador de reproducción */}
      {isCurrent && (
        <Box
          sx={{
            position: "absolute",
            top: -8,
            left: 16,
            bgcolor: "#00838F",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: "12px 12px 0 0",
            fontSize: "0.7rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            zIndex: 1
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: playing ? "#00FF9D" : "#FFFFFF",
              animation: playing ? "pulse 1.5s infinite" : "none"
            }}
          />
          {playing ? "REPRODUCIENDO" : "PAUSADA"}
        </Box>
      )}

      {/* Cover con overlay */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="220"
          image={song.cover || "/djidji.png"}
          alt={song.title}
          sx={{
            objectFit: "cover",
            filter: loadingCurrent ? "blur(2px)" : "none",
            transition: "filter 0.3s"
          }}
        />

        {/* Overlay de carga */}
        {loadingCurrent && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: alpha("#000000", 0.3),
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CircularProgress
              size={40}
              sx={{ color: "#FFFFFF" }}
            />
          </Box>
        )}

        {/* Overlay de reproducción */}
        {isCurrent && playing && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: alpha("#00838F", 0.2),
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: alpha("#00838F", 0.8),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 2s infinite"
              }}
            >
              <VolumeUp sx={{ color: "white", fontSize: 30 }} />
            </Box>
          </Box>
        )}

        {/* Botón Play/Pause */}
        <Tooltip 
          title={playing ? "Pausar" : loadingCurrent ? "Cargando..." : "Reproducir"}
          placement="top"
        >
          <IconButton
            onClick={handlePlay}
            disabled={loadingCurrent}
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              bgcolor: playing 
                ? alpha("#FF4081", 0.95) 
                : alpha(theme.palette.primary.main, 0.95),
              color: "#fff",
              width: 56,
              height: 56,
              "&:hover": {
                bgcolor: playing ? "#FF4081" : theme.palette.primary.main,
                transform: "scale(1.1)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}
          >
            {loadingCurrent ? (
              <CircularProgress size={24} color="inherit" />
            ) : playing ? (
              <Pause sx={{ fontSize: 28 }} />
            ) : (
              <PlayArrow sx={{ fontSize: 28 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Progreso si es la canción actual */}
        {isCurrent && progress.duration > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              bgcolor: alpha("#000000", 0.2)
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${(progress.current / progress.duration) * 100}%`,
                bgcolor: "#00FF9D",
                transition: "width 0.5s linear"
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 2.5, position: "relative" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Número/Índice */}
          {showIndex && (
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: isCurrent ? alpha("#00838F", 0.1) : alpha("#000000", 0.05),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: isCurrent ? "#00838F" : "text.secondary",
                  fontWeight: isCurrent ? 700 : 500,
                  fontSize: "0.8rem"
                }}
              >
                {showIndex}
              </Typography>
            </Box>
          )}

          {/* Información de la canción */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: isCurrent ? 800 : 700,
                lineHeight: 1.2,
                mb: 0.5,
                color: isCurrent ? "#00838F" : "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical"
              }}
            >
              {song.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: isCurrent ? "#006064" : "text.secondary",
                fontWeight: isCurrent ? 500 : 400,
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical"
              }}
            >
              {song.artist}
            </Typography>

            {/* Metadatos */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {song.genre && (
                <Chip
                  label={song.genre}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    borderColor: isCurrent ? alpha("#00838F", 0.3) : undefined,
                    color: isCurrent ? "#00838F" : undefined
                  }}
                />
              )}

              <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                <AccessTime sx={{ fontSize: 14, mr: 0.5, opacity: 0.7 }} />
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                  {formatDuration(song.duration)}
                </Typography>
              </Box>

              {/* Progreso actual si se está reproduciendo */}
              {isCurrent && formatProgress() && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.7rem",
                    color: "#00838F",
                    fontWeight: 600,
                    ml: "auto"
                  }}
                >
                  {formatProgress()}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Botón Like */}
          <Tooltip title={liked ? "Quitar de favoritos" : "Añadir a favoritos"}>
            <IconButton
              size="small"
              onClick={handleLike}
              sx={{
                color: liked ? "#FF4081" : "text.secondary",
                "&:hover": {
                  bgcolor: alpha(liked ? "#FF4081" : "#00838F", 0.1),
                  transform: "scale(1.1)"
                },
                transition: "all 0.2s"
              }}
            >
              {liked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .song-card {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </Card>
  );
};

export default React.memo(SongCard);