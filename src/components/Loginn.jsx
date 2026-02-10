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
  Container,
  alpha
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon, Person, Lock, MusicNote } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { keyframes } from "@emotion/react";
import { useConfig } from "./hook/useConfig";
import { AuthContext } from "./hook/UseAut";

// Animación sutil
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

// Paleta de colores - Naranja como protagonista
const colors = {
  primary: '#FF6B35',     // Naranja principal vibrante
  primaryLight: '#FF8B5C', // Naranja claro
  primaryDark: '#E55A2B',  // Naranja oscuro
  secondary: '#2D3047',   // Azul oscuro elegante
  lightBg: '#F8F9FA',     // Fondo claro
  darkBg: '#1A1D29',      // Fondo oscuro
  textDark: '#2D3047',    // Texto oscuro
  textLight: '#FFFFFF',   // Texto claro
  gray100: '#F5F7FA',
  gray200: '#E4E7EB',
  gray300: '#CBD2D9',
  gray600: '#7B8794',
  gray800: '#3E4C59',
  success: '#0CAF60',
  error: '#FF4757',
};

// Contenedor principal con gradiente sutil
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${colors.lightBg} 0%, ${colors.gray100} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '70%',
    height: '140%',
    background: `radial-gradient(circle, ${alpha(colors.primary, 0.03)} 0%, transparent 70%)`,
    borderRadius: '50%',
    zIndex: 0,
  },
}));

// Header de marca con identidad naranja
const BrandHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(5),
  animation: `${fadeIn} 0.6s ease-out`,
  position: 'relative',
  zIndex: 1,
}));

// Caja de login moderna y limpia
const LoginBox = styled(Box)(({ theme }) => ({
  background: colors.textLight,
  borderRadius: '20px',
  border: `1px solid ${colors.gray200}`,
  boxShadow: `
    0 10px 40px ${alpha(colors.secondary, 0.08)},
    0 2px 10px ${alpha(colors.secondary, 0.03)}
  `,
  padding: theme.spacing(5),
  width: '100%',
  maxWidth: '480px',
  animation: `${fadeIn} 0.6s ease-out 0.2s both`,
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    borderRadius: '20px 20px 0 0',
    boxShadow: `0 2px 8px ${alpha(colors.primary, 0.3)}`,
  },
  // Efecto hover sutil
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `
      0 15px 50px ${alpha(colors.secondary, 0.12)},
      0 3px 15px ${alpha(colors.secondary, 0.05)}
    `,
  },
  // Mobile optimization
  '@media (max-width: 600px)': {
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    maxWidth: 'calc(100% - 32px)',
  },
}));

// Inputs modernos con acentos naranja
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: colors.lightBg,
    borderRadius: '12px',
    border: `1px solid ${colors.gray200}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: colors.primaryLight,
      backgroundColor: alpha(colors.primary, 0.02),
    },
    '&.Mui-focused': {
      borderColor: colors.primary,
      backgroundColor: colors.textLight,
      boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
    },
    '& input': {
      color: colors.textDark,
      padding: '16px 14px',
      fontSize: '0.95rem',
      fontWeight: 500,
      '&::placeholder': {
        color: colors.gray600,
        opacity: 0.7,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.gray600,
      transform: 'translate(14px, 18px) scale(1)',
      fontSize: '0.95rem',
      fontWeight: 500,
      '&.Mui-focused, &.MuiFormLabel-filled': {
        color: colors.primary,
        transform: 'translate(14px, -6px) scale(0.85)',
        fontWeight: 600,
      },
    },
    '& .MuiInputAdornment-root': {
      color: colors.gray600,
      '&.Mui-focused': {
        color: colors.primary,
      },
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: '6px',
    fontSize: '0.8rem',
  },
}));

// Botón principal con naranja vibrante
const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  color: colors.textLight,
  padding: '16px 32px',
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  letterSpacing: '0.3px',
  border: 'none',
  transition: 'all 0.3s ease',
  boxShadow: `0 4px 20px ${alpha(colors.primary, 0.3)}`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 30px ${alpha(colors.primary, 0.4)}`,
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    background: colors.gray300,
    color: colors.gray600,
    boxShadow: 'none',
  },
  // Efecto de brillo al pasar el mouse
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover::before': {
    left: '100%',
  },
  // Mobile optimization
  '@media (max-width: 600px)': {
    padding: '14px 28px',
  },
}));

// Separador elegante
const Separator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: '32px 0',
  color: colors.gray600,
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: '1px',
    background: colors.gray200,
  },
  '& span': {
    padding: '0 16px',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: colors.gray800,
  },
}));

// Icono decorativo musical
const MusicIcon = styled(MusicNote)(({ theme }) => ({
  position: 'absolute',
  top: '-24px',
  right: '32px',
  fontSize: '48px',
  color: alpha(colors.primary, 0.1),
  transform: 'rotate(15deg)',
  animation: `${fadeIn} 0.8s ease-out 0.4s both`,
  '@media (max-width: 600px)': {
    display: 'none',
  },
}));

const Login = () => {
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

      setSuccessMessage(`¡Bienvenido a djidjimusic, ${formData.username}!`);
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
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <LoginBox>
          {/* Icono decorativo musical */}
          <MusicIcon />

          {/* Header con identidad naranja */}
          <BrandHeader>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.5px',
                marginBottom: 2,
                fontSize: { xs: '2rem', sm: '2.5rem' },
                lineHeight: 1.2,
              }}
            >
              djidjimusic
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1,
              marginBottom: 3,
            }}>
              <Box sx={{ 
                width: '60px', 
                height: '4px', 
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
                borderRadius: '2px',
              }} />
              <MusicNote sx={{ color: colors.primary, fontSize: '24px' }} />
              <Box sx={{ 
                width: '60px', 
                height: '4px', 
                background: `linear-gradient(90deg, ${colors.primaryLight}, ${colors.primary})`,
                borderRadius: '2px',
              }} />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: colors.textDark,
                marginBottom: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Inicio de Sesión
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.gray800,
                fontSize: '1rem',
                lineHeight: 1.6,
                maxWidth: '400px',
                margin: '0 auto',
              }}
            >
              Accede a tu cuenta para explorar la música de Guinea Ecuatorial
            </Typography>
          </BrandHeader>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
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
                        <Person sx={{ 
                          color: errors.username ? colors.error : colors.gray600,
                          transition: 'color 0.3s ease',
                        }} />
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
                        <Lock sx={{ 
                          color: errors.password ? colors.error : colors.gray600,
                          transition: 'color 0.3s ease',
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)} 
                          edge="end"
                          sx={{ 
                            color: colors.gray600,
                            padding: '8px',
                            '&:hover': {
                              color: colors.primary,
                              backgroundColor: alpha(colors.primary, 0.1),
                            },
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
                      background: alpha(colors.error, 0.1),
                      border: `1px solid ${alpha(colors.error, 0.3)}`,
                      color: colors.error,
                      borderRadius: '12px',
                      fontWeight: 500,
                      '& .MuiAlert-icon': {
                        color: colors.error,
                      },
                    }}
                  >
                    {errors.general}
                  </Alert>
                </Grid>
              )}

              {/* Botón de envío */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <StyledButton
                  fullWidth
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                >
                  {loading ? 'Autenticando...' : 'Ingresar a la plataforma'}
                </StyledButton>
              </Grid>

              {/* Separador elegante */}
              <Grid item xs={12}>
                <Separator>
                  <span>¿Nuevo en djidjimusic?</span>
                </Separator>
              </Grid>

              {/* Link de registro */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.gray800,
                      marginBottom: 2,
                      fontSize: '0.95rem',
                    }}
                  >
                    Únete a nuestra comunidad musical
                  </Typography>
                  <Link 
                    href="/SingInPage"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      color: colors.primary,
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontSize: '1rem',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: `2px solid ${alpha(colors.primary, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: alpha(colors.primary, 0.1),
                        borderColor: colors.primary,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 15px ${alpha(colors.primary, 0.2)}`,
                      },
                    }}
                  >
                    <MusicNote fontSize="small" />
                    Crear cuenta gratuita
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </form>

          {/* Snackbar de éxito con naranja */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={4000}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
              top: { xs: '20px', sm: '30px' },
            }}
          >
            <Alert 
              severity="success"
              sx={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                borderRadius: '12px',
                boxShadow: `0 8px 25px ${alpha(colors.primary, 0.4)}`,
                fontWeight: 600,
                color: colors.textLight,
                '& .MuiAlert-icon': {
                  color: colors.textLight,
                },
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