import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Download,
  Comment,
} from "@mui/icons-material";
import axios from "axios";
import CommentsPage from "./CommentsPage";
import AudioPlayerComponent from "./AudioPlayerComponent";

const SongDetailsPage = () => {
  const { songId } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api2/songs/${songId}/`
        );
        setSong(response.data);
        setLikesCount(response.data.likes_count);
        setIsLiked(response.data.is_liked_by_user);
      } catch (err) {
        setError("No se pudo cargar los detalles de la canción.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [songId]);

  const handleLikeToggle = async () => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api2/songs/${songId}/like/`
      );
      setLikesCount(response.data.likes_count);
      setIsLiked(!isLiked);
      setSnackbarMessage(response.data.message);
      setOpenSnackbar(true);
    } catch (err) {
      setSnackbarMessage("Error al procesar la acción de like.");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={
                song.image?.startsWith("http")
                  ? song.image
                  : `http://127.0.0.1:8000/api2/media/${
                      song.image || "images/placeholder.jpg"
                    }`
              }
              alt={song.artist}
            />
            <CardContent>
              <Typography variant="h5">{song.title}</Typography>
              <Typography variant="subtitle1">{song.artist}</Typography>
              <Typography variant="body2">Género: {song.genre}</Typography>
              <Typography variant="body2">
                Fecha de lanzamiento: {song.release_date}
              </Typography>
            </CardContent>
            <Box display="flex" justifyContent="space-around" padding={2}>
              <IconButton onClick={handleLikeToggle} color="primary">
                {isLiked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <Typography>{likesCount} Likes</Typography>

              <Button
                variant="contained"
                startIcon={<Download />}
                href={song.file_url}
                download
              >
                Descargar
              </Button>

              <IconButton color="primary">
                <Comment />
              </IconButton>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ marginBottom: 4 }}>
            <AudioPlayerComponent song={song} />
          </Box>

          <Box>
            <CommentComponent songId={songId} />
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="info">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SongDetailsPage;

