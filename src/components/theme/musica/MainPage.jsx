import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
  useTheme,
  styled,
  Avatar,
  Tooltip,
  CircularProgress,
   // <- asegúrate que está esta línea
} from '@mui/material';
import { Grid } from '@mui/material';

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import SongSearchPage from "./SearchBar";
import RandomSongs from "./RandomSongs";
import FunImagePage from "./PopularSongs";
import SongCard from "./SongCard";
import CommentsSection from "./CommentsPage";
import UploadSongModal from "./UploadSongModal"; // Importa el modal

const MainPage = () => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [songs, setSongs] = useState([]); // Opcional: si quieres manejar listado aquí

  const mainContainerRef = useRef(null);
  const theme = useTheme();

  // Manejar la interacción inicial del usuario
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
  };

  useEffect(() => {
    const container = mainContainerRef.current;

    const events = ["click", "touchstart", "keydown"];
    const handleInteraction = () => handleUserInteraction();

    events.forEach((event) => {
      container.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        container.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  // Función para manejar el streaming seguro
  const handleStream = (songId) => {
    if (!userInteracted) {
      displayError(
        "Por favor haz clic en cualquier parte de la página para activar la reproducción"
      );
      return;
    }
    // Lógica de streaming aquí
  };

  // Resto de handlers (debes implementar)
  const handleLike = (songId) => {
    // ...
  };
  const handleDownload = (songId, title) => {
    // ...
  };

  const handleCommentClick = (song) => {
    setSelectedSong(song);
    setCommentsVisible(true);
  };

  const closeComments = () => {
    setSelectedSong(null);
    setCommentsVisible(false);
  };

  const displayError = (message) => {
    setError(true);
    setErrorMessage(message);
  };

  const handleRetry = () => {
    setError(false);
    setErrorMessage("");
  };

  // Nuevo: abrir modal subir canción
  const openUploadModal = () => {
    setUploadModalOpen(true);
  };
  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  // Nuevo: cuando se suba una canción, actualizamos estado o refrescamos listado
  const onUploadSuccess = (newSong) => {
    // Si tienes lógica para refrescar listado, agrégala aquí.
    // Por ejemplo, si manejas songs aquí:
    setSongs((prev) => [newSong, ...prev]);

    // También puedes mostrar mensaje o hacer otras acciones
  };

  return (
    <Box
      ref={mainContainerRef}
      sx={{
        padding: 4,
        backgroundColor: theme.palette.background.paper,
        minHeight: "100vh",
      }}
      tabIndex="0"
      role="button"
    >
      {/* Botón para abrir modal subir canción */}
      <Box sx={{ mb: 4, textAlign: "right" }}>
        <Button variant="contained" color="primary" onClick={openUploadModal}>
          sube tu Nueva cancìon
        </Button>
      </Box>

      {/* Modal para subir canción */}
      <UploadSongModal
        open={uploadModalOpen}
        onClose={closeUploadModal}
        onUploadSuccess={onUploadSuccess}
      />

      {/* Contenido principal */}
      <Box sx={{ marginBottom: 4 }}>
        <SongSearchPage
          onLike={handleLike}
          onDownload={handleDownload}
          onStream={handleStream}
          userInteracted={userInteracted}
        />
      </Box>

      <Box sx={{ marginTop: 6, marginBottom: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Pacifico, cursive",
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: 3,
            color: "primary.main",
          }}
        >
          Descubre nuevas canciones
        </Typography>

        <RandomSongs
          onLike={handleLike}
          onDownload={handleDownload}
          onStream={handleStream}
          onCommentClick={handleCommentClick}
          userInteracted={userInteracted}
          songs={songs} // si RandomSongs acepta canciones como prop
        />
      </Box>

      <FunImagePage userInteracted={userInteracted} />

      {/* Sección de errores */}
      {error && (
        <Box sx={{ textAlign: "center", marginTop: 3 }}>
          <Alert severity="error">{errorMessage}</Alert>
          <Button
            onClick={handleRetry}
            sx={{
              marginTop: 2,
              backgroundColor: theme.palette.secondary.main,
              "&:hover": { backgroundColor: theme.palette.secondary.dark },
            }}
            variant="contained"
          >
            Intentar nuevamente
          </Button>
        </Box>
      )}

      {/* Sección de comentarios */}
      {commentsVisible && selectedSong && (
        <Box
          sx={{
            padding: 3,
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
            marginTop: 4,
            boxShadow: 4,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Comentarios para: {selectedSong.title} - {selectedSong.artist}
          </Typography>
          <Button
            onClick={closeComments}
            sx={{ marginBottom: 2 }}
            variant="contained"
            color="primary"
          >
            Cerrar comentarios
          </Button>
          <CommentsSection songId={selectedSong.id} />
        </Box>
      )}

      {/* Snackbar de error */}
      <Snackbar
        open={error}
        autoHideDuration={6000}
        onClose={() => setError(false)}
      >
        <Alert onClose={() => setError(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainPage;
