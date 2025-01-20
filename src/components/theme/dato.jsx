import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  CardMedia,
  Box,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Icon,
} from "@mui/material";
import { Favorite, GetApp, Comment, PlayArrow, ThumbUp } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SongCard = ({ song, onLike, onDownload, onStream }) => {
  const navigate = useNavigate();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar los comentarios de la canción
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api2/songs/${song.id}/comments/`
        );
        setComments(response.data);
      } catch (err) {
        setError("No se pudieron cargar los comentarios.");
      }
    };

    fetchComments();
  }, [song.id]);

  // Función para agregar un nuevo comentario
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError("El comentario no puede estar vacío.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api2/songs/${song.id}/comments/`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setComments([...comments, response.data]);
      setNewComment("");
      setSuccessMessage("Comentario agregado exitosamente.");
    } catch (err) {
      setError("Error al agregar el comentario.");
    } finally {
      setLoading(false);
    }
  };

  // Función para reaccionar con "like" en un comentario
  const handleLikeComment = async (commentId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api2/comments/${commentId}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, likes_count: response.data.likes_count } : comment
        )
      );
    } catch {
      setError("No se pudo reaccionar al comentario.");
    }
  };

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
        image={song.image_url || "GrillzPrint.jpg"}
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

      <CardContent>
        <Typography variant="h6">Comentarios:</Typography>

        {error && <Typography color="error">{error}</Typography>}
        {successMessage && <Typography color="success">{successMessage}</Typography>}

        <Box sx={{ marginBottom: 2 }}>
          <TextField
            label="Escribe un comentario"
            fullWidth
            variant="outlined"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddComment}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Agregar Comentario"}
          </Button>
        </Box>

        <List>
          {comments.map((comment) => (
            <ListItem key={comment.id}>
              <ListItemText
                primary={comment.user}
                secondary={comment.content}
              />
              <Box>
                <IconButton
                  onClick={() => handleLikeComment(comment.id)}
                  sx={{ color: "#00796b" }}
                >
                  <ThumbUp />
                </IconButton>
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  {comment.likes_count} Likes
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default SongCard;
