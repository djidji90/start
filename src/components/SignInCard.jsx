// SignInCard.js
import React, { useState } from "react";
import { useAuth } from "./hook/UseAut";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";

const API_URL = "https://mock-api.com/auth"; // Cambia esto por tu API real en producción

export default function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignIn = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Inicio de sesión exitoso. Bienvenido de nuevo.");
        // Puedes guardar el token en el almacenamiento local o en un contexto global
        localStorage.setItem("authToken", data.token);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al iniciar sesión.");
      }
    } catch (err) {
      setError("Error de red. Por favor, inténtalo nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f6f8",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Bienvenid@ a Djidji Music 🎵
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          gutterBottom
        >
          Inicia sesión para explorar y compartir tu música favorita.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" noValidate sx={{ mt: 2 }} onSubmit={handleSignIn}>
          <TextField
            label="Correo electrónico"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            variant="outlined"
            fullWidth
            type="password"
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Iniciar Sesión"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() =>
              alert("Funcionalidad para crear cuenta próximamente")
            }
          >
            Crear Cuenta
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
