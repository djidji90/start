import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CardActions,
  Skeleton,
  useTheme,
  Alert,
} from "@mui/material";
import { Favorite, Download, PlayArrow } from "@mui/icons-material";

const PopularSongs = ({ onLike, onDownload, onStream }) => {
  const [popularSongs, setPopularSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();

  // Fetch popular songs from the API
  const fetchPopularSongs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://127.0.0.1:8000/api2/songs/");
      setPopularSongs(response.data.results);
    } catch (err) {
      setError("No se pudieron cargar las canciones populares.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularSongs();
  }, []);

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>
        Canciones populares
      </Typography>

      {/* Mostrar mensaje de error si ocurre */}
      {error && (
        <Box sx={{ marginBottom: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading ? (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {popularSongs.map((song) => (
            <Grid item xs={12} sm={6} md={4} key={song.id}>
              <Card
                sx={{
                  boxShadow: theme.shadows[3],
                  transition: "transform 0.2s ease-in-out",
                  ":hover": { transform: "scale(1.05)" },
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={song.cover_image || "/placeholder-image.jpg"}
                  alt={song.title}
                />
                <CardContent>
                  <Typography variant="h6" component="div" noWrap>
                    {song.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {song.artist}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<Favorite />}
                    onClick={() => onLike(song.id)}
                  >
                    Like
                  </Button>
                  <Button
                    size="small"
                    color="secondary"
                    startIcon={<Download />}
                    onClick={() => onDownload(song.id, song.title)}
                  >
                    Descargar
                  </Button>
                  <Button
                    size="small"
                    color="success"
                    startIcon={<PlayArrow />}
                    onClick={() => onStream(song.id)}
                  >
                    Escuchar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PopularSongs;
