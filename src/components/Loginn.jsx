import React, { useState } from "react";
import { Box, TextField, Button, Typography, Grid, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "El nombre de usuario es obligatorio.";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Hacemos la solicitud de login
      const response = await axios.post("http://127.0.0.1:8000/api/api/token/", formData);
      const { access } = response.data; // Obtenemos solo el token de acceso

      // Guardamos el token de acceso en localStorage
      localStorage.setItem("accessToken", access);

      setSuccessMessage("Hola!! Bienvenid@ a djidji music");
      setOpenSnackbar(true);

      setFormData({ username: "", password: "" });

      // Redirigimos a la página de inicio o al dashboard después de un breve retraso
      setTimeout(() => navigate("/MainPage"), 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        // Si el error es de autenticación (usuario o contraseña incorrectos)
        if (error.response.data.detail) {
          setErrors({ general: error.response.data.detail });
        } else {
          setErrors(error.response.data); // Otros errores del backend
        }
      } else {
        setErrors({ general: "Ocurrió un error inesperado. Intenta nuevamente." }); // Error genérico
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleRegisterRedirect = () => {
    navigate("/SingInPage"); // Cambia "/register" por la ruta de tu página de registro.
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f4f6f9" }}>
      <Box sx={{ width: "100%", maxWidth: 400, padding: 4, backgroundColor: "#fff", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" sx={{ marginBottom: 2, color: "#1976d2" }}>
          Iniciar Sesión
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            {errors.general && (
              <Grid item xs={12}>
                <Alert severity="error">{errors.general}</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading}>
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="text"
                color="secondary"
                onClick={handleRegisterRedirect}
                sx={{ marginTop: 1 }}
              >
                ¿No tienes cuenta? Regístrate aquí
              </Button>
            </Grid>
          </Grid>
        </form>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Login;


