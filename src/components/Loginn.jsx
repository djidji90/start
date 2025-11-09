import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useConfig } from "./hook/useConfig";
import { keyframes } from "@emotion/react"; // solo keyframes
import styled from "@emotion/styled";       // styled viene de aquí

// Animación de fade-in
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoginContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LoginBox = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: '16px',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '440px',
  boxShadow: theme.shadows[3],
  animation: `${fadeIn} 0.6s ease-out`,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
  }
}));

const Login = () => {
  const { api } = useConfig();
  const navigate = useNavigate();
  const usernameRef = useRef(null);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = useCallback((name, value) => {
    if (name === "username" && !value.trim()) return "Nombre de usuario requerido";
    if (name === "password" && !value) return "Contraseña requerida";
    return null;
  }, []);

  const validateAllFields = useCallback(() => {
    const newErrors = {
      username: validateField("username", formData.username),
      password: validateField("password", formData.password)
    };
    setErrors(newErrors);
    setTouched({ username: true, password: true });
    return Object.values(newErrors).every(err => !err);
  }, [formData, validateField]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateAllFields()) {
      setErrors(prev => ({ ...prev, general: "Por favor corrige los errores" }));
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await axios.post(`${api.baseURL}musica/api/token/`, formData);

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("username", formData.username);

      setSuccessMessage(`Bienvenido a Djidji Music, ${formData.username}!`);
      setOpenSnackbar(true);

      setTimeout(() => navigate("/MainPage"), 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Error de autenticación. Verifica tus credenciales";
      setErrors({ general: errorMessage });
      if (errorMessage.includes("usuario")) usernameRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate, api.baseURL, validateAllFields]);

  const isFormValid = !validateField("username", formData.username) && !validateField("password", formData.password);

  return (
    <LoginContainer>
      <LoginBox>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Inicio de Sesión
        </Typography>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>{errors.general}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.username}
                helperText={errors.username}
                inputRef={usernameRef}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!isFormValid || isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <LoginIcon />}
              >
                {isSubmitting ? "Autenticando..." : "Ingresar"}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success">{successMessage}</Alert>
        </Snackbar>
      </LoginBox>
    </LoginContainer>
  );
};

export default React.memo(Login);
