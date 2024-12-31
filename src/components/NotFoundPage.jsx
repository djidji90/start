// pages/NotFoundPage.js
import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h3" color="error" gutterBottom>
        404 - Página No Encontrada
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Lo sentimos, no pudimos encontrar la página que buscas.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/"
      >
        Volver al Inicio
      </Button>
    </Box>
  );
};

export default NotFoundPage;
