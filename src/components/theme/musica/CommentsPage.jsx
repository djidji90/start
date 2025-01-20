import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid, Card, CardContent, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";

const CommentsPage = () => {
    const { songId } = useParams();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!songId) return; // Evitar hacer la solicitud si no hay songId

        const fetchComments = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/comments/${songId}/`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                setComments(response.data);
            } catch (error) {
                setErrors({ general: `No se pudieron cargar los comentarios. ${error.message}` });
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [songId]);

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setErrors({ general: "El comentario no puede estar vacío." });
            return;
        }

        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/comments/${songId}/`,
                { content: newComment },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setComments((prevComments) => [...prevComments, response.data]);
            setSuccessMessage("Comentario enviado correctamente.");
            setOpenSnackbar(true);
            setNewComment(""); // Limpiar el campo
        } catch (error) {
            setErrors({ general: "Error al enviar el comentario." });
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4">Comentarios</Typography>
            {errors.general && <Alert severity="error">{errors.general}</Alert>}

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
                <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }} aria-label="Enviar comentario">
                    Enviar Comentario
                </Button>
            </form>

            {loading ? (
                <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
            ) : (
                <Grid container spacing={2} sx={{ marginTop: 4 }}>
                    {comments.map((comment) => (
                        <Grid item xs={12} key={comment.id}>
                            <Card sx={{ marginBottom: 2 }}>
                                <CardContent>
                                    <Typography variant="body1">{comment.content}</Typography>
                                    <Typography variant="body2" sx={{ color: "#777" }}>
                                        {comment.author}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity="success">
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CommentsPage;



