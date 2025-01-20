import React, { useState } from "react";
import { Box, Grid, Typography, Snackbar, Alert, Button, useTheme } from "@mui/material";
import SongSearchPage from "./SearchBar"; // Componente de búsqueda de canciones
import NewsAndAdsSection from "./NewsAndAdsSection"; // Componente de noticias y anuncios


const MainPage = () => {
  const [error, setError] = useState(false); // Cambiado para tratar el error como un booleano
  const [errorMessage, setErrorMessage] = useState(""); // Nuevo estado para el mensaje de error
  const theme = useTheme();

  const handleLike = (songId) => {
    // Función para manejar los "likes"
    console.log("Like en la canción con ID: ", songId);
  };

  const handleDownload = (songId, title) => {
    // Función para manejar las descargas
    console.log("Descargando canción con ID: ", songId, "y título: ", title);
  };

  const handleStream = (songId) => {
    // Función para manejar el streaming
    console.log("Reproduciendo canción con ID: ", songId);
  };

  const handleRetry = () => {
    setError(false); // Resetear el estado de error
    setErrorMessage(""); // Limpiar el mensaje de error
  };

  // Si hay un error, mostrar el mensaje correspondiente
  const displayError = (message) => {
    setError(true);
    setErrorMessage(message);
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: theme.palette.background.paper }}>
      {/* Barra de búsqueda al inicio */}
      <Box sx={{ marginBottom: 4 }}>
        <SongSearchPage
          onLike={handleLike}
          onDownload={handleDownload}
          onStream={handleStream}
        />
      </Box>

      {/* Componente de noticias y anuncios */}
      <Box sx={{ marginBottom: 6 }}>
    
      </Box>

      {/* Componente de canciones populares */}


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

      {/* Snackbar de error */}
      <Snackbar open={error} autoHideDuration={6000} onClose={() => setError(false)}>
        <Alert onClose={() => setError(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainPage;


