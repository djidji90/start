import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  CardMedia,
  Box,
  Snackbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Favorite, GetApp, Comment, PlayArrow, Pause } from "@mui/icons-material";
import axios from "axios";
import { useConfig } from "../../hook/useConfig";
import CommentDialog from "./CommentDialog";
import LikeManager from "./LikeManager";

const SongCard = ({ song, onLikeToggle }) => {
  const { api: { baseURL } } = useConfig();
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [rotate, setRotate] = useState(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        URL.revokeObjectURL(audio.src);
      }
    };
  }, [audio]);

  const handleStream = async (songId) => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
      return;
    }

    try {
      const response = await axios.get(
        `${baseURL}/api2/songs/${songId}/stream/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }, responseType: "blob" }
      );

      const audioUrl = URL.createObjectURL(response.data);
      const newAudio = new Audio(audioUrl);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      newAudio.play();

      setAudio(newAudio);
      setIsPlaying(true);
    } catch (err) {
      console.error("Error al reproducir:", err);
      setSnackbar({ open: true, message: "Error al reproducir la canción", severity: "error" });
    }
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = async (songId, songTitle) => {
    setDownloading(true);
    try {
      const response = await axios.get(
        `${baseURL}/api2/songs/${songId}/download/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDownloadProgress(progress);
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${songTitle.replace(/[^a-z0-9]/gi, '_')}.webm`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbar({ open: true, message: "Descarga completada", severity: "success" });
    } catch (err) {
      console.error("Error en descarga:", err);
      setSnackbar({ open: true, message: "Vuelve a intentarlo en una hora", severity: "error" });
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const cleanBaseURL = baseURL?.replace(/\/$/, '');
  
  let imageUrl = "/GrillzPrint.jpg";
  
  if (song.image) {
    if (song.image.startsWith("http")) {
      const imagePath = song.image.replace(
        `${baseURL.replace(/\/$/, '')}/media/`,
        `${cleanBaseURL}/api2/media/`
      );
      imageUrl = imagePath;
    } else {
      const fileName = song.image.split("/").pop();
      imageUrl = `${cleanBaseURL}/api2/media/images/${fileName}`;
    }
  }
  
  return (
    <Card sx={{
      display: "flex",
      flexDirection: "column",
      borderRadius: 5,
      boxShadow: 12,
      overflow: "hidden",
      m: 2,
      maxWidth: 345
    }}>
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={`Portada de ${song.title}`}
        sx={{
          objectFit: "cover",
          transition: "transform 0.3s ease",
          "&:hover": { transform: "scale(1.05)" }
        }}
      />
      
      <CardContent sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
          {song.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Artista: {song.artist}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Género: {song.genre}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <LikeManager
            songId={song.id}
            initialLikes={song.likes_count}
            initialLiked={song.is_liked}
            onLikeToggle={(id) => onLikeToggle(id, song.likes_count, song.is_liked)}
          />

          <IconButton 
            onClick={() => handleDownload(song.id, song.title)} 
            disabled={downloading}
          >
            {downloading ? (
              <CircularProgress size={24} variant="determinate" value={downloadProgress} />
            ) : (
              <GetApp />
            )}
          </IconButton>

          <IconButton onClick={() => setShowCommentsDialog(true)}>
            <Comment />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {song.comments_count}
            </Typography>
          </IconButton>
        </Box>

        <IconButton
          onClick={audio && isPlaying ? handlePause : () => handleStream(song.id)}
          sx={{
            color: 'primary.main',
            animation: rotate ? 'rotate 0.5s ease-out' : isPlaying ? 'rotate 1.5s infinite linear' : 'none'
          }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      </CardActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <CommentDialog
        songId={song.id}
        open={showCommentsDialog}
        onClose={() => setShowCommentsDialog(false)}
      />
    </Card>
  );
};

export default SongCard;