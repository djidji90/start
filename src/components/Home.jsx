// SignUpCard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";

const API_URL = "http://127.0.0.1:8000/api/register/"; // Cambia esto por tu http://localhost:5175API real en producción

export default function SignUpCard() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    neighborhood: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { password, confirmPassword, email, firstName, lastName, phone } =
      formData;

    // Validaciones básicas
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError("Por favor, completa todos los campos obligatorios.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    if (!/^\d+$/.test(phone)) {
      setError("El número de teléfono solo puede contener dígitos.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Registro exitoso. Redirigiendo al inicio de sesión...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al registrar. Intenta de nuevo.");
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
          maxWidth: 500,
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Crea tu cuenta en Djidji Music 🎵
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          gutterBottom
        >
          Regístrate para disfrutar de la mejor música.
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

        <Box component="form" noValidate sx={{ mt: 2 }} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                name="firstName"
                variant="outlined"
                fullWidth
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido"
                name="lastName"
                variant="outlined"
                fullWidth
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Correo electrónico"
                name="email"
                variant="outlined"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contraseña"
                name="password"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Teléfono"
                name="phone"
                variant="outlined"
                fullWidth
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ciudad"
                name="city"
                variant="outlined"
                fullWidth
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Barrio"
                name="neighborhood"
                variant="outlined"
                fullWidth
                value={formData.neighborhood}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Registrarse"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
