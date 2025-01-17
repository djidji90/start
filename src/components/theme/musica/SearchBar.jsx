  import React, { useState, useEffect } from "react";
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
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    DialogActions,
    IconButton,
    Autocomplete,
  } from "@mui/material";
  import { ArrowBack, ArrowForward, Search } from "@mui/icons-material";
  import SongCard from './SongCard';

  // Estado global para almacenar los resultados de las canciones por página
  const songsCache = {};

  const SongSearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Obtener cabecera de autenticación
    const getAuthHeader = () => {
      const accessToken = localStorage.getItem("accessToken");
      return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    };

    // Manejo de errores centralizado
    const handleError = (err) => {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            return "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.";
          default:
            return "Ocurrió un error al procesar la solicitud. Intenta nuevamente.";
        }
      } else if (err.request) {
        return "No se pudo conectar al servidor. Revisa tu conexión a Internet.";
      } else {
        return "Error desconocido al realizar la solicitud.";
      }
    };

    // Realizar la búsqueda de canciones
    const handleSearch = async (page = 1) => {
      if (!searchQuery.trim()) {
        setError("Por favor, ingresa un término de búsqueda.");
        return;
      }

      setLoading(true);
      setError("");
      setSongs([]);
      setSuccessMessage("");

      // Verificar si los resultados están en la caché
      if (songsCache[page]) {
        setSongs(songsCache[page].results);
        setTotalPages(Math.ceil(songsCache[page].count / 10));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api2/songs/?search=${searchQuery}&page=${page}`,
          { headers: getAuthHeader() }
        );
        songsCache[page] = response.data; // Almacenar en la caché
        setSongs(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (err) {
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    // Cambiar de página
    const handlePageChange = async (direction) => {
      if (direction === "next" && currentPage < totalPages) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        await handleSearch(nextPage);
      } else if (direction === "prev" && currentPage > 1) {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        await handleSearch(prevPage);
      }
    };

    // Agregar un like a la canción
    const handleLike = async (songId) => {
      try {
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
        setSuccessMessage("¡Le diste like a la canción!");
        setOpenSnackbar(true);
      } catch (err) {
        setError(handleError(err));
      }
    };

    // Descargar canción
    const handleDownload = async (songId, title) => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api2/songs/${songId}/download/`,
          { responseType: "blob", headers: getAuthHeader() }
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${title}.mp3`);
        document.body.appendChild(link);
        link.click();
      } catch (err) {
        setError(handleError(err));
      }
    };
    // Ver comentarios de la canción
    const handleComments = async (songId) => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api2/songs/${songId}/comments/`,
          { headers: getAuthHeader() }
        );
        setCurrentSongComments(response.data.results);
        setOpenCommentsDialog(true);
      } catch (err) {
        setError("Ocurrió un error al cargar los comentarios.");
      }
    };

    // Agregar comentario a la canción
    const handleAddComment = async (songId) => {
      if (!newComment.trim()) return;

      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/api2/songs/${songId}/comments/`,
          { text: newComment },
          { headers: getAuthHeader() }
        );
        setCurrentSongComments((prevComments) => [...prevComments, response.data]);
        setNewComment("");
      } catch (err) {
        setError("Ocurrió un error al agregar el comentario.");
      }
    };

    // Reproducir la canción
    const handleStream = async (songId) => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api2/songs/${songId}/stream/`,
          { headers: getAuthHeader() }
        );
        setStreamUrl(response.data.url);
      } catch (err) {
        setError("Ocurrió un error al intentar reproducir la canción.");
      }
    };

    // Estrategia de recuperación ante fallos: botón para intentar de nuevo
    const handleRetry = () => {
      setError("");
      handleSearch(currentPage);
    };

    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" sx={{ marginBottom: 2 }}>
          Busca tus canciones favoritas
        </Typography>

        <Box sx={{ display: "flex", marginBottom: 2, alignItems: "center" }}>
          <Autocomplete
            freeSolo
            options={[]}
            value={searchQuery}
            onInputChange={(e, newValue) => setSearchQuery(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar canciones"
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  boxShadow: 5,
                  marginRight: 12,
                  backgroundColor: "white",
                }}
                aria-label="Buscar canciones"
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSearch()}
            sx={{
              padding: "10px 20px",
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: "#3f51b5",
              "&:hover": { backgroundColor: "#303f9f" },
            }}
            aria-label="Buscar"
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
                  onComments={handleComments}
                  onStream={handleStream}
                />
              </Grid>
            ))}
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
              aria-label="Página anterior"
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
              aria-label="Página siguiente"
            >
              Siguiente
            </Button>
          </Box>
        )}

        {error && (
          <Box sx={{ textAlign: "center", marginTop: 3 }}>
            <Alert severity="error">{error}</Alert>
            <Button onClick={handleRetry} sx={{ marginTop: 2 }} variant="contained" color="secondary">
              Intentar nuevamente
            </Button>
          </Box>
        )}

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  };

  export default SongSearchPage;

