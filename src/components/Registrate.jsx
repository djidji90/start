// pages/Register.jsx
import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useConfig } from "./hook/useConfig"; 
import PasswordInput from "./PasswordInput";

const Register = () => {
  const navigate = useNavigate();
  const { api } = useConfig();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    city: "",
    neighborhood: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const requiredFields = [
      "username",
      "email",
      "password",
      "password2",
      "first_name",
      "last_name",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = "Este campo es requerido";
    });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido";
    }

    if (formData.password !== formData.password2) {
      newErrors.password2 = "Las contraseñas no coinciden";
    }

    if (!/(?=.*[A-Z])(?=.*\d).{8,}/.test(formData.password)) {
      newErrors.password = "Mínimo 8 caracteres, 1 mayúscula y 1 número";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await axios.post(`${api.baseURL}/api/register/`, formData);
      
      setSuccessMessage("¡Registro exitoso! Redirigiendo...");
      setOpenDialog(true);
      
      setTimeout(() => {
        setOpenDialog(false);
        navigate("/");
      }, 3000);

    } catch (error) {
      const errorData = error.response?.data || {};
      setErrors({
        general: "Error en el registro",
        ...errorData.errors,
        ...errorData
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [api.baseURL, formData, navigate, validateForm]);

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" sx={styles.title}>
        Registro de Usuario
      </Typography>

      {errors.general && <Alert severity="error" sx={styles.alert}>{errors.general}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Campos del formulario */}
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
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={!!errors.city}
              helperText={errors.city}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Barrio"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              error={!!errors.neighborhood}
              helperText={errors.neighborhood}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="+5491123456789"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PasswordInput
              name="password"
              label="Contraseña"
              value={formData.password}
              onChange={handleChange}
              show={showPassword}
              toggleShow={() => setShowPassword(!showPassword)}
              error={errors.password}
              helperText={errors.password}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PasswordInput
              name="password2"
              label="Confirmar Contraseña"
              value={formData.password2}
              onChange={handleChange}
              show={showPassword2}
              toggleShow={() => setShowPassword2(!showPassword2)}
              error={errors.password2}
              helperText={errors.password2}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={styles.button}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Typography sx={styles.loginText}>
        ¿Ya tienes cuenta?{" "}
        <Button onClick={() => navigate("/")} sx={styles.loginLink}>
          Iniciar sesión
        </Button>
      </Typography>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>¡Registro Exitoso!</DialogTitle>
        <DialogContent>{successMessage}</DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/login")} color="primary">
            Ir a Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    mt: 5,
    p: 3,
    borderRadius: 2,
    boxShadow: 3,
    bgcolor: "background.paper",
  },
  title: {
    textAlign: "center",
    mb: 4,
    fontWeight: "bold",
    color: "primary.main",
  },
  alert: {
    mb: 2,
  },
  button: {
    py: 1.5,
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  loginText: {
    textAlign: "center",
    mt: 3,
    fontSize: "0.95rem",
  },
  loginLink: {
    textTransform: "none",
    fontWeight: "bold",
  },
};

Register.propTypes = {
  navigate: PropTypes.func,
};

export default React.memo(Register);