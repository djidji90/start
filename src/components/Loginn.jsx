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

// Paleta de colores - Naranja como ADN de marca
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

// Contenedor principal con naranja ultra-sutil en el fondo
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `
    linear-gradient(
      135deg,
      ${colors.lightBg} 0%,
      ${alpha(colors.primary, 0.04)} 60%,
      ${colors.gray100} 100%
    )
  `,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-40%',
    right: '-15%',
    width: '60%',
    height: '120%',
    background: `radial-gradient(circle, ${alpha(colors.primary, 0.05)} 0%, transparent 70%)`,
    borderRadius: '50%',
    zIndex: 0,
    filter: 'blur(20px)',
  },
}));

// Header de marca con identidad naranja potenciada
const BrandHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(5),
  animation: `${fadeIn} 0.6s ease-out`,
  position: 'relative',
  zIndex: 1,
}));

// Caja de login moderna y limpia con premium touch
const LoginBox = styled(Box)(({ theme }) => ({
  background: colors.textLight,
  borderRadius: '20px',
  border: `1px solid ${alpha(colors.gray200, 0.8)}`,
  boxShadow: `
    0 15px 50px ${alpha(colors.secondary, 0.1)},
    0 2px 12px ${alpha(colors.secondary, 0.05)},
    inset 0 1px 0 ${alpha(colors.textLight, 0.9)}
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
    boxShadow: `0 4px 12px ${alpha(colors.primary, 0.4)}`,
  },
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `
      0 20px 60px ${alpha(colors.secondary, 0.15)},
      0 4px 20px ${alpha(colors.secondary, 0.08)}
    `,
  },
  '@media (max-width: 600px)': {
    margin: theme.spacing(2),
    padding: theme.spacing(4),
    maxWidth: 'calc(100% - 32px)',
  },
}));

// Inputs modernos con foco naranja potenciado
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: colors.lightBg,
    borderRadius: '12px',
    border: `1px solid ${colors.gray200}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      borderColor: colors.primaryLight,
      backgroundColor: alpha(colors.primary, 0.04),
    },
    '&.Mui-focused': {
      borderColor: colors.primary,
      backgroundColor: alpha(colors.primary, 0.04),
      boxShadow: `
        0 0 0 3px ${alpha(colors.primary, 0.15)},
        0 2px 12px ${alpha(colors.primary, 0.1)}
      `,
      transform: 'translateY(-1px)',
    },
    '& input': {
      color: colors.textDark,
      padding: '16px 14px',
      fontSize: '0.95rem',
      fontWeight: 500,
      '&::placeholder': {
        color: colors.gray600,
        opacity: 0.7,
        transition: 'opacity 0.2s ease',
      },
      '&:focus::placeholder': {
        opacity: 0.4,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.gray600,
      transform: 'translate(14px, 18px) scale(1)',
      fontSize: '0.95rem',
      fontWeight: 500,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&.Mui-focused, &.MuiFormLabel-filled': {
        color: colors.primary,
        transform: 'translate(14px, -6px) scale(0.85)',
        fontWeight: 600,
      },
    },
    '& .MuiInputAdornment-root': {
      color: colors.gray600,
      transition: 'color 0.3s ease',
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

// Botón principal premium con borde interno
const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  color: colors.textLight,
  padding: '16px 32px',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  letterSpacing: '0.3px',
  border: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `
    0 6px 25px ${alpha(colors.primary, 0.4)},
    inset 0 1px 0 ${alpha(colors.textLight, 0.3)}
  `,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
    transform: 'translateY(-3px)',
    boxShadow: `
      0 12px 35px ${alpha(colors.primary, 0.5)},
      inset 0 1px 0 ${alpha(colors.textLight, 0.4)}
    `,
  },
  '&:active': {
    transform: 'translateY(-1px)',
    boxShadow: `
      0 4px 20px ${alpha(colors.primary, 0.4)},
      inset 0 1px 0 ${alpha(colors.textLight, 0.2)}
    `,
  },
  '&:disabled': {
    background: colors.gray300,
    color: colors.gray600,
    boxShadow: 'none',
    transform: 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)',
    transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&:hover::before': {
    left: '100%',
  },
  // Borde interno premium (como Spotify/Apple Music)
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '1px',
    borderRadius: '11px',
    border: `1px solid ${alpha(colors.textLight, 0.3)}`,
    pointerEvents: 'none',
  },
  '@media (max-width: 600px)': {
    padding: '15px 28px',
    fontSize: '0.95rem',
  },
}));

// Separador elegante con toque naranja
const Separator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: '32px 0',
  color: colors.gray600,
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: '1px',
    background: `linear-gradient(90deg, ${colors.gray200}, ${alpha(colors.primary, 0.3)}, ${colors.gray200})`,
  },
  '& span': {
    padding: '0 16px',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: colors.gray800,
    background: colors.textLight,
    position: 'relative',
    zIndex: 1,
  },
}));

// Icono musical con efecto especial
const MusicIcon = styled(MusicNote)(({ theme }) => ({
  position: 'absolute',
  top: '-28px',
  right: '32px',
  fontSize: '52px',
  color: alpha(colors.primary, 0.12),
  transform: 'rotate(15deg)',
  filter: `drop-shadow(0 4px 8px ${alpha(colors.primary, 0.2)})`,
  animation: `${fadeIn} 0.8s ease-out 0.4s both`,
  '@media (max-width: 600px)': {
    top: '-20px',
    right: '20px',
    fontSize: '40px',
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

      setSuccessMessage(`¡Bienvenido a djidjimusic, ${formData.username}! 🎵`);
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
          {/* Icono musical decorativo */}
          <MusicIcon />

          {/* Header con naranja como ADN */}
          <BrandHeader>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.5px',
                marginBottom: 3,
                fontSize: { xs: '2.2rem', sm: '2.8rem' },
                lineHeight: 1.1,
                textShadow: `0 2px 10px ${alpha(colors.primary, 0.15)}`,
              }}
            >
              djidjimusic
            </Typography>
            
            {/* Separador visual con naranja protagonista */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1.5,
              marginBottom: 4,
            }}>
              <Box sx={{ 
                width: '70px', 
                height: '5px', 
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
                borderRadius: '3px',
                boxShadow: `0 2px 8px ${alpha(colors.primary, 0.4)}`,
              }} />
              <MusicNote sx={{ 
                color: colors.primary,
                fontSize: '26px',
                filter: `drop-shadow(0 2px 6px ${alpha(colors.primary, 0.4)})`
              }} />
              <Box sx={{ 
                width: '70px', 
                height: '5px', 
                background: `linear-gradient(90deg, ${colors.primaryLight}, ${colors.primary})`,
                borderRadius: '3px',
                boxShadow: `0 2px 8px ${alpha(colors.primary, 0.4)}`,
              }} />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.textDark,
                marginBottom: 1.5,
                fontSize: { xs: '1.35rem', sm: '1.6rem' },
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '3px',
                  background: alpha(colors.primary, 0.3),
                  borderRadius: '2px',
                }
              }}
            >
              Inicio de Sesión
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.gray800,
                fontSize: '1.05rem',
                lineHeight: 1.7,
                maxWidth: '400px',
                margin: '0 auto',
                marginTop: 3,
                fontWeight: 400,
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
                          fontSize: '1.2rem',
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
                          fontSize: '1.2rem',
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
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: colors.primary,
                              backgroundColor: alpha(colors.primary, 0.12),
                              transform: 'scale(1.1)',
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
                      background: alpha(colors.error, 0.08),
                      border: `1px solid ${alpha(colors.error, 0.3)}`,
                      color: colors.error,
                      borderRadius: '12px',
                      fontWeight: 600,
                      padding: '12px 16px',
                      '& .MuiAlert-icon': {
                        color: colors.error,
                        fontSize: '1.2rem',
                      },
                    }}
                  >
                    {errors.general}
                  </Alert>
                </Grid>
              )}

              {/* Botón de envío premium */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <StyledButton
                  fullWidth
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? 
                    <CircularProgress size={22} color="inherit" sx={{ opacity: 0.9 }} /> : 
                    <LoginIcon sx={{ fontSize: '1.2rem' }} />
                  }
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

              {/* Link de registro premium */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.gray800,
                      marginBottom: 2.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    Únete a nuestra comunidad musical
                  </Typography>
                  <Link 
                    href="/SingInPage"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1.5,
                      color: colors.primary,
                      fontWeight: 700,
                      textDecoration: 'none',
                      fontSize: '1.05rem',
                      padding: '14px 28px',
                      borderRadius: '12px',
                      border: `2px solid ${alpha(colors.primary, 0.3)}`,
                      background: alpha(colors.primary, 0.05),
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: alpha(colors.primary, 0.12),
                        borderColor: colors.primary,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 20px ${alpha(colors.primary, 0.25)}`,
                        color: colors.primaryDark,
                      },
                    }}
                  >
                    <MusicNote sx={{ fontSize: '1.2rem' }} />
                    Crear cuenta gratuita
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </form>

          {/* Snackbar de éxito premium */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={4500}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
              top: { xs: '24px', sm: '32px' },
            }}
          >
            <Alert 
              severity="success"
              sx={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                borderRadius: '14px',
                boxShadow: `
                  0 12px 35px ${alpha(colors.primary, 0.5)},
                  0 0 0 1px ${alpha(colors.textLight, 0.2)},
                  inset 0 1px 0 ${alpha(colors.textLight, 0.4)}
                `,
                fontWeight: 700,
                color: colors.textLight,
                padding: '14px 20px',
                fontSize: '1rem',
                '& .MuiAlert-icon': {
                  color: colors.textLight,
                  fontSize: '1.4rem',
                  marginRight: '12px',
                },
                '& .MuiAlert-message': {
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 0',
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