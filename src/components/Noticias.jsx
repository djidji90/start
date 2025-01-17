import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";

const API_URL = "http://127.0.0.1:8000/api/modelo1/"; // Cambia esto por tu API real

const SongPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch songs from the API
  const fetchSongs = async (query = "", pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}?query=${query}&page=${pageNumber}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSongs(data.songs);
      } else {
        console.error("Error fetching songs");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchSongs(searchQuery, 1);
  };

  // Pagination handlers
  const handleNextPage = () => {
    setPage((prev) => {
      const nextPage = prev + 1;
      fetchSongs(searchQuery, nextPage);
      return nextPage;
    });
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => {
        const previousPage = prev - 1;
        fetchSongs(searchQuery, previousPage);
        return previousPage;
      });
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh", py: 5 }}>
      <Container>
        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            mb: 4,
            justifyContent: "center",
          }}
        >
          <TextField
            label="Buscar canciones o artistas"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary">
            Buscar
          </Button>
        </Box>

        {/* Songs Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {songs.map((song) => (
              <Grid item xs={12} sm={6} md={4} key={song.id}>
                <SongCard song={song} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleNextPage}
          >
            Siguiente
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SongPage;

  
