import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  CardMedia,
  Box,
  Button,
} from "@mui/material";
import { Favorite, GetApp, Comment, PlayArrow } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SongCard = ({ song, onLike, onDownload }) => {
  const navigate = useNavigate();
  const [audio, setAudio] = useState(null); // Estado para manejar el reproductor de audio
  const [error, setError] = useState(""); // Estado para mostrar errores, si los hay
  const [isLiked, setIsLiked] = useState(false); // Controla si se dio like
  const [likeAnimation, setLikeAnimation] = useState(false); // Controla la animación del contador de likes

  // Redirige a la página de comentarios
  const handleCommentsRedirect = () => {
    navigate(`/songs/${song.id}/comments`);
  };

  // Maneja la reproducción de audio
  const handleStream = async (songId) => {
    try {
      // Solicita la URL de la canción desde el servidor
      const response = await axios.get(
        `http://127.0.0.1:8000/api2/songs/${songId}/stream/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      const streamUrl = response.data.url;

      // Verificar si el audio actual es diferente del nuevo
      if (audio && audio.src !== streamUrl) {
        audio.pause(); // Detener el audio actual solo si es diferente
      }

      const newAudio = new Audio(streamUrl);

      newAudio.onloadeddata = () => {
        newAudio.play().catch((err) => {
          console.error("Error al intentar reproducir la canción:", err);
          setError("No se pudo reproducir la canción.");
        });
      };

      newAudio.onerror = (err) => {
        console.error("Error de reproducción:", err);
        setError("Error al cargar el archivo de audio.");
      };

      setAudio(newAudio);
    } catch (err) {
      console.error("Error al intentar reproducir la canción:", err);
      setError("Ocurrió un error al intentar reproducir la canción.");
    }
  };

  // Maneja el evento de dar like con animación
  const handleLike = (songId) => {
    setIsLiked((prev) => !prev);
    setLikeAnimation(true); // Inicia la animación
    onLike(songId);
    setTimeout(() => setLikeAnimation(false), 500); // Reinicia la animación después de 500ms
  };

  // Asegurarnos de que la imagen sea válida
  const imageUrl = song.image_url || "GrillzPrint.jpg";

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
        alt={song.artist}
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
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, marginBottom: 1, color: "#333" }}
        >
          Título: {song.title}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#777", marginBottom: 0.5 }}
        >
          Artista: {song.artist}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#777", marginBottom: 0.5 }}
        >
          Género: {song.genre}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#555",
            fontStyle: "italic",
            fontSize: likeAnimation ? "1.5rem" : "1rem",
            transition: "all 0.5s ease",
            color: likeAnimation ? "#e91e63" : "#555",
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
            }}
          >
            <Favorite />
          </IconButton>
          <IconButton
            onClick={() => onDownload(song.id, song.title)}
            sx={{ color: "primary.main", "&:hover": { color: "#00796b" } }}
          >
            <GetApp />
          </IconButton>
          <IconButton
            onClick={handleCommentsRedirect}
            sx={{ color: "primary.main", "&:hover": { color: "#ff9800" } }}
          >
            <Comment />
          </IconButton>
          <IconButton
            onClick={() => handleStream(song.id)}
            sx={{ color: "primary.main", "&:hover": { color: "#3f51b5" } }}
          >
            <PlayArrow />
          </IconButton>
        </Box>
        <Button
          variant="outlined"
          href={song.file_url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#3f51b5", textTransform: "none" }}
        >
          Abrir en Reproductor
        </Button>
      </CardActions>
      {error && (
        <Typography
          variant="body2"
          sx={{ color: "red", padding: 1, textAlign: "center" }}
        >
          {error}
        </Typography>
      )}
    </Card>
  );
};

export default SongCard;




