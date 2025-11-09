  import React, { useState } from "react";
  import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Grid, 
    Snackbar, 
    Alert, 
    InputAdornment, 
    IconButton, 
    CircularProgress,
    useTheme,
    styled 
  } from "@mui/material";
  import { Visibility, VisibilityOff, Login as LoginIcon } from "@mui/icons-material";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";
  import { keyframes } from "@emotion/react";
  import { useConfig } from "./hook/useConfig";  // Importando useConfig para acceder a las variables de entorno

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
    const theme = useTheme();
    const { api } = useConfig(); // Usamos el hook para obtener las configuraciones
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [ipAddress, setIpAddress] = useState(null);
    const navigate = useNavigate();

    const fetchIPAddress = async () => {
      try {
        const response = await axios.get("https://api64.ipify.org?format=json");
        setIpAddress(response.data.ip);
      } catch (error) {
        console.error("Error al obtener la IP del usuario:", error);
      }
    };

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.username.trim()) newErrors.username = "Nombre de usuario requerido";
      if (!formData.password) newErrors.password = "La contraseña es obligatoria";
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
        // Obtener la IP antes de enviar la solicitud
        if (!ipAddress) await fetchIPAddress();

        const response = await axios.post(`${api.baseURL}/api/api/token/`, {
          ...formData,
          ip: ipAddress,
        });

        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("username", formData.username);

        setSuccessMessage(`Bienvenido a djidji music, ${formData.username}!`);
        setOpenSnackbar(true);

        setTimeout(() => navigate("/MainPage"), 1500);
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 
          "Error de autenticación. Verifica tus credenciales";
        setErrors({ general: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    return (
      <LoginContainer>
        <LoginBox>
          <Typography variant="h4" sx={{ 
            mb: 4,
            fontWeight: 700,
            color: theme.palette.text.primary,
            textAlign: 'center'
          }}>
            Inicio de Sesión
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de Usuario"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>

              {errors.general && (
                <Grid item xs={12}>
                  <Alert 
                    severity="error" 
                    variant="outlined"
                    sx={{ borderRadius: '8px', alignItems: 'center' }}
                  >
                    {errors.general}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LoginIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      boxShadow: theme.shadows[2]
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'Autenticando...' : 'Ingresar'}
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
            <Alert 
              severity="success" 
              variant="filled"
              sx={{ 
                borderRadius: '8px',
                boxShadow: theme.shadows[2],
                alignItems: 'center'
              }}
            >
              {successMessage}
            </Alert>
          </Snackbar>
        </LoginBox>
      </LoginContainer>
    );
  };

  export default Login;
