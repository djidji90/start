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
useTheme,
styled,
Link,
alpha
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon, Person, Lock, MusicNote, Verified } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";
import { useConfig } from "./hook/useConfig";
import { AuthContext } from "./hook/UseAut";

// Animación única y sutil
const fadeIn = keyframes  from { opacity: 0; transform: translateY(10px); }   to { opacity: 1; transform: translateY(0); }  ;

// Paleta de colores - premium
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
const LoginContainer = styled(Box)({
minHeight: '100vh',
display: 'flex',
background: colors.gray100,
});

// Hero izquierdo
const HeroSection = styled(Box)({
flex: 1,
display: 'flex',
flexDirection: 'column',
justifyContent: 'center',
padding: '0 80px',
color: 'white',
position: 'relative',
backgroundSize: 'cover',
backgroundPosition: 'center',
'&::before': {
content: '""',
position: 'absolute',
inset: 0,
background: 'linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.6))',
},
'@media (max-width: 900px)': {
display: 'none',
},
});

// Login box - minimalista
const LoginBox = styled(Box)({
background: 'white',
borderRadius: '24px',
boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
padding: '40px',
width: '100%',
maxWidth: '400px',
animation: ${fadeIn} 0.3s ease-out,
});

// Inputs limpios
const StyledTextField = styled(TextField)({
'& .MuiOutlinedInput-root': {
backgroundColor: colors.gray100,
borderRadius: '12px',
transition: 'all 0.2s ease',
'&:hover': {
backgroundColor: '#F0F2F5',
},
'&.Mui-focused': {
backgroundColor: 'white',
boxShadow: 0 0 0 2px ${colors.primary},
},
},
});

// Botón principal
const StyledButton = styled(Button)({
background: colors.primary,
color: 'white',
padding: '14px',
borderRadius: '12px',
fontWeight: 600,
fontSize: '1rem',
textTransform: 'none',
transition: 'all 0.2s ease',
'&:hover': {
background: colors.primaryDark,
transform: 'translateY(-1px)',
boxShadow: 0 8px 20px ${alpha(colors.primary, 0.2)},
},
});

// Badge de plataforma oficial
const OfficialBadge = () => (
<Box sx={{
display: 'inline-flex',
alignItems: 'center',
gap: 0.5,
px: 1.5,
py: 0.5,
borderRadius: '20px',
bgcolor: alpha(colors.primary, 0.1),
color: colors.primary,
fontSize: '0.75rem',
fontWeight: 600,
letterSpacing: '0.3px',
mb: 2,
}}>
<Verified sx={{ fontSize: '14px' }} />
PLATAFORMA OFICIAL DE LA MÚSICA ECUATOGUINEANA
</Box>
);

// ============================================
// HERO SECTION
// ============================================
const LoginHero = () => {
const heroImage = "/Happy face.jpg";

return (
<HeroSection sx={{ backgroundImage: url(${heroImage}) }}>
<Box sx={{ position: 'relative', maxWidth: 520 }}>
<OfficialBadge />

<Typography  
      variant="h1"  
      sx={{  
        fontSize: '3.5rem',  
        fontWeight: 700,  
        lineHeight: 1.1,  
        letterSpacing: '-1px',  
        mb: 2,  
      }}  
    >  
      La nueva era del sonido en Guinea.  
    </Typography>  

    <Typography  
      sx={{  
        fontSize: '1.1rem',  
        opacity: 0.8,  
        mb: 3,  
      }}  
    >  
      Descubre, publica y haz crecer tu música.   
      La plataforma que conecta tu talento con el mundo.  
    </Typography>  

    <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>  
      {['+50K canciones', '+5K artistas', '100% local'].map((text, i) => (  
        <Typography key={i} sx={{ fontSize: '0.9rem', opacity: 0.6 }}>  
          {text}  
        </Typography>  
      ))}  
    </Box>  
  </Box>  
</HeroSection>

);
};

// ============================================
// LOGIN CONTENT - SIN IP EN FRONTEND
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
  // ✅ El backend obtiene la IP automáticamente del request  
  const response = await api.post("/musica/api/token/", formData);  

  login(response.data.access);  
    
  // ✅ Redirect inmediato, sin snackbar  
  navigate("/MainPage");  

} catch (error) {  
  const errorMessage = error.response?.data?.detail ||  
    "Credenciales incorrectas";  
  setErrors({ general: errorMessage });  
  setLoading(false);  
}

};

return (
<LoginBox>
{/* Logo */}
<Typography
variant="h4"
sx={{
fontWeight: 700,
color: colors.textDark,
mb: 1,
}}
>
djidjimusic
</Typography>

<Typography  
    sx={{  
      color: colors.gray600,  
      fontSize: '0.9rem',  
      mb: 4,  
    }}  
  >  
    Inicia sesión en tu cuenta  
  </Typography>  

  <form onSubmit={handleSubmit}>  
    <Grid container spacing={2.5}>  
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

      <Grid item xs={12} sx={{ mt: 1 }}>  
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
        <Box sx={{ textAlign: 'center', mt: 2 }}>  
          <Typography sx={{ color: colors.gray600, fontSize: '0.9rem', mb: 1 }}>  
            ¿No tienes cuenta?  
          </Typography>  
          <Link   
            href="/SingInPage"  
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
return (
<LoginContainer>
<LoginHero />
<Box sx={{
flex: 1,
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
bgcolor: 'white',
px: 3,
}}>
<Box sx={{ width: '100%', maxWidth: 400 }}>
{/* Versión móvil del hero */}
<Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
<OfficialBadge />
<Typography variant="h4" sx={{ fontWeight: 700, color: colors.textDark, mb: 1 }}>
La nueva era del sonido en Guinea.
</Typography>
<Typography sx={{ color: colors.gray600 }}>
Descubre música. Publica tu talento.
</Typography>
</Box>

<LoginContent />  
    </Box>  
  </Box>  
</LoginContainer>

);
};

export default Login;