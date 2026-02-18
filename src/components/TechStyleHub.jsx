import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, styled, alpha, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '@fontsource-variable/inter';

// ============================================
// 🎨 CONFIGURACIÓN DE MARCA
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  secondary: '#2D3047',
  textLight: '#FFFFFF',
  textDark: '#1A1D29',
  gray100: '#F5F7FA',
  gray200: '#E4E7EB',
  gray600: '#6B7280',
};

// ============================================
// 🔑 API KEY
// ============================================
const OPENWEATHER_API_KEY = "0c6117bedab72bcd80aa6bc795a68753";

// ============================================
// 🌍 CIUDADES DE GUINEA ECUATORIAL
// ============================================
const ciudades = [
  { id: "malabo", nombre: "Malabo", tipo: "Capital", lat: "3.75", lon: "8.78" },
  { id: "bata", nombre: "Bata", tipo: "Puerto", lat: "1.86", lon: "9.77" },
  { id: "mongomo", nombre: "Mongomo", tipo: "Tierras altas", lat: "1.63", lon: "11.32" },
  { id: "luba", nombre: "Luba", tipo: "Bioko Sur", lat: "3.46", lon: "8.55" },
  { id: "baney", nombre: "Baney", tipo: "Playas", lat: "3.70", lon: "8.91" },
  { id: "annobon", nombre: "Annobón", tipo: "Hemisferio sur", lat: "-1.43", lon: "5.63" },
];

// ============================================
// 🎨 STYLED COMPONENTS
// ============================================
const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundColor: '#0A0F1E',
}));

const HeroImage = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'brightness(0.6)',
  },
});

const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
  zIndex: 1,
});

const ContentWrapper = styled(Container)({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme => theme.spacing(4, 2),
});

// ============================================
// 🎴 CIUDAD CARD COMPONENT
// ============================================
const CiudadRow = ({ ciudad, temperatura, icono }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ x: 5 }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        py: 1,
        px: 2,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.02)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          sx={{
            color: colors.primary,
            fontWeight: 500,
            fontSize: '0.9rem',
            minWidth: '70px',
          }}
        >
          {ciudad.nombre}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.8rem',
            fontWeight: 300,
          }}
        >
          {ciudad.tipo}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
          {temperatura || '--'}°
        </Typography>
        <Typography sx={{ fontSize: '1.1rem' }}>{icono || '☀️'}</Typography>
      </Box>
    </Box>
  </motion.div>
);

// ============================================
// 🎵 COMPONENTE PRINCIPAL
// ============================================
const GuineaEsencia = () => {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [ciudadActual, setCiudadActual] = useState(ciudades[0]);

  // Obtener clima para todas las ciudades
  useEffect(() => {
    const fetchAllWeather = async () => {
      setLoading(true);
      const weatherPromises = ciudades.map(async (ciudad) => {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
              params: {
                lat: ciudad.lat,
                lon: ciudad.lon,
                appid: OPENWEATHER_API_KEY,
                units: "metric",
              },
            }
          );
          return { id: ciudad.id, data: response.data };
        } catch (error) {
          console.error(`Error fetching weather for ${ciudad.nombre}:`, error);
          return { id: ciudad.id, data: null };
        }
      });

      const results = await Promise.all(weatherPromises);
      const weatherMap = {};
      results.forEach(result => {
        if (result.data) {
          weatherMap[result.id] = result.data;
        }
      });
      setWeatherData(weatherMap);
      setLoading(false);
    };

    fetchAllWeather();
    
    // Actualizar cada 10 minutos
    const interval = setInterval(fetchAllWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  // Rotar ciudad actual cada 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCiudadActual(prev => {
        const currentIndex = ciudades.findIndex(c => c.id === prev.id);
        const nextIndex = (currentIndex + 1) % ciudades.length;
        return ciudades[nextIndex];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (weatherMain) => {
    const icons = {
      "Clear": "☀️",
      "Clouds": "☁️",
      "Rain": "🌧️",
      "Drizzle": "🌦️",
      "Thunderstorm": "⛈️",
      "Snow": "❄️",
      "Mist": "🌫️",
      "Fog": "🌫️",
      "Haze": "🌤️",
    };
    return icons[weatherMain] || "☀️";
  };

  return (
    <HeroContainer>
      {/* Imagen de fondo */}
      <HeroImage>
        <img src="/futur.jpg" alt="Guinea Ecuatorial" />
        <Overlay />
      </HeroImage>

      {/* Puntos decorativos */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: colors.primary,
          opacity: 0.5,
          zIndex: 2,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: colors.primary,
          opacity: 0.5,
          zIndex: 2,
        }}
      />

      <ContentWrapper maxWidth="lg">
        {/* Contenido principal del Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', width: '100%' }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 300,
              letterSpacing: '4px',
              color: 'white',
              mb: 2,
              textTransform: 'uppercase',
            }}
          >
            Guinea Ecuatorial
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 300,
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.8)',
              mb: 4,
            }}
          >
            La esencia de nuestra tierra
          </Typography>

          {/* Clima actual animado */}
          <motion.div
            key={ciudadActual.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 5,
                px: 3,
                py: 1.5,
                borderRadius: '40px',
                border: '1px solid rgba(255,255,255,0.1)',
                bgcolor: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <Typography sx={{ fontSize: '1.5rem' }}>
                {getWeatherIcon(weatherData[ciudadActual.id]?.weather?.[0]?.main)}
              </Typography>
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 300,
                }}
              >
                {Math.round(weatherData[ciudadActual.id]?.main?.temp || 0)}° · {ciudadActual.nombre}
              </Typography>
            </Box>
          </motion.div>

          {/* Botón Explorar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate('/explorar')}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '40px',
                px: 5,
                py: 1.5,
                fontSize: '0.9rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: 300,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: 'rgba(255,107,53,0.1)',
                },
              }}
            >
              Explorar
            </Button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginTop: 80 }}
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
              ▼
            </Typography>
          </motion.div>
        </motion.div>

        {/* Lista de ciudades */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ width: '100%', maxWidth: '600px', marginTop: 80 }}
        >
          <Box
            sx={{
              bgcolor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 2,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {ciudades.map((ciudad) => (
              <CiudadRow
                key={ciudad.id}
                ciudad={ciudad}
                temperatura={Math.round(weatherData[ciudad.id]?.main?.temp)}
                icono={getWeatherIcon(weatherData[ciudad.id]?.weather?.[0]?.main)}
              />
            ))}
          </Box>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Typography
            sx={{
              mt: 6,
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.8rem',
              letterSpacing: '2px',
            }}
          >
           vistanos pronto 
          </Typography>
        </motion.div>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default GuineaEsencia;