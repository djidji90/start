import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
  FormControlLabel,
  Checkbox,
  MenuItem,
  InputAdornment,
  Link,
  Container,
  alpha,
  IconButton,
  styled
} from "@mui/material";
import { 
  CheckCircle, 
  Security, 
  Gavel, 
  PrivacyTip, 
  Warning,
  Person,
  Email,
  Phone,
  Cake,
  LocationCity,
  Flag,
  Wc,
  ArrowBack,
  MusicNote,
  RocketLaunch
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useConfig } from "./hook/useConfig"; 
import { keyframes } from "@emotion/react";
import PasswordInput from "./PasswordInput";

// Animaciones (importadas del Login)
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

const flotar = keyframes`
  0%, 100% { transform: rotate(-5deg) translateY(0); }
  50% { transform: rotate(-8deg) translateY(-4px); }
`;

const vibrar = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
`;

// Paleta de colores - IDÉNTICA al Login
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

// Contenedor principal - IDÉNTICO al Login
const RegisterContainer = styled(Box)(({ theme }) => ({
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
  padding: theme.spacing(4, 2),
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

// Caja de registro - IDÉNTICA al LoginBox
const RegisterBox = styled(Box)(({ theme }) => ({
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
  maxWidth: '800px',
  animation: `${fadeIn} 0.6s ease-out`,
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
  },
}));

// Header de marca - IDÉNTICO al Login
const BrandHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(5),
  animation: `${fadeIn} 0.6s ease-out`,
  position: 'relative',
  zIndex: 1,
}));

// 🚀 Logo cohete - IDÉNTICO al Login
const CoheteDespegue = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-28px',
  right: '32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  animation: `${fadeIn} 0.8s ease-out 0.4s both, ${vibrar} 3s ease-in-out infinite`,
  zIndex: 10,
  '& .cohete': {
    fontSize: '48px',
    transform: 'rotate(-5deg)',
    filter: `drop-shadow(0 6px 12px ${alpha(colors.primary, 0.25)})`,
    animation: `${flotar} 2s ease-in-out infinite`,
  },
  '& .estela': {
    display: 'flex',
    gap: '2px',
    marginTop: '-8px',
    '& span': {
      fontSize: '16px',
      color: alpha(colors.primary, 0.3),
      animation: `caida 1.5s ease-in-out infinite`,
      '&:nth-of-type(1)': { animationDelay: '0s' },
      '&:nth-of-type(2)': { animationDelay: '0.2s' },
      '&:nth-of-type(3)': { animationDelay: '0.4s' },
    }
  },
  '@media (max-width: 600px)': {
    top: '-20px',
    right: '20px',
    '& .cohete': { fontSize: '36px' },
    '& .estela span': { fontSize: '12px' },
  },
}));

// Inputs modernos - IDÉNTICOS al Login
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
    '& input, & textarea': {
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
    '& .MuiInputAdornment-root': {
      color: colors.gray600,
      transition: 'color 0.3s ease',
      '&.Mui-focused': {
        color: colors.primary,
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: colors.gray600,
    transform: 'translate(14px, 16px) scale(1)',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&.Mui-focused, &.MuiFormLabel-filled': {
      color: colors.primary,
      transform: 'translate(14px, -8px) scale(0.85)',
      fontWeight: 600,
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: '6px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
}));

// Botón principal premium - IDÉNTICO al Login
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
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '1px',
    borderRadius: '11px',
    border: `1px solid ${alpha(colors.textLight, 0.3)}`,
    pointerEvents: 'none',
  },
}));

// Separador elegante - IDÉNTICO al Login
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

const genderOptions = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
];

// Componente de Términos y Condiciones REDISEÑADO
const TermsAndConditions = ({ open, onClose, onAccept }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '80vh',
          borderRadius: '20px',
          boxShadow: `0 25px 70px ${alpha(colors.secondary, 0.2)}`,
          border: `1px solid ${alpha(colors.gray200, 0.8)}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 2.5,
        px: 3,
        fontWeight: 700,
        fontSize: '1.3rem',
        letterSpacing: '0.3px',
        boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
      }}>
        <Gavel sx={{ fontSize: '1.6rem' }} />
        Términos y Condiciones - djidjimusic
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: colors.textDark,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🎵 Bienvenido a bordo
          </Typography>
          <Typography variant="body2" sx={{ color: colors.gray600 }}>
            Última actualización: {new Date().toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </Typography>
        </Box>

        {[
          {
            icon: <CheckCircle sx={{ fontSize: 20 }} />,
            title: "1. Aceptación de Términos",
            content: "Al registrarte en djidjimusic, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguno de estos términos, no podrás utilizar nuestros servicios."
          },
          {
            icon: <Security sx={{ fontSize: 20 }} />,
            title: "2. Uso del Servicio",
            content: [
              "• Debes ser mayor de 13 años para utilizar el servicio (o contar con autorización parental)",
              "• El contenido es para uso personal, no para redistribución comercial",
              "• No puedes vulnerar derechos de autor, realizar ingeniería inversa, o sobrecargar los servidores"
            ]
          },
          {
            icon: <Gavel sx={{ fontSize: 20 }} />,
            title: "3. Contenido y Derechos de Autor",
            content: "djidjimusic respeta los derechos de propiedad intelectual. Los usuarios son responsables del contenido que suben y deben contar con los derechos necesarios para compartirlo. Al subir contenido, otorgas a djidjimusic una licencia no exclusiva para almacenar, reproducir y distribuir dicho contenido dentro de la plataforma."
          },
          {
            icon: <PrivacyTip sx={{ fontSize: 20 }} />,
            title: "4. Privacidad y Datos",
            content: "Tu privacidad es importante. Recopilamos y utilizamos tu información personal según lo establecido en nuestra Política de Privacidad. Podemos recopilar: información de registro, datos de uso, preferencias musicales, y datos técnicos necesarios para el funcionamiento del servicio."
          },
          {
            icon: <Warning sx={{ fontSize: 20, color: '#FFB347' }} />,
            title: "5. Limitaciones de Responsabilidad",
            content: "djidjimusic no se hace responsable por interrupciones del servicio por mantenimiento o causas externas, contenido subido por usuarios que infrinja derechos de autor, o uso indebido de la plataforma por parte de usuarios."
          }
        ].map((section, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: colors.textDark,
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              <Box sx={{ color: colors.primary }}>{section.icon}</Box>
              {section.title}
            </Typography>
            {Array.isArray(section.content) ? (
              section.content.map((line, i) => (
                <Typography key={i} variant="body2" sx={{ color: colors.gray800, mb: 0.5 }}>
                  {line}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: colors.gray800 }}>
                {section.content}
              </Typography>
            )}
          </Box>
        ))}

        <Box sx={{ 
          mt: 4, 
          p: 3, 
          bgcolor: alpha(colors.primary, 0.04),
          borderRadius: '12px',
          border: `1px solid ${alpha(colors.primary, 0.15)}`,
        }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📧 Contacto
          </Typography>
          <Typography variant="body2" sx={{ color: colors.gray800 }}>
            Para preguntas sobre estos términos:{' '}
            <strong style={{ color: colors.primary }}>machimboleoncio@gmail.com</strong>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1.5, borderTop: `1px solid ${colors.gray200}` }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            color: colors.gray600,
            borderColor: colors.gray300,
            borderRadius: '10px',
            py: 1.5,
            px: 3,
            fontWeight: 600,
            '&:hover': {
              borderColor: colors.primary,
              color: colors.primary,
              background: alpha(colors.primary, 0.04),
            }
          }}
        >
          Cerrar
        </Button>
        <Button 
          onClick={onAccept}
          variant="contained"
          startIcon={<CheckCircle />}
          sx={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            borderRadius: '10px',
            py: 1.5,
            px: 4,
            fontWeight: 700,
            boxShadow: `0 6px 20px ${alpha(colors.primary, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: `0 10px 30px ${alpha(colors.primary, 0.5)}`,
            }
          }}
        >
          Aceptar Términos
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente de diálogo de éxito REDISEÑADO
const SuccessDialog = ({ open, message, onClose, onNavigate }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    sx={{
      '& .MuiDialog-paper': {
        borderRadius: '20px',
        padding: 2,
        boxShadow: `0 25px 70px ${alpha(colors.secondary, 0.2)}`,
      }
    }}
  >
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ 
        fontSize: '80px', 
        animation: `${flotar} 2s ease-in-out infinite`,
        mb: 2
      }}>
        🚀🎵
      </Box>
      <DialogTitle sx={{ 
        fontWeight: 800, 
        fontSize: '1.8rem',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        pb: 1
      }}>
        ¡Despegue exitoso!
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', px: 4 }}>
        <Typography variant="h6" sx={{ color: colors.gray800, mb: 2, fontWeight: 600 }}>
          {message}
        </Typography>
        <Typography variant="body1" sx={{ color: colors.gray600, mb: 3 }}>
          Tu cuenta ha sido creada. Prepárate para explorar la música de Guinea Ecuatorial.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          onClick={onNavigate}
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            borderRadius: '12px',
            py: 1.5,
            px: 5,
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: `0 6px 20px ${alpha(colors.primary, 0.4)}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 10px 30px ${alpha(colors.primary, 0.5)}`,
            }
          }}
        >
          Iniciar sesión
        </Button>
      </DialogActions>
    </Box>
  </Dialog>
);

// Componente Principal Register REDISEÑADO
const Register = () => {
  const navigate = useNavigate();
  const { api } = useConfig();
  const usernameRef = useRef(null);

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
    gender: "",
    birth_date: "",
    country: "",
    terms_accepted: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const validateField = useCallback((name, value) => {
    const validations = {
      username: {
        required: true,
        maxLength: 150,
        validate: (val) => /^[\w.@+-]+$/.test(val),
        message: "Solo letras, dígitos y @/./+/-/_"
      },
      email: {
        required: true,
        maxLength: 254,
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        message: "Correo electrónico inválido"
      },
      password: {
        required: true,
        minLength: 8,
        validate: (val) => val.length >= 8,
        message: "Mínimo 8 caracteres"
      },
      password2: {
        required: true,
        validate: (val, form) => val === form.password,
        message: "Las contraseñas no coinciden"
      },
      phone: {
        validate: (val) => !val || /^\+?\d{10,15}$/.test(val),
        message: "Formato: +5491123456789"
      },
      birth_date: {
        validate: (val) => !val || !isNaN(new Date(val).getTime()),
        message: "Fecha inválida"
      },
      terms_accepted: {
        required: true,
        validate: (val) => val === true,
        message: "Debes aceptar los términos"
      }
    };

    const rules = validations[name];
    if (!rules) return null;

    if (rules.required && !value && value !== false) {
      return "Este campo es requerido";
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`;
    }

    if (rules.validate && !rules.validate(value, formData)) {
      return rules.message || "Valor no válido";
    }

    return null;
  }, [formData]);

  const validateAllFields = useCallback(() => {
    const requiredFields = ['username', 'email', 'password', 'password2', 'terms_accepted'];
    const newErrors = {};
    const newTouched = {};

    requiredFields.forEach(key => {
      newTouched[key] = true;
      newErrors[key] = validateField(key, formData[key]);
    });

    setTouched(newTouched);
    setErrors(newErrors);

    return Object.values(newErrors).every(error => error === null);
  }, [formData, validateField]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if (name === 'phone') {
      finalValue = finalValue.replace(/[^\d+]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, finalValue) }));
    }
  }, [touched, validateField, errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  }, [formData, validateField]);

  const handleOpenTerms = useCallback((e) => {
    e.preventDefault();
    setTermsModalOpen(true);
  }, []);

  const handleCloseTerms = useCallback(() => {
    setTermsModalOpen(false);
  }, []);

  const handleAcceptTerms = useCallback(() => {
    setHasReadTerms(true);
    setFormData(prev => ({ ...prev, terms_accepted: true }));
    setTermsModalOpen(false);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      setErrors(prev => ({
        ...prev,
        general: "Por favor corrige los errores en el formulario"
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      api.baseURL = "https://djibackend-production.up.railway.app";
      const response = await axios.post(`${api.baseURL}/musica/register/`, formData);

      setSuccessMessage(`¡Bienvenido a bordo, ${formData.username || 'artista'}! 🚀`);
      setOpenSuccessDialog(true);
      setErrors({});

      setFormData({
        username: "",
        email: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        city: "",
        neighborhood: "",
        phone: "",
        gender: "",
        birth_date: "",
        country: "",
        terms_accepted: false,
      });

      setTimeout(() => {
        setOpenSuccessDialog(false);
        navigate("/");
      }, 5000);
    } catch (error) {
      const errorData = error.response?.data || {};

      if (errorData.errors) {
        const newErrors = {};
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          newErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(newErrors);
      } else {
        setErrors({
          general: errorData.message || "Error en el servidor. Intente nuevamente."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [api.baseURL, formData, navigate, validateAllFields]);

  const isFormValid = useMemo(() => {
    const requiredFields = ['username', 'email', 'password', 'password2', 'terms_accepted'];
    return requiredFields.every(field => !validateField(field, formData[field]));
  }, [formData, validateField]);

  return (
    <RegisterContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <RegisterBox>
          {/* 🚀 Logo cohete - IDÉNTICO al Login */}
          <CoheteDespegue>
            <Box className="cohete" component="span">
              🚀
            </Box>
            <Box className="estela">
              <span>♪</span>
              <span>♫</span>
              <span>♪</span>
            </Box>
          </CoheteDespegue>

          {/* Botón volver al login */}
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              position: 'absolute',
              top: '20px',
              left: '32px',
              color: colors.gray600,
              backgroundColor: alpha(colors.gray200, 0.5),
              backdropFilter: 'blur(10px)',
              padding: '10px',
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.12),
                color: colors.primary,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
              zIndex: 20,
            }}
          >
            <ArrowBack sx={{ fontSize: '1.2rem' }} />
          </IconButton>

          {/* Header - IDÉNTICO al Login */}
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
              Registro de usuario
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.gray800,
                fontSize: '1.05rem',
                lineHeight: 1.7,
                maxWidth: '500px',
                margin: '0 auto',
                marginTop: 3,
                fontWeight: 400,
              }}
            >
              Únete y descubre nuevas sensaciones
            </Typography>
          </BrandHeader>

          {/* Error general */}
          {errors.general && (
            <Alert 
              severity="error"
              sx={{
                mb: 3,
                background: alpha(colors.error, 0.08),
                border: `1px solid ${alpha(colors.error, 0.3)}`,
                color: colors.error,
                borderRadius: '12px',
                fontWeight: 600,
                '& .MuiAlert-icon': {
                  color: colors.error,
                },
              }}
            >
              {errors.general}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Usuario */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  inputRef={usernameRef}
                  label={
                    <>
                      Nombre de Usuario
                      <span style={{ color: colors.error }}>*</span>
                    </>
                  }
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.username && (touched.username || !!errors.username)}
                  helperText={(touched.username || !!errors.username) && errors.username}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ 
                          color: errors.username ? colors.error : colors.gray600,
                          fontSize: '1.2rem',
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" sx={{ color: colors.gray600, fontWeight: 500 }}>
                          {formData.username.length}/150
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label={
                    <>
                      Correo Electrónico
                      <span style={{ color: colors.error }}>*</span>
                    </>
                  }
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.email && (touched.email || !!errors.email)}
                  helperText={(touched.email || !!errors.email) && errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ 
                          color: errors.email ? colors.error : colors.gray600,
                          fontSize: '1.2rem',
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" sx={{ color: colors.gray600, fontWeight: 500 }}>
                          {formData.email.length}/254
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Nombre y Apellido */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Nombre"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  placeholder="Opcional"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Apellido"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  placeholder="Opcional"
                />
              </Grid>

              {/* Teléfono */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+5491123456789"
                  error={!!errors.phone}
                  helperText={errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ 
                          color: errors.phone ? colors.error : colors.gray600,
                          fontSize: '1.2rem',
                        }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Género */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  select
                  fullWidth
                  label="Género"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Wc sx={{ color: colors.gray600, fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Seleccionar (opcional)</MenuItem>
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </StyledTextField>
              </Grid>

              {/* Fecha de nacimiento */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Cake sx={{ color: colors.gray600, fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Ciudad */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Ciudad"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Opcional"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity sx={{ color: colors.gray600, fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Barrio */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Barrio"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Opcional"
                />
              </Grid>

              {/* País */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="País"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Opcional"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Flag sx={{ color: colors.gray600, fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Contraseñas */}
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label={
                    <>
                      Contraseña
                      <span style={{ color: colors.error }}>*</span>
                    </>
                  }
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.password && (touched.password || !!errors.password)}
                  helperText={
                    (touched.password || !!errors.password) 
                      ? (errors.password || "Mínimo 8 caracteres")
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Security sx={{ 
                          color: errors.password ? colors.error : colors.gray600,
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
                            '&:hover': { color: colors.primary }
                          }}
                        >
                          {showPassword ? <Security /> : <Security />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label={
                    <>
                      Confirmar Contraseña
                      <span style={{ color: colors.error }}>*</span>
                    </>
                  }
                  name="password2"
                  type={showPassword2 ? 'text' : 'password'}
                  value={formData.password2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.password2 && (touched.password2 || !!errors.password2)}
                  helperText={(touched.password2 || !!errors.password2) && errors.password2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Security sx={{ 
                          color: errors.password2 ? colors.error : colors.gray600,
                          fontSize: '1.2rem',
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowPassword2(!showPassword2)} 
                          edge="end"
                          sx={{ 
                            color: colors.gray600,
                            '&:hover': { color: colors.primary }
                          }}
                        >
                          {showPassword2 ? <Security /> : <Security />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Términos y condiciones - REDISEÑADO */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2.5, 
                  bgcolor: alpha(colors.primary, 0.04),
                  borderRadius: '12px',
                  border: `1px solid ${alpha(colors.primary, 0.15)}`,
                  mt: 1
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.terms_accepted}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="terms_accepted"
                        sx={{
                          color: colors.gray600,
                          '&.Mui-checked': {
                            color: colors.primary,
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ color: colors.gray800, fontWeight: 500 }}>
                          He leído y acepto los{' '}
                          <Link 
                            component="button" 
                            type="button"
                            onClick={handleOpenTerms}
                            sx={{ 
                              color: colors.primary,
                              fontWeight: 700,
                              textDecoration: 'underline',
                              '&:hover': { color: colors.primaryDark }
                            }}
                          >
                            términos y condiciones
                          </Link>
                          <span style={{ color: colors.error }}>*</span>
                        </Typography>
                        {hasReadTerms && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mt: 1,
                            color: colors.success,
                            backgroundColor: alpha(colors.success, 0.1),
                            padding: '8px 12px',
                            borderRadius: '8px',
                          }}>
                            <CheckCircle sx={{ fontSize: '1.1rem' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Has aceptado los términos y condiciones
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  {errors.terms_accepted && touched.terms_accepted && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: colors.error, 
                        display: 'block', 
                        mt: 1,
                        ml: 4,
                        fontWeight: 600
                      }}
                    >
                      {errors.terms_accepted}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Botón de registro */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <StyledButton
                  fullWidth
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  startIcon={isSubmitting ? 
                    <CircularProgress size={22} color="inherit" sx={{ opacity: 0.9 }} /> : 
                    <RocketLaunch sx={{ fontSize: '1.2rem' }} />
                  }
                >
                  {isSubmitting ? 'Preparando despegue...' : '¡Despegar!'}
                </StyledButton>
              </Grid>

              {/* Separador */}
              <Grid item xs={12}>
                <Separator>
                  <span>¿Ya tienes cuenta?</span>
                </Separator>
              </Grid>

              {/* Link a login */}
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
                    Vuelve a la nave principal
                  </Typography>
                  <Link 
                    component="button"
                    type="button"
                    onClick={() => navigate("/")}
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
                    <ArrowBack sx={{ fontSize: '1.2rem' }} />
                    Iniciar sesión
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </form>
        </RegisterBox>
      </Container>

      {/* Diálogo de éxito */}
      <SuccessDialog
        open={openSuccessDialog}
        message={successMessage}
        onClose={() => setOpenSuccessDialog(false)}
        onNavigate={() => navigate("/")}
      />

      {/* Diálogo de carga */}
      <Dialog 
        open={isSubmitting} 
        disablePortal
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '20px',
            background: colors.textLight,
            boxShadow: `0 25px 70px ${alpha(colors.secondary, 0.2)}`,
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', p: 5 }}>
          <Box sx={{ fontSize: '60px', animation: `${flotar} 2s ease-in-out infinite`, mb: 2 }}>
            🚀
          </Box>
          <CircularProgress 
            sx={{ 
              color: colors.primary,
              mb: 2
            }} 
          />
          <Typography variant="h6" sx={{ color: colors.textDark, fontWeight: 700, mb: 1 }}>
            Preparando tu nave...
          </Typography>
          <Typography variant="body2" sx={{ color: colors.gray600 }}>
            Estamos configurando tu cuenta musical
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Modal de Términos */}
      <TermsAndConditions
        open={termsModalOpen}
        onClose={handleCloseTerms}
        onAccept={handleAcceptTerms}
      />
    </RegisterContainer>
  );
};

Register.propTypes = {
  navigate: PropTypes.func,
};

export default React.memo(Register);