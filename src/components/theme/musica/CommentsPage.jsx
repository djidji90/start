import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Grid, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";

const   CommentsPage = () => {
  const { songId } = useParams(); // Recuperamos el id de la canción desde la URL
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar comentarios de la canción cuando se monta el componente
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/comments/${songId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Asegúrate de enviar el token
          },
        });
        setComments(response.data); // Establece los comentarios en el estado
      } catch (error) {
        setErrors({ general: "No se pudieron cargar los comentarios." });
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [songId]); // Vuelve a cargar cuando el songId cambie

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment) return; // Validación simple

    setLoading(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/comments/${songId}/`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Enviar token
          },
        }
      );
      setSuccessMessage("Comentario enviado correctamente.");
      setOpenSnackbar(true);
      setNewComment(""); // Limpiar el campo de comentario
      setComments([...comments, response.data]); // Añadir el nuevo comentario al estado
    } catch (error) {
      setErrors({ general: "Error al enviar el comentario." });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4">Comentarios</Typography>
      {errors.general && <Alert severity="error">{errors.general}</Alert>}
      <Box sx={{ marginTop: 2 }}>
        <form onSubmit={handleCommentSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Escribe tu comentario"
            value={newComment}
            onChange={handleCommentChange}
            variant="outlined"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Comentario"}
          </Button>
        </form>
      </Box>

      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6">Comentarios</Typography>
        <Grid container spacing={2}>
          {comments.map((comment) => (
            <Grid item xs={12} key={comment.id}>
              <Typography variant="body1">{comment.content}</Typography>
              <Typography variant="body2" sx={{ color: "#777" }}>
                {comment.author}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentsPage;


