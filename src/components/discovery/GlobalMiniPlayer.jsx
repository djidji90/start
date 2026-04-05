// src/components/GlobalMiniPlayer.jsx
// VERSIÓN COMPLETA - CON TODAS LAS FUNCIONALIDADES DEL PLAYERCONTEXT

import React, { useState } from 'react';
import {
  Fade,
  Paper,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Slider,
  Tooltip,
  alpha,
  useTheme,
  Chip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { usePlayer } from '../../components/PlayerContext';

const GlobalMiniPlayer = () => {
  const theme = useTheme();
  const player = usePlayer();
  const [show, setShow] = useState(true);
  const [localVolume, setLocalVolume] = useState(player.volume || 0.7);

  const handleVolumeChange = (_, newValue) => {
    setLocalVolume(newValue);
    player.changeVolume(newValue);
  };

  if (!player.currentSong || !show) return null;

  return (
    <Fade in={true}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1300,
          p: 1.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: 'blur(8px)',
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          minWidth: 280,
          maxWidth: 320,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Barra de progreso */}
        <LinearProgress
          variant="determinate"
          value={player.progressPercentage || 0}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: '3px 3px 0 0',
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            '& .MuiLinearProgress-bar': {
              bgcolor: theme.palette.primary.main
            }
          }}
        />

        {/* Botón cerrar */}
        <IconButton
          size="small"
          onClick={() => setShow(false)}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            color: theme.palette.text.secondary,
            '&:hover': { color: theme.palette.error.main }
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>

        {/* Información de la canción */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
          <Box
            component="img"
            src={player.currentSong?.cover || player.currentSong?.image_url || '/default-album.jpg'}
            alt={player.currentSong?.title}
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              objectFit: 'cover',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
            onError={(e) => { e.target.src = '/default-album.jpg'; }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.85rem' }}>
              {player.currentSong?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
              {player.currentSong?.artist}
            </Typography>
            {/* 🆕 Indicador de playlist */}
            {player.playlist.length > 1 && (
              <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem', display: 'block' }}>
                {player.playlistIndex + 1} / {player.playlist.length}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Controles de reproducción */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
          {/* 🆕 Botón Shuffle */}
          <Tooltip title={player.shuffle ? "Desactivar aleatorio" : "Activar aleatorio"} arrow>
            <IconButton
              size="small"
              onClick={player.toggleShuffle}
              sx={{
                color: player.shuffle ? theme.palette.primary.main : theme.palette.text.secondary,
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              <ShuffleIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Anterior */}
          <Tooltip title="Anterior" arrow>
            <IconButton
              size="small"
              onClick={player.playPrevious}
              sx={{ color: theme.palette.text.primary }}
            >
              <SkipPreviousIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Play/Pause */}
          <Tooltip title={player.isPlaying ? "Pausar" : "Reproducir"} arrow>
            <IconButton
              onClick={player.togglePlay}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  transform: 'scale(1.05)'
                }
              }}
            >
              {player.isPlaying ? (
                <PauseIcon sx={{ fontSize: 20 }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Siguiente */}
          <Tooltip title="Siguiente" arrow>
            <IconButton
              size="small"
              onClick={player.playNext}
              sx={{ color: theme.palette.text.primary }}
            >
              <SkipNextIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* 🆕 Botón Repeat */}
          <Tooltip
            title={
              player.repeatMode === 'one' ? "Repetir canción" :
              player.repeatMode === 'all' ? "Repetir playlist" :
              "Sin repetición"
            }
            arrow
          >
            <IconButton
              size="small"
              onClick={player.toggleRepeat}
              sx={{
                color: player.repeatMode ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            >
              {player.repeatMode === 'one' ? (
                <RepeatOneIcon sx={{ fontSize: 16 }} />
              ) : (
                <RepeatIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* 🆕 Tiempo transcurrido / duración */}
        {player.duration > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              {player.formatTime ? player.formatTime(player.currentTime) : formatTime(player.currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              {player.formatTime ? player.formatTime(player.duration) : formatTime(player.duration)}
            </Typography>
          </Box>
        )}

        {/* Control de volumen */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mt: 0.5,
            pt: 0.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}
        >
          <IconButton
            size="small"
            onClick={() => player.changeVolume(localVolume === 0 ? 0.7 : 0)}
            sx={{ color: theme.palette.text.secondary }}
          >
            {localVolume === 0 ? <VolumeOffIcon sx={{ fontSize: 14 }} /> : <VolumeUpIcon sx={{ fontSize: 14 }} />}
          </IconButton>
          <Slider
            size="small"
            value={localVolume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            sx={{
              width: 100,
              '& .MuiSlider-track': { bgcolor: theme.palette.primary.main },
              '& .MuiSlider-thumb': { width: 10, height: 10 }
            }}
          />
        </Box>

        {/* 🆕 Badge de playlist activa */}
        {player.playlist.length > 1 && (
          <Chip
            size="small"
            label={`${player.playlist.length} canciones en cola`}
            sx={{
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              height: 18,
              fontSize: '0.55rem',
              bgcolor: alpha(theme.palette.primary.main, 0.9),
              color: 'white',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        )}
      </Paper>
    </Fade>
  );
};

// Función auxiliar para formatear tiempo (si player no la tiene)
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default GlobalMiniPlayer;