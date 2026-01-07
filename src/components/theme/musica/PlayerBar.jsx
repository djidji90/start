// src/audio/components/PlayerBar.jsx
import React from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Avatar,
  Stack,
  LinearProgress,
} from '@mui/material';

import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
} from '@mui/icons-material';

import { usePlayer } from "../../../components/hook/services/usePlayer";

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    progress,
    volume,
    toggle,
    seek,
    setVolume,
    hasSong,
  } = usePlayer();

  if (!hasSong) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 88,
        bgcolor: '#0b0b0b',
        borderTop: '1px solid rgba(255,193,7,0.15)',
        px: 2,
        zIndex: 1300,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Barra de progreso superior */}
      {isLoading && (
        <LinearProgress
          sx={{
            height: 2,
            backgroundColor: '#222',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#ffb300',
            },
          }}
        />
      )}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        height="100%"
        spacing={2}
      >
        {/* 🎧 Info canción */}
        <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
          <Avatar
            src={currentSong.cover}
            variant="rounded"
            sx={{ width: 56, height: 56 }}
          />

          <Box minWidth={0}>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ color: '#fff', fontWeight: 600 }}
            >
              {currentSong.title}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {currentSong.artist}
            </Typography>
          </Box>
        </Stack>

        {/* ⏯ Controles */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton disabled>
            <SkipPrevious sx={{ color: '#666' }} />
          </IconButton>

          <IconButton
            onClick={toggle}
            sx={{
              bgcolor: '#ffb300',
              color: '#000',
              '&:hover': { bgcolor: '#ffa000' },
              width: 48,
              height: 48,
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <IconButton disabled>
            <SkipNext sx={{ color: '#666' }} />
          </IconButton>
        </Stack>

        {/* 🔊 Volumen */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ width: 160 }}
        >
          <VolumeUp sx={{ color: '#ffb300' }} />
          <Slider
            size="small"
            value={volume * 100}
            onChange={(_, v) => setVolume(v / 100)}
            sx={{
              color: '#ffb300',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
            }}
          />
        </Stack>
      </Stack>

      {/* 🎚 Barra seek */}
      <Slider
        value={progress}
        onChange={(_, v) => seek(v)}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          color: '#ffb300',
          height: 2,
          '& .MuiSlider-thumb': {
            display: 'none',
          },
        }}
      />
    </Box>
  );
};

export default PlayerBar;
