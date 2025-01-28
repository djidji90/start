import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Snackbar,
  Alert,
  Button,
  useTheme,
} from "@mui/material";
import SongSearchPage from "./SearchBar"; // Componente de búsqueda de canciones
import RandomSongs from "./RandomSongs"; // Componente de canciones aleatorias
import FunImagePage from "./PopularSongs"; // Componente de canciones populares
import SongCard from "./SongCard"; // Tarjeta de canción
import CommentsSection from './CommentsPage';


const MainPage = () => {
  const [error, setError] = useState(false); // Estado para manejar errores
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error
  const [selectedSong, setSelectedSong] = useState(null); // Canción seleccionada para comentarios
  const [commentsVisible, setCommentsVisible] = useState(false); // Estado para mostrar comentarios
  const theme = useTheme();

  // Función para manejar los "likes"
  const handleLike = (songId) => {
    console.log("Like en la canción con ID: ", songId);
  };

  // Función para manejar las descargas
  const handleDownload = (songId, title) => {
    console.log("Descargando canción con ID: ", songId, "y título: ", title);
  };

  // Función para manejar el streaming
  const handleStream = (songId) => {
    console.log("Reproduciendo canción con ID: ", songId);
  };

  // Función para manejar los comentarios
  const handleCommentClick = (song) => {
    console.log("Canción seleccionada para comentarios:", song);
    setSelectedSong(song); // Pasa toda la canción, incluyendo id, title y artist
    setCommentsVisible(true);
  };

  // Función para cerrar el área de comentarios
  const closeComments = () => {
    setSelectedSong(null);
    setCommentsVisible(false);
  };

  // Si hay un error, mostrar el mensaje correspondiente
  const displayError = (message) => {
    setError(true);
    setErrorMessage(message);
  };

  const handleRetry = () => {
    setError(false); // Resetear el estado de error
    setErrorMessage(""); // Limpiar el mensaje de error
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: theme.palette.background.paper }}>
      {/* Barra de búsqueda */}
      <Box sx={{ marginBottom: 4 }}>
        <SongSearchPage
          onLike={handleLike}
          onDownload={handleDownload}
          onStream={handleStream}
        />
      </Box>

      {/* Noticias y anuncios */}
  
    
      <Box sx={{ marginTop: 6, marginBottom: 6 }}>
        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>
          Descubre nuevas canciones
        </Typography>
        <RandomSongs
          onLike={handleLike}
          onDownload={handleDownload}
          onStream={handleStream}
          onCommentClick={handleCommentClick}
        />
      </Box>


            {/* Canciones populares */}
            <FunImagePage />

{/* Canciones aleatorias */}

      {/* Manejo de errores global */}
      {error && (
        <Box sx={{ textAlign: "center", marginTop: 3 }}>
          <Alert severity="error">{errorMessage}</Alert>
          <Button
            onClick={handleRetry}
            sx={{
              marginTop: 2,
              backgroundColor: theme.palette.secondary.main,
              "&:hover": {
                backgroundColor: theme.palette.secondary.dark,
              },
            }}
            variant="contained"
            color="secondary"
          >
            Intentar nuevamente
          </Button>
        </Box>
      )}

      {/* Visualización de comentarios */}
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
          <Box>
            {/* Renderiza el componente CommentsSection aquí */}
            <CommentsSection songId={selectedSong.id} />
          </Box>
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



