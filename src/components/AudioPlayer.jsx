import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayArrow, 
  Pause, 
  SkipPrevious, 
  SkipNext,
  VolumeUp,
  Favorite,
  FavoriteBorder,
  Download
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useLikeSong } from '../hooks/useSongs';
import songService from '../services/songService';
import { toast } from 'react-toastify';

const AudioPlayer = ({ song, onNext, onPrevious, showControls = true }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(song?.is_liked || false);
  
  const { mutate: likeSong } = useLikeSong();

  useEffect(() => {
    if (!song?.id) return;

    const audio = audioRef.current;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext) onNext();
    };
    const handleError = () => {
      setIsLoading(false);
      toast.error("Error cargando el audio");
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Configurar fuente de audio
    audio.src = songService.getStreamUrl(song.id);
    audio.load();
    setIsLiked(song.is_liked || false);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [song?.id]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        toast.error("Error reproduciendo audio");
        console.error("Play error:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
      setVolume(newValue);
    }
  };

  const handleLike = () => {
    if (!song?.id) return;
    likeSong(song.id);
    setIsLiked(!isLiked);
  };

  const handleDownload = async () => {
    if (!song?.id) return;
    setIsLoading(true);
    try {
      await songService.downloadSong(song.id);
      toast.success("Descarga iniciada");
    } catch (error) {
      toast.error("Error descargando canción");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!song) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">Selecciona una canción</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        p: 2,
        zIndex: 1000,
        boxShadow: 3,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Información de la canción */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" noWrap>
            {song.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {song.artist}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            {song.genre && (
              <Chip label={song.genre} size="small" variant="outlined" />
            )}
            <Typography variant="caption" color="text.secondary">
              {song.duration ? formatTime(song.duration) : '--:--'}
            </Typography>
          </Stack>
        </Box>

        {/* Controles de reproducción */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Anterior">
            <IconButton onClick={onPrevious} disabled={!onPrevious}>
              <SkipPrevious />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isPlaying ? "Pausar" : "Reproducir"}>
            <IconButton 
              onClick={togglePlay} 
              disabled={isLoading}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isPlaying ? (
                <Pause />
              ) : (
                <PlayArrow />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Siguiente">
            <IconButton onClick={onNext} disabled={!onNext}>
              <SkipNext />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Barra de progreso */}
        <Box sx={{ flex: 2, px: 2 }}>
          <Stack spacing={1}>
            <Slider
              value={currentTime}
              max={duration || 100}
              onChange={handleSeek}
              disabled={!duration}
              size="small"
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption">
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="caption">
                {formatTime(duration)}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Controles adicionales */}
        <Stack direction="row" spacing={1}>
          <Tooltip title={isLiked ? "Quitar like" : "Dar like"}>
            <IconButton onClick={handleLike} size="small">
              {isLiked ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Descargar">
            <IconButton onClick={handleDownload} disabled={isLoading} size="small">
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Download />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Volumen">
            <Stack direction="row" alignItems="center" spacing={1}>
              <VolumeUp fontSize="small" />
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                size="small"
                sx={{ width: 80 }}
              />
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Audio element hidden */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default AudioPlayer;