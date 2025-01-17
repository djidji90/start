import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItem, Button, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const UserProfilePage = () => {
  const [favorites, setFavorites] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const responseFavorites = await axios.get("http://127.0.0.1:8000/api2/users/favorites/");
        const responseDownloads = await axios.get("http://127.0.0.1:8000/api2/users/downloads/");
        setFavorites(responseFavorites.data);
        setDownloads(responseDownloads.data);
      } catch (err) {
        setError("No se pudo cargar la información del usuario.");
      }
    };

    fetchUserData();
  }, []);

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Perfil de Usuario
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6">Canciones Favoritas</Typography>
        <List>
          {favorites.map((song) => (
            <ListItem key={song.id}>
              <Typography>{song.title} - {song.artist}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6">Historial de Descargas</Typography>
        <List>
          {downloads.map((song) => (
            <ListItem key={song.id}>
              <Typography>{song.title} - {song.artist}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfilePage;
