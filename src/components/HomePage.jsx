import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Pagination,
} from "@mui/material";
import SongCard from "./SongCard";
import { apiClient } from "../components/apiClient";
import { useMusicContext } from "../components/MusicContext";

const HomePage = () => {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { error, setError } = useMusicContext();

  const fetchSongs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient(`songs?query=${query}&page=${page}&limit=10`);
      setSongs(data.results);
      setTotalPages(Math.ceil(data.total_count / 10)); // Calcular total de páginas
    } catch (err) {
      setError(err.message || "Error al cargar las canciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [query, page]);

  const handleSearch = () => {
    setPage(1);
    fetchSongs();
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        🎵 Descubre y Disfruta Música 🎵
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
        <TextField
          variant="outlined"
          label="Buscar canciones o artistas"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          sx={{ maxWidth: 600 }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Buscar
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : songs.length === 0 ? (
        <Typography align="center">No se encontraron canciones.</Typography>
      ) : (
        <Grid container spacing={3}>
          {songs.map((song) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
              <SongCard song={song} />
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
        />
      </Box>
    </Box>
  );
};

export default HomePage;
