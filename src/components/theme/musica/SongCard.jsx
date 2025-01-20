import React from "react";
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

const SongCard = ({ song, onLike, onDownload, onStream }) => {
  const navigate = useNavigate();

  // Redirige a la página de comentarios
  const handleCommentsRedirect = () => {
    navigate(`/songs/${song.id}/comments`);
  };

  // Asegurarnos de que la imagen sea válida
  const imageUrl = song.image_url || 'GrillzPrint.jpg';

  return (
    <Card
      sx={{
        display: "-ms-inline-flexbox",
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
        {/* Botón para abrir en el reproductor externo */}
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
    </Card>
  );
};

export default SongCard;

