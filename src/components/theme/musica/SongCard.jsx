import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  CardMedia,
  Box,
} from "@mui/material";
import { Favorite, GetApp, Comment, PlayArrow } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SongCard = ({ song, onLike, onDownload, onStream }) => {
  const navigate = useNavigate(); // Usamos useNavigate para redirigir

  // Maneja la redirección a la página de comentarios
  const handleCommentsRedirect = () => {
    navigate(`/songs/${song.id}/comments`); // Asegúrate de que la ruta sea correcta
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 3,
        overflow: "hidden",
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={
          song.image?.startsWith("http")
            ? song.image
            : `http://127.0.0.1:8000/api2/media/${
                song.image || "images/placeholder.jpg"
              }`
        }
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
        <Typography variant="body2" sx={{ color: "#555", fontStyle: "italic" }}>
          {song.likes_count} Likes
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", padding: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={() => onLike(song.id)}
            sx={{ color: "primary.main", "&:hover": { color: "#e91e63" } }}
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
            onClick={() => onStream(song.id)}
            sx={{ color: "primary.main", "&:hover": { color: "#3f51b5" } }}
          >
            <PlayArrow />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default SongCard;
