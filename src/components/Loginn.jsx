import React, { useState, useContext } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  styled,
  Link,
  alpha,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon, Person, Lock, Verified } from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { keyframes } from "@emotion/react";
import { useConfig } from "./hook/useConfig";
import { AuthContext } from "./hook/UseAut";

// Animación solo para desktop
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Paleta de colores
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  secondary: '#2D3047',
  textDark: '#1A1D29',
  textLight: '#FFFFFF',
  gray100: '#F5F7FA',
  gray200: '#E4E7EB',
  gray600: '#6B7280',
  gray800: '#374151',
  error: '#EF4444',
};

// Container principal
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: colors.gray100,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

// Hero section desktop
const HeroSection = styled(Box)(({ theme }) => ({
  flex: 1,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  color: 'white',
  overflow: 'hidden',
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(0, 10),
  },
}));

// Login box - padding ultra responsive
const LoginBox = styled(Box)(({ theme }) => ({
  background: 'white',
  borderRadius: '24px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
  padding: theme.spacing(2),
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5),
    animation: `${fadeIn} 0.3s ease-out`,
  },
}));

// Inputs
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: colors.gray100,
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#F0F2F5',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: `0 0 0 2px ${colors.primary}`,
    },
  },
  // Asegurar que los placeholders sean legibles en pantallas pequeñas
  '& input': {
    fontSize: { xs: '0.9rem', sm: '1rem' },
  },
}));

// Botón con ancho mínimo fijo
const StyledButton = styled(Button)(({ theme }) => ({
  background: colors.primary,
  color: 'white',
  padding: theme.spacing(1.75),
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  minWidth: '150px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: colors.primaryDark,
    ...(theme.breakpoints.up('md') && {
      transform: 'translateY(-1px)',
      boxShadow: `0 8px 20px ${alpha(colors.primary, 0.2)}`,
    }),
  },
}));

// Badge responsive
const OfficialBadge = ({ isMobile }) => (
  <Box sx={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    px: { xs: 1, sm: 1.5 },
    py: 0.5,
    borderRadius: '20px',
    bgcolor: alpha(colors.primary, isMobile ? 0.1 : 0.15),
    color: colors.primary,
    fontSize: { xs: '0.6rem', sm: '0.7rem' },
    fontWeight: 600,
    letterSpacing: '0.3px',
    mb: 2,
    ...(!isMobile && {
      backdropFilter: 'blur(4px)',
    }),
  }}>
    <Verified sx={{ fontSize: { xs: '12px', sm: '14px' } }} />
    PLATAFORMA OFICIAL DE MÚSICA ECUATOGUINEANA
  </Box>
);

// ============================================
// HERO DESKTOP - Solo se renderiza en desktop
// ============================================
const DesktopHero = () => {
  return (
    <HeroSection>
      <Box
        component="img"
        src="/futur.jpg"
        alt="Futur - Vibra musical"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.6))',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
        <OfficialBadge isMobile={false} />
        
        <Typography
          variant="h1"
          sx={{
            fontSize: { lg: '3.5rem' },
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            mb: 2,
            color: 'white',
          }}
        >
          La nueva era del sonido en Guinea.
        </Typography>

        <Typography
          sx={{
            fontSize: '1.1rem',
            opacity: 0.8,
            mb: 3,
            color: 'white',
          }}
        >
          Descubre, publica y haz crecer tu música. 
          La plataforma que conecta el talento local con el mundo.
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          mt: 4,
          flexWrap: 'wrap',
        }}>
          {['+50K canciones', '+5K artistas', '100% local'].map((text, i) => (
            <Typography key={i} sx={{ fontSize: '0.9rem', opacity: 0.6, color: 'white' }}>
              {text}
            </Typography>
          ))}
        </Box>
      </Box>
    </HeroSection>
  );
};

// ============================================
// HERO MÓVIL
// ============================================
const MobileHero = () => (
  <Box sx={{ 
    mb: 4, 
    textAlign: 'center',
    px: 2,
  }}>
    <OfficialBadge isMobile={true} />
    <Typography 
      variant="h4" 
      sx={{ 
        fontWeight: 700, 
        color: colors.textDark, 
        mb: 1,
        fontSize: { xs: '1.5rem', sm: '2rem' },
        lineHeight: { xs: 1.3, sm: 1.2 },
        wordBreak: 'break-word',
      }}
    >
      La nueva era del sonido en Guinea.
    </Typography>
    <Typography sx={{ 
      color: colors.gray600, 
      fontSize: { xs: '0.9rem', sm: '0.95rem' },
      lineHeight: 1.4,
    }}>
      Descubre música. Publica tu talento.
    </Typography>
  </Box>
);

// ============================================
// LOGIN CONTENT
// ============================================
const LoginContent = () => {
  const { api } = useConfig();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Usuario requerido";
    if (!formData.password) newErrors.password = "Contraseña requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post("/musica/api/token/", formData);
      login(response.data.access);
      navigate("/MainPage");
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Credenciales incorrectas";
      setErrors({ general: errorMessage });
      setLoading(false);
    }
  };

  return (
    <LoginBox>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: colors.textDark,
          mb: 1,
          fontSize: { xs: '1.75rem', sm: '2rem' },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        djidjimusic
      </Typography>

      <Typography
        sx={{
          color: colors.gray600,
          fontSize: { xs: '0.85rem', sm: '0.9rem' },
          mb: { xs: 3, sm: 4 },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        Inicia sesión en tu cuenta
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              placeholder="Usuario"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: colors.gray600, fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              placeholder="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: colors.gray600, fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                      sx={{ color: colors.gray600 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {errors.general && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.9rem' }}>
                {errors.general}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12} sx={{ mt: { xs: 0.5, sm: 1 } }}>
            <StyledButton
              fullWidth
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </StyledButton>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mt: { xs: 1, sm: 2 } }}>
              <Typography sx={{ color: colors.gray600, fontSize: '0.9rem', mb: 1 }}>
                ¿No tienes cuenta?
              </Typography>
              <Link 
                component={RouterLink}
                to="/SingInPage"
                sx={{
                  color: colors.primary,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Crear cuenta gratuita
              </Link>
            </Box>
          </Grid>
        </Grid>
      </form>
    </LoginBox>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <LoginContainer>
      {/* Hero DESKTOP - NO se renderiza en móviles (desaparece del DOM) */}
      {!isMobile && <DesktopHero />}
      
      {/* Lado derecho - siempre visible */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'white',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4, md: 0 },
        minHeight: { xs: '100vh', md: 'auto' },
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Hero MÓVIL - solo se renderiza en móviles */}
          {isMobile && <MobileHero />}
          <LoginContent />
        </Box>
      </Box>
    </LoginContainer>
  );
};

export default Login;