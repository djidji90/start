// src/components/theme/musica/PlayerBar.jsx
import React from "react";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  LinearProgress,
  Paper,
  Avatar,
  Fade,
  Alert,
  alpha,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  Close,
} from "@mui/icons-material";
import { usePlayer } from "../../PlayerContext";

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    progress,
    volume,
    error,
    isLoading,
    togglePlay,
    seek,
    changeVolume,
    clearError,
  } = usePlayer();

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Fade in>
      <Paper
        elevation={12}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          px: 2,
          py: 1,
          zIndex: 1400,
          backdropFilter: "blur(14px)",
          bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
          borderTop: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        {/* ERROR */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 1 }}
            action={
              <IconButton size="small" onClick={clearError}>
                <Close fontSize="small" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {/* EMPTY STATE */}
        {!currentSong && (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            py={2}
          >
            Selecciona una canción para reproducir
          </Typography>
        )}

        {currentSong && (
          <>
            <Box display="flex" alignItems="center" gap={2}>
              {/* SONG INFO */}
              <Box
                display="flex"
                alignItems="center"
                gap={1.5}
                minWidth={0}
                sx={{ width: 240 }}
              >
                <Avatar
                  variant="rounded"
                  src={currentSong.cover || "/default-cover.jpg"}
                  sx={{ width: 56, height: 56 }}
                />
                <Box minWidth={0}>
                  <Typography fontWeight={600} noWrap>
                    {currentSong.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                  >
                    {currentSong.artist}
                  </Typography>
                </Box>
              </Box>

              {/* CONTROLS */}
              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                alignItems="center"
                px={2}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton size="small" disabled>
                    <SkipPrevious />
                  </IconButton>

                  <IconButton
                    onClick={togglePlay}
                    disabled={isLoading}
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      width: 48,
                      height: 48,
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    }}
                  >
                    {isPlaying ? <Pause /> : <PlayArrow />}
                  </IconButton>

                  <IconButton size="small" disabled>
                    <SkipNext />
                  </IconButton>
                </Box>

                {/* PROGRESS */}
                <Box
                  width="100%"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mt={0.5}
                >
                  <Typography variant="caption">
                    {formatTime(progress.current)}
                  </Typography>

                  <Slider
                    size="small"
                    value={progress.current || 0}
                    max={progress.duration || 100}
                    onChange={(_, v) => seek(v)}
                    sx={{ flex: 1 }}
                    disabled={isLoading}
                  />

                  <Typography variant="caption">
                    {formatTime(progress.duration)}
                  </Typography>
                </Box>
              </Box>

              {/* VOLUME */}
              <Box
                display={{ xs: "none", sm: "flex" }}
                alignItems="center"
                gap={1}
                minWidth={140}
              >
                <VolumeUp fontSize="small" />
                <Slider
                  size="small"
                  value={volume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(_, v) => changeVolume(v)}
                />
              </Box>
            </Box>

            {/* LOADING BAR */}
            {isLoading && (
              <LinearProgress
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                }}
              />
            )}
          </>
        )}
      </Paper>
    </Fade>
  );
};

export default PlayerBar;
