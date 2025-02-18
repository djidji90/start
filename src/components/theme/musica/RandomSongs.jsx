import React, { useEffect, useState, useRef, useCallback } from "react";
import { Grid, Box, CircularProgress, Typography, Button } from "@mui/material";
import axios from "axios";
import SongCard from "./SongCard";

const getAuthHeader = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

// Hook para manejar la carga de canciones
const useFetchSongs = (page, songsPerPage, setSongs, setHasMore, setLoading, setError) => {
  const loadingRef = useRef(false);

  const fetchSongs = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await axios.get("http://127.0.0.1:8000/api2/songs/random/", {
        headers: getAuthHeader(),
        params: { page, page_size: songsPerPage },
      });

      const randomSongs = response.data?.random_songs || [];

      setSongs((prev) => {
        const uniqueSongs = [...prev, ...randomSongs].filter(
          (song, index, self) => index === self.findIndex((s) => s.id === song.id)
        );
        return uniqueSongs;
      });

      setHasMore(randomSongs.length === songsPerPage);
    } catch (err) {
      console.error("Error fetching random songs:", err);
      setError(err.response?.data?.detail || "Error desconocido");
    }

    loadingRef.current = false;
    setLoading(false);
  }, [page, songsPerPage]);

  return fetchSongs;
};

const RandomSongs = () => {
  const [songs, setSongs] = useState([]); // Estado de las canciones
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchSongs = useFetchSongs(page, 3, setSongs, setHasMore, setLoading, setError);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // ✅ Nueva función para manejar los likes
  const handleLike = async (songId) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === songId
          ? { ...song, liked: !song.liked, likes_count: song.liked ? song.likes_count - 1 : song.likes_count + 1 }
          : song
      )
    );

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api2/songs/${songId}/like/`,
        {},
        { headers: getAuthHeader() }
      );

      // ⚠️ Solo actualiza el número de likes si la API devuelve el valor actualizado
      if (response.data?.likes_count !== undefined) {
        setSongs((prev) =>
          prev.map((song) =>
            song.id === songId ? { ...song, likes_count: response.data.likes_count } : song
          )
        );
      }
    } catch (err) {
      console.error("Error al dar like:", err);
    }
  };

  if (loading && page === 1) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={60} />
        <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
          Cargando canciones...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  if (songs.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Typography variant="h6">No se encontraron canciones aleatorias.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3} padding={3} justifyContent="center">
        {songs.map((song) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
            <SongCard song={song} onLike={handleLike} />
          </Grid>
        ))}
      </Grid>

      {hasMore ? (
        <Box sx={{ textAlign: "center", marginTop: 3 }}>
          <Button variant="contained" onClick={loadMore} disabled={loading}>
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Cargar más canciones"}
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", marginTop: 3 }}>
          <Typography variant="h6" color="textSecondary">¡No hay más canciones para mostrar!</Typography>
        </Box>
      )}
    </Box>
  );
};

export default RandomSongs;

