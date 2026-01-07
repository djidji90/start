// src/components/PlayerUI.jsx
import React from "react";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Slider,
  Avatar,
  LinearProgress,
  Fade,
  Alert,
  alpha,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  Close,
} from "@mui/icons-material";
import { usePlayer } from "./PlayerContext";

const PlayerUI = () => {
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

  if (!currentSong) return null;

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
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(960px, 95%)",
          borderRadius: 4,
          px: 2,
          py: 1.5,
          backdropFilter: "blur(14px)",
          bgcolor: (t) => alpha(t.palette.background.paper, 0.9),
          zIndex: 1400,
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

        {/* MAIN */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* SONG INFO */}
          <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
            <Avatar
              variant="rounded"
              src={currentSong.cover || "/default-cover.jpg"}
              sx={{ width: 56, height: 56 }}
            />
            <Box minWidth={0}>
              <Typography
                fontWeight={600}
                noWrap
              >
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
          <Box flex={1} px={2}>
            <Box display="flex" justifyContent="center" mb={0.5}>
              <IconButton
                onClick={togglePlay}
                disabled={isLoading}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Box>

            {/* PROGRESS */}
            <Box>
              <LinearProgress
                variant="determinate"
                value={
                  progress.duration
                    ? (progress.current / progress.duration) * 100
                    : 0
                }
                sx={{
                  height: 6,
                  borderRadius: 3,
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent =
                    (e.clientX - rect.left) / rect.width;
                  seek(percent * progress.duration);
                }}
              />
              <Box
                display="flex"
                justifyContent="space-between"
                mt={0.5}
              >
                <Typography variant="caption">
                  {formatTime(progress.current)}
                </Typography>
                <Typography variant="caption">
                  {formatTime(progress.duration)}
                </Typography>
              </Box>
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
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(_, v) => changeVolume(v)}
            />
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default PlayerUI;
