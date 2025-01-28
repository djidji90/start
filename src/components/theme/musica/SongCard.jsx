import React, { useState, useEffect } from "react";
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


const SongCard = ({ song, onLike }) => {
  const [audio, setAudio] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(false); // Efecto para el botón "like"
  const [rotate, setRotate] = useState(false); // Efecto para el botón "reproducir"

  useEffect(() => {
    setIsLiked(song.is_liked || false);
  }, [song]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

  const toggleComments = async () => {
    if (!commentsVisible) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api2/songs/${song.id}/comments/`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
        setComments(response.data);
        setCommentsVisible(true);
      } catch (err) {
        console.error("Error al obtener los comentarios:", err);
        setSnackbar({ open: true, message: "No se pudieron cargar los comentarios.", severity: "error" });
      }
    } else {
      setCommentsVisible(false);
    }
  };

  const handleStream = async (songId) => {
    setRotate(true); // Activa la animación de rotación
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api2/songs/${songId}/stream/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }, responseType: "blob" }
      );

      const audioUrl = URL.createObjectURL(response.data);

      if (audio && audio.src !== audioUrl) {
        audio.pause();
        setAudio(null);
      }

      const newAudio = new Audio(audioUrl);
      newAudio.onloadeddata = () => {
        newAudio.play().catch((err) => {
          console.error("Error al intentar reproducir la canción:", err);
          setSnackbar({ open: true, message: "No se pudo reproducir la canción.", severity: "error" });
        });
      };

      setAudio(newAudio);
    } catch (err) {
      console.error("Error al intentar reproducir la canción:", err);
      setSnackbar({ open: true, message: "Error al reproducir la canción.", severity: "error" });
    } finally {
      setTimeout(() => setRotate(false), 500); // Finaliza la rotación
    }
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
  };

  const handleLike = (songId) => {
    setIsLiked((prev) => !prev);
    setPulseEffect(true); // Activa el efecto de pulso
    onLike(songId);

    setTimeout(() => setPulseEffect(false), 600); // Finaliza el efecto después de 600ms
  };

  const handleDownload = async (songId, songTitle) => {
    setDownloading(true);
    setSnackbar({ open: false, message: "", severity: "success" });
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api2/songs/${songId}/download/`,
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
      link.setAttribute("download", `${songTitle}.webm`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbar({ open: true, message: "Canción descargada con éxito.", severity: "success" });
    } catch (err) {
      console.error("Error al descargar la canción:", err);
      setSnackbar({ open: true, message: "Error al descargar la canción.", severity: "error" });
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const imageUrl = song.image_url || "public/Fresh From The Dairy_ Music.jpg";

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 5,
        boxShadow: 12,
        overflow: "hidden",
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={`Imagen de la canción ${song.title} por ${song.artist}`}
        sx={{
          objectFit: "cover",
          transition: "transform 0.3s ease",
          "&:hover": { transform: "scale(1.05)" },
        }}
      />
      <CardContent
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1, color: "#333" }}>
          Título: {song.title}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#777", marginBottom: 0.5 }}>
          Artista: {song.artist}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#777", marginBottom: 0.5 }}>
          Género: {song.genre}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontStyle: "italic",
            fontSize: isLiked ? "1.5rem" : "1rem",
            transition: "all 0.5s ease",
            color: isLiked ? "#e91e63" : "#555",
          }}
        >
          {song.likes_count} Likes
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", padding: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={() => handleLike(song.id)}
            sx={{
              color: isLiked ? "#e91e63" : "primary.main",
              "&:hover": { color: "#e91e63" },
              animation: pulseEffect ? "pulse 0.6s ease-out" : "none",
            }}
          >
            <Favorite />
          </IconButton>
          <IconButton
            onClick={() => handleDownload(song.id, song.title)}
            disabled={downloading}
            sx={{ color: "primary.main", "&:hover": { color: "#00796b" } }}
          >
            {downloading ? (
              <CircularProgress size={20} variant="determinate" value={downloadProgress} />
            ) : (
              <GetApp />
            )}
          </IconButton>
          <IconButton
            onClick={toggleComments}
            sx={{ color: "primary.main", "&:hover": { color: "#ff9800" } }}
          >
            <Comment />
          </IconButton>
          {audio ? (
            <IconButton
              onClick={handlePause}
              sx={{ color: "#00796b", "&:hover": { color: "#004d40" } }}
            >
              <Pause />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => handleStream(song.id)}
              sx={{
                color: "#00796b",
                "&:hover": { color: "#004d40" },
                animation: rotate ? "rotate 0.5s ease-out" : "none",
              }}
            >
              <PlayArrow />
            </IconButton>
          )}
        </Box>
      </CardActions>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default SongCard;
