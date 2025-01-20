import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const CommentsSection = ({ songId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const getAuthHeader = () => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  };

  const fetchComments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api2/songs/${songId}/comments/`,
        { headers: getAuthHeader() }
      );
      setComments(response.data);
    } catch (err) {
      setError("No se pudieron cargar los comentarios. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError("El comentario no puede estar vacío.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api2/songs/${songId}/comments/`,
        { text: newComment },
        { headers: getAuthHeader() }
      );
      setComments((prevComments) => [response.data, ...prevComments]);
      setNewComment("");
      setSuccessMessage("Comentario agregado con éxito.");
      setOpenSnackbar(true);
    } catch (err) {
      setError("No se pudo agregar el comentario. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [songId]);

  return (
    <Box sx={{ padding: 2, marginTop: 4 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Comentarios
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
        <TextField
          label="Escribe un comentario"
          variant="outlined"
          fullWidth
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ marginRight: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddComment}
          disabled={loading}
        >
          Comentar
        </Button>
      </Box>

      <List>
        {comments.map((comment) => (
          <ListItem key={comment.id} alignItems="flex-start">
            <ListItemText
              primary={comment.text}
              secondary={`Por ${comment.user} - ${new Date(
                comment.created_at
              ).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentsSection;