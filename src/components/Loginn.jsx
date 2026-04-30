// Login.jsx

import React, { useState, useContext, useRef } from "react";
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
  useTheme,
  Collapse,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person,
  Lock,
  Verified,
  WarningAmber,
  CheckCircle,
  WifiOff,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { keyframes } from "@emotion/react";
import { AuthContext } from "./hook/UseAut";

// ============================================
// ANIMACIONES
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`;

// ============================================
// COLORES
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  gray100: '#F5F7FA',
  gray600: '#6B7280',
  textDark: '#1A1D29',
};

// ============================================
// STYLED COMPONENTS
// ============================================
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: colors.gray100,
}));

const LoginBox = styled(Box)(({ theme }) => ({
  background: 'white',
  borderRadius: '24px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '420px',
  animation: `${fadeIn} 0.3s ease-out`,
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: colors.gray100,
    '&.Mui-focused': {
      backgroundColor: 'white',
    },
    '&.Mui-error': {
      animation: `${shake} 0.3s ease-in-out`,
    },
  },
});

const StyledButton = styled(Button)({
  background: colors.primary,
  color: 'white',
  padding: '14px',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    background: colors.primaryDark,
  },
});

// ============================================
// LOGIN COMPONENT
// ============================================
const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(null);

  const abortRef = useRef(null);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setGeneralError(null);
  };

  const validate = () => {
    const err = {};
    if (!formData.username) err.username = "Usuario requerido";
    if (!formData.password) err.password = "Contraseña requerida";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ============================================
  // LOGIN SUBMIT (CORREGIDO)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setGeneralError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(
        "https://api.djidjimusic.com/musica/api/token/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          signal: controller.signal,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error de login");
      }

      // ============================================
      // 🔥 FIX CRÍTICO: ACCESS + REFRESH
      // ============================================
      login(data.access, data.refresh);

      setSuccess("Login correcto");

      setTimeout(() => {
        navigate("/MainPage");
      }, 600);

    } catch (err) {
      if (err.name !== "AbortError") {
        setGeneralError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UI
  // ============================================
  return (
    <LoginContainer>
      <LoginBox>

        <Typography variant="h5" fontWeight={700} mb={1}>
          Iniciar sesión
        </Typography>

        <Typography fontSize={14} color={colors.gray600} mb={3}>
          Accede a tu cuenta musical
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <StyledButton
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Entrar"
                )}
              </StyledButton>
            </Grid>

          </Grid>
        </form>

        <Box mt={2} textAlign="center">
          <Link component={RouterLink} to="/SingInPage">
            Crear cuenta
          </Link>
        </Box>

      </LoginBox>
    </LoginContainer>
  );
};

export default Login;