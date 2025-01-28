import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import { ArrowBack, ArrowForward, Search } from "@mui/icons-material";
import SongCard from "./SongCard";
import { debounce } from "lodash"; // Usaremos lodash para el debounce

const SongSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getAuthHeader = () => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  };

  const handleSearch = async () => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      setError("Por favor, ingresa un término de búsqueda.");
      return;
    }

    setLoading(true);
    setError("");
    setSongs([]);
    setArtists([]);
    setSuccessMessage("");

    try {
      const songResponse = await axios.get(
        `http://127.0.0.1:8000/api2/songs/?artist=${normalizedQuery}&?title=${normalizedQuery}&page=${currentPage}`,
        { headers: getAuthHeader() }
      );

      if (songResponse.data.results.length > 0) {
        setSongs(songResponse.data.results);
        setTotalPages(Math.ceil(songResponse.data.count / 3));
      } else {
        const artistResponse = await axios.get(
          `http://127.0.0.1:8000/api2/songs/?title=${normalizedQuery}`,
          { headers: getAuthHeader() }
        );

        if (artistResponse.data.length > 0) {
          setArtists(artistResponse.data);
        } else {
          const allArtistsResponse = await axios.get(
            `http://127.0.0.1:8000/api2/artists/`,
            { headers: getAuthHeader() }
          );
          setArtists(allArtistsResponse.data);
          if (allArtistsResponse.data.length === 0) {
            setError("No se encontraron canciones ni artistas con ese término.");
          }
        }
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
      } else if (err.response.status === 404) {
        setError("No se encontraron resultados para la búsqueda.");
      } else {
        setError("Ocurrió un error en el servidor. Intenta nuevamente.");
      }
    } else if (err.request) {
      setError("No se pudo conectar al servidor. Revisa tu conexión a Internet.");
    } else {
      setError("Error desconocido al realizar la búsqueda.");
    }
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      handleSearch();
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
      handleSearch();
    }
  };

  const handleLike = async (songId) => {
    try {
      const song = songs.find((song) => song.id === songId);
      const liked = song.likes > 0;

      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId
            ? { ...song, likes: liked ? song.likes - 1 : song.likes + 1 }
            : song
        )
      );

      const response = await axios.post(
        `http://127.0.0.1:8000/api2/songs/${songId}/like/`,
        {},
        { headers: getAuthHeader() }
      );

      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId ? { ...song, likes: response.data.likes } : song
        )
      );
      setSuccessMessage(liked ? "Has eliminado el like." : "¡Le diste like a la canción!");
      setOpenSnackbar(true);
    } catch {
      setError("Ocurrió un error al dar like. Intenta nuevamente.");
    }
  };

  const handleDownload = async (songId, title) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api2/songs/${songId}/download/`,
        { responseType: "blob", headers: getAuthHeader() }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.webm`);
      document.body.appendChild(link);
      link.click();
    } catch {
      setError("Ocurrió un error al descargar la canción.");
    }
  };

  const handleStream = async (songId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api2/songs/${songId}/stream/`,
        { headers: getAuthHeader() }
      );
      window.open(response.data.url, "_blank");
    } catch {
      setError("Ocurrió un error al intentar reproducir la canción.");
    }
  };

  const debouncedSearch = debounce(handleSearch, 500); // Agregamos debounce para la búsqueda

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" fontStyle={"unset"} color="textDisabled" bgcolor={"Menu"} sx={{ marginBottom: 2 }}>
        Encuentra tus canciones favoritas
      </Typography>

      <Box sx={{ display: "flex", marginBottom: 2, alignItems: "center" }}>
        <Autocomplete
          freeSolo
          options={[]}
          value={searchQuery}
          onInputChange={(e, newValue) => setSearchQuery(newValue)}
          onChange={(e, newValue) => debouncedSearch()} // Activamos el debouncedSearch
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar canciones o artistas"
              fullWidth
              variant="outlined"
              sx={{ borderRadius: 1, boxShadow: 12, marginRight: 2, backgroundColor: "whitesmoke" }}
            />
          )}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          sx={{ padding: "14px 20px", borderRadius: 3, boxShadow: 12, backgroundColor: "#3f51b5", "&:hover": { backgroundColor: "#303f9f" } }}
        >
          <Search />
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {songs.map((song) => (
            <Grid item xs={12} sm={6} md={4} key={song.id}>
              <SongCard
                song={song}
                onLike={handleLike}
                onDownload={handleDownload}
                onStream={handleStream}
              />
            </Grid>
          ))}
          {artists.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ marginTop: 3 }}>
                Artistas encontrados:
              </Typography>
              <ul>
                {artists.map((artist) => (
                  <li key={artist.id}>{artist.name}</li>
                ))}
              </ul>
            </Grid>
          )}
        </Grid>
      )}

      {songs.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <Button
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => handlePageChange("prev")}
            startIcon={<ArrowBack />}
            sx={{ borderRadius: 3, padding: "6px 12px", boxShadow: 2 }}
          >
            Anterior
          </Button>
          <Typography sx={{ alignSelf: "center" }}>
            Página {currentPage} de {totalPages}
          </Typography>
          <Button
            variant="outlined"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange("next")}
            endIcon={<ArrowForward />}
            sx={{ borderRadius: 3, padding: "6px 12px", boxShadow: 2 }}
          >
            Siguiente
          </Button>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ marginTop: 3 }}>{error}</Alert>}

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

export default SongSearchPage;



  
