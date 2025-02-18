import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

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
  
  const [newComment, setNewComment] = useState('');
const [showCommentForm, setShowCommentForm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [rotate, setRotate] = useState(false);

 // Cambiar en SongCard:
useEffect(() => {
  setIsLiked(song.liked); // En vez de song.is_liked
}, [song.liked]);
  

  

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        URL.revokeObjectURL(audio.src);
      }
    };
  }, [audio]);

  const [loadingComments, setLoadingComments] = useState(false);

const toggleComments = async (e) => {
  e.stopPropagation(); // Evitar redirección
  if (!commentsVisible) {
    setLoadingComments(true);
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
    } finally {
      setLoadingComments(false);
    }
  } else {
    setCommentsVisible(false);
  }
};


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
      `http://127.0.0.1:8000/api2/songs/${songId}/stream/`,
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

  const handleLike = (songId) => {
    setIsLiked((prev) => !prev);
    setPulseEffect(true);
    onLike(songId);
    setTimeout(() => setPulseEffect(false), 600);
  };

  const handleDownload = async (songId, songTitle) => {
    setDownloading(true);
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
      link.setAttribute("download", `${songTitle.replace(/[^a-z0-9]/gi, '_')}.webm`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbar({ open: true, message: "Descarga completada", severity: "success" });
    } catch (err) {
      console.error("Error en descarga:", err);
      setSnackbar({ open: true, message: "vuelve a descargarla en una hora", severity: "error" });
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };


  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api2/songs/${song.id}/comments/`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      
      setComments([...comments, response.data]);
      setNewComment('');
      setSnackbar({ open: true, message: "Comentario publicado", severity: "success" });
    } catch (err) {
      console.error("Error al publicar comentario:", err);
      setSnackbar({ open: true, message: "Error al publicar el comentario", severity: "error" });
    }
  };
  
  const handleCommentLike = async (commentId) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api2/comments/${commentId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      
      setComments(comments.map(comment => 
        comment.id === commentId ? { 
          ...comment, 
          likes: comment.likes + 1,
          user_liked: true 
        } : comment
      ));
    } catch (err) {
      console.error("Error al dar like:", err);
    }
  };
  
  const handleCommentDislike = async (commentId) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api2/comments/${commentId}/dislike/`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      
      setComments(comments.map(comment => 
        comment.id === commentId ? { 
          ...comment, 
          dislikes: comment.dislikes + 1,
          user_disliked: true 
        } : comment
      ));
    } catch (err) {
      console.error("Error al dar dislike:", err);
    }
  };
  

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
  const API_PREFIX = "/api2"; // Prefijo correcto que necesitas
  
  const imageUrl = song.image
    ? song.image.startsWith("http") 
      ? song.image.replace("/media/images/", `${API_PREFIX}/media/images/`)
      : `${BASE_URL}${API_PREFIX}/media/images/${song.image.split("/").pop()}`
    : "/GrillzPrint.jpg";
  
  console.log("Valor de song.image recibido:", song.image);
  console.log("URL de la imagen generada:", imageUrl);
  
  
  

console.log("URL de la imagen generada:", imageUrl);


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
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Favorite sx={{ color: isLiked ? 'error.main' : 'action.active', mr: 1 }} />
          <Typography variant="body2" sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}>
            {song.likes_count} Me gusta
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
        <motion.div
  animate={{ 
    scale: pulseEffect ? [1, 1.5, 1] : 1, // Más impacto en la animación
    rotate: pulseEffect ? [0, -10, 10, 0] : 0, // Efecto de vibración leve
    opacity: pulseEffect ? [1, 0.8, 1] : 1, // Efecto de parpadeo sutil
  }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  <IconButton
    onClick={() => {
      handleLike(song.id);
      setPulseEffect(true); // Activa el efecto
      setTimeout(() => setPulseEffect(false), 400); // Desactiva después de un tiempo
    }}
    sx={{
      color: isLiked ? "red" : "InfoText", // Cambio de color dinámico
      transition: "color 0.3s ease-in-out", // Transición de color suave
    }}
  >
    {isLiked ? <Favorite sx={{ filter: "drop-shadow(0px 0px 5px red)" }} /> : <FavoriteBorderIcon />}
  </IconButton>
</motion.div>



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

          <IconButton onClick={toggleComments}>
            <Comment />
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

      {commentsVisible && (
        <Box sx={{ maxHeight: 150, overflowY: 'auto', p: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
           {comments.map((comment) => (
    <Box key={comment.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
      {/* ... */}
    </Box>
  ))}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default SongCard;
