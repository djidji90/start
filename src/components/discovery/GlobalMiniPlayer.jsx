// src/components/GlobalMiniPlayer.jsx

import React, { useState, useEffect, useMemo } from 'react';
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
  const [imgError, setImgError] = useState(false);

  // ============================================
  // 🔁 RESET ERROR CUANDO CAMBIA CANCION
  // ============================================
  useEffect(() => {
    setImgError(false);
  }, [player.currentSong?.id]);

  const handleVolumeChange = (_, newValue) => {
    setLocalVolume(newValue);
    player.changeVolume(newValue);
  };

  // ============================================
  // 🎯 INICIALES FALLBACK
  // ============================================
  const getInitials = (title = '') => {
    return title
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  };

  const songInitials = useMemo(() => {
    return getInitials(player.currentSong?.title);
  }, [player.currentSong]);

  if (!player.currentSong || !show) return null;

  const coverUrl =
    player.currentSong?.cover ||
    player.currentSong?.image_url ||
    null;

  const hasCover = coverUrl && !imgError;

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
        }}
      >

        {/* PROGRESS */}
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

        {/* CLOSE */}
        <IconButton
          size="small"
          onClick={() => setShow(false)}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>

        {/* ============================================
            🎵 INFO + COVER SAFE
        ============================================ */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>

          {/* COVER OR INITIALS */}
          {hasCover ? (
            <Box
              component="img"
              src={coverUrl}
              alt={player.currentSong?.title}
              onError={() => setImgError(true)}
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16,
                color: 'white',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, #1e88e5)`,
                boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.4)}`
              }}
            >
              {songInitials || '♪'}
            </Box>
          )}

          {/* TEXT */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.85rem' }}>
              {player.currentSong?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
              {player.currentSong?.artist}
            </Typography>

            {player.playlist.length > 1 && (
              <Typography variant="caption" color="primary" sx={{ fontSize: '0.6rem', display: 'block' }}>
                {player.playlistIndex + 1} / {player.playlist.length}
              </Typography>
            )}
          </Box>
        </Box>

        {/* CONTROLS */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 1 }}>

          <Tooltip title="Shuffle">
            <IconButton
              size="small"
              onClick={player.toggleShuffle}
              sx={{ color: player.shuffle ? theme.palette.primary.main : theme.palette.text.secondary }}
            >
              <ShuffleIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <IconButton size="small" onClick={player.playPrevious}>
            <SkipPreviousIcon />
          </IconButton>

          <IconButton
            onClick={player.togglePlay}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              width: 40,
              height: 40,
            }}
          >
            {player.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          <IconButton size="small" onClick={player.playNext}>
            <SkipNextIcon />
          </IconButton>

          <IconButton
            size="small"
            onClick={player.toggleRepeat}
            sx={{
              color: player.repeatMode ? theme.palette.primary.main : theme.palette.text.secondary
            }}
          >
            {player.repeatMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
          </IconButton>
        </Box>

        {/* VOLUME */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <IconButton
            size="small"
            onClick={() => player.changeVolume(localVolume === 0 ? 0.7 : 0)}
          >
            {localVolume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>

          <Slider
            size="small"
            value={localVolume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            sx={{ width: 100 }}
          />
        </Box>

        {/* PLAYLIST INFO */}
        {player.playlist.length > 1 && (
          <Chip
            size="small"
            label={`${player.playlist.length} canciones`}
            sx={{
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.6rem',
              bgcolor: alpha(theme.palette.primary.main, 0.9),
              color: 'white',
            }}
          />
        )}
      </Paper>
    </Fade>
  );
};

export default GlobalMiniPlayer;