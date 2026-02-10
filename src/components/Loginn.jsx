import React, { useState, useContext, useEffect } from "react";
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
  styled,
  Link,
  Container
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon, Person, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { keyframes } from "@emotion/react";
import { useConfig } from "./hook/useConfig";
import { AuthContext } from "./hook/UseAut";

// Animación única y suave
const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

// Contenedor principal - Sólido y confiable
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#0A192F', // Sólido, no gradiente
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(
      to bottom right,
      rgba(10, 25, 47, 0.95),
      rgba(26, 26, 46, 0.98)
    )`,
  },
}));

// Header de marca - Claro y directo
const BrandHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  animation: `${fadeIn} 0.6s ease-out`,
}));

// Caja de login - Sólida y confiable
const LoginBox = styled(Box)(({ theme }) => ({
  background: '#1A202C', // Sólido oscuro
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '440px',
  animation: `${fadeIn} 0.6s ease-out 0.1s both`,
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: '#008751', // Sólido, no gradiente
    borderRadius: '12px 12px 0 0',
  },
  // Optimización mobile-first
  '@media (max-width: 600px)': {
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
  },
}));

// Inputs profesionales y legibles
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'border-color 0.2s ease',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    '&.Mui-focused': {
      borderColor: '#008751',
      boxShadow: '0 0 0 1px rgba(0, 135, 81, 0.2)',
    },
    '& input': {
      color: '#E2E8F0',
      padding: '14px 12px',
      fontSize: '0.95rem',
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.6)',
      transform: 'translate(14px, 16px) scale(1)',
      fontSize: '0.95rem',
      '&.Mui-focused, &.MuiFormLabel-filled': {
        color: '#CBD5E1',
        transform: 'translate(14px, -6px) scale(0.85)',
      },
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: '4px',
    fontSize: '0.8rem',
  },
}));

// Botón sólido y confiable
const StyledButton = styled(Button)(({ theme }) => ({
  background: '#008751', // Sólido
  color: '#FFFFFF',
  padding: '14px 28px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  border: 'none',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0, 135, 81, 0.3)',
  '&:hover': {
    background: '#00A86B',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 135, 81, 0.4)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
    boxShadow: 'none',
  },
  // Mobile optimization
  '@media (max-width: 600px)': {
    padding: '12px 24px',
  },
}));

// Separador limpio
const Separator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: '24px 0',
  color: 'rgba(255, 255, 255, 0.3)',
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  '& span': {
    padding: '0 12px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
}));

const Login = () => {
  const theme = useTheme();
  const { api } = useConfig();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ipAddress, setIpAddress] = useState(null);

  const fetchIPAddress = async () => {
    try {
      const response = await axios.get("https://api64.ipify.org?format=json");
      setIpAddress(response.data.ip);
    } catch (error) {
      console.error("Error al obtener la IP:", error);
    }
  };

  useEffect(() => {
    fetchIPAddress();
  }, []);

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
      if (!ipAddress) await fetchIPAddress();

      const response = await api.post("/musica/api/token/", {
        ...formData,
        ip: ipAddress
      });

      login(response.data.access);

      setSuccessMessage(`Bienvenido a djidjimusic, ${formData.username}!`);
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
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <LoginBox>
          {/* Header limpio y directo */}
          <BrandHeader>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 400,
                color: '#FFFFFF',
                letterSpacing: '1px',
                marginBottom: 1,
                fontFamily: '"Playfair Display", serif',
                fontSize: { xs: '1.75rem', sm: '2rem' },
              }}
            >
              djidjimusic
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#CBD5E1',
                fontWeight: 400,
                marginBottom: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.5,
              }}
            >
              La música de Guinea Ecuatorial
              <Box component="br" sx={{ display: { xs: 'block', sm: 'none' } }} />
              {' '}en un solo lugar
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: '#E2E8F0',
                marginTop: 3,
                marginBottom: 2,
                fontSize: '1.25rem',
              }}
            >
              Inicio de Sesión
            </Typography>
          </BrandHeader>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Input de usuario */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Nombre de Usuario"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Input de contraseña */}
              <Grid item xs={12}>
                <StyledTextField
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)} 
                          edge="end"
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.4)',
                            padding: '8px',
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Error general */}
              {errors.general && (
                <Grid item xs={12}>
                  <Alert 
                    severity="error"
                    sx={{
                      background: 'rgba(227, 10, 23, 0.1)',
                      border: '1px solid rgba(227, 10, 23, 0.3)',
                      color: '#FF6B6B',
                      borderRadius: '8px',
                      '& .MuiAlert-icon': {
                        color: '#E30A17',
                      },
                    }}
                  >
                    {errors.general}
                  </Alert>
                </Grid>
              )}

              {/* Botón de envío */}
              <Grid item xs={12}>
                <StyledButton
                  fullWidth
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                >
                  {loading ? 'Autenticando...' : 'Ingresar'}
                </StyledButton>
              </Grid>

              {/* Separador limpio */}
              <Grid item xs={12}>
                <Separator>
                  <span>¿Primera vez?</span>
                </Separator>
              </Grid>

              {/* Link de registro */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center' }}>
                  <Link 
                    href="/SingInPage"
                    sx={{
                      color: '#008751',
                      fontWeight: 500,
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        background: 'rgba(0, 135, 81, 0.1)',
                        color: '#00A86B',
                      },
                    }}
                  >
                    Crear una cuenta nueva
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </form>

          {/* Snackbar limpio */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={3500}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
              top: { xs: '16px', sm: '24px' },
            }}
          >
            <Alert 
              severity="success"
              sx={{
                background: '#008751',
                borderRadius: '8px',
                boxShadow: '0 2px 12px rgba(0, 135, 81, 0.4)',
                fontWeight: 500,
              }}
            >
              {successMessage}
            </Alert>
          </Snackbar>
        </LoginBox>
      </Container>
    </LoginContainer>
  );
};

export default Login;