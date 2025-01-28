import React, { useEffect, useState, useRef } from "react";
import { Grid, Box, CircularProgress, Typography, Button } from "@mui/material";
import axios from "axios";
import SongCard from "./SongCard";  // Asegúrate de importar el componente SongCard

const getAuthHeader = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

// Hook personalizado para manejar la paginación
const usePaginatedSongs = (page, songsPerPage) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadingRef = useRef(false); // Evitar solicitudes duplicadas

  useEffect(() => {
    const fetchSongs = async () => {
      if (loadingRef.current || !hasMore) return; // Evitar solicitudes duplicadas
      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await axios.get("http://127.0.0.1:8000/api2/songs/random/", {
          headers: getAuthHeader(),
          params: { page, page_size: songsPerPage },
        });

        const randomSongs = response.data?.random_songs || [];
        setSongs((prev) => [...prev, ...randomSongs]);
        setHasMore(randomSongs.length === songsPerPage); // Si hay menos canciones que la cantidad por página, no hay más
        loadingRef.current = false;
        setLoading(false);
      } catch (err) {
        console.error("Error fetching random songs:", err);
        setError(err.response?.data?.detail || "Error desconocido");
        loadingRef.current = false;
        setLoading(false);
      }
    };

    fetchSongs();
  }, [page, songsPerPage, hasMore]);

  return { songs, loading, hasMore, error };
};

const RandomSongs = () => {
  const [page, setPage] = useState(1); // Página actual
  const songsPerPage = 3; // Número de canciones por página
  const { songs, loading, hasMore, error } = usePaginatedSongs(page, songsPerPage);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1); // Cargar más canciones si hay más
    }
  };

  if (loading && page === 1) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
          Cargando canciones...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (songs.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6">No se encontraron canciones aleatorias.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3} padding={3} justifyContent="center">
        {songs.map((song) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
            <SongCard
              song={song}
              onLike={(songId) => {
                console.log(`Like song with ID: ${songId}`);
              }}
            />
          </Grid>
        ))}
      </Grid>

      {hasMore ? (
        <Box sx={{ textAlign: "center", marginTop: 3 }}>
          <Button variant="contained" onClick={loadMore} disabled={loading}>
            {loading ? "Cargando..." : "Cargar más canciones"}
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", marginTop: 3 }}>
          <Typography variant="h6" color="textSecondary">
            ¡No hay más canciones para mostrar!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RandomSongs;



