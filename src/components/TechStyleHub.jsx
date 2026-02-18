import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography, Button, Container, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import '@fontsource-variable/inter';

// ============================================
// 🎨 CONFIGURACIÓN DE MARCA
// ============================================
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  background: '#0A0F1E',
  surface: '#0E1424',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textTertiary: 'rgba(255,255,255,0.4)',
  border: 'rgba(255,255,255,0.06)',
};

// ============================================
// ❓ PREGUNTAS ESTRATÉGICAS (8 FAQ)
// ============================================
const preguntas = [
  {
    pregunta: "¿Qué es djidjimusic?",
    respuesta: "Plataforma digital dedicada a impulsar y difundir la música de Guinea Ecuatorial. Conectamos artistas, oyentes y colaboradores en un mismo espacio."
  },
  {
    pregunta: "¿Qué música puedo encontrar?",
    respuesta: "Música urbana, afrobeat, gospel, tradicional, pop y otros géneros creados por artistas de Guinea Ecuatorial y la diáspora."
  },
  {
    pregunta: "¿Cómo descubro nuevos artistas?",
    respuesta: "Destacamos artistas emergentes, lanzamientos recientes y tendencias locales. Puedes explorar por género o por ciudad."
  },
  {
    pregunta: "¿Cómo subo mi música?",
    respuesta: "Los artistas pueden solicitar acceso a través de nuestro formulario de publicación. Revisamos cada propuesta con mirada curatorial."
  },
  {
    pregunta: "¿Es gratuita?",
    respuesta: "Sí, el acceso básico es gratuito. Próximamente funciones premium para apoyar directamente a los artistas."
  },
  {
    pregunta: "¿Cómo colaborar?",
    respuesta: "Trabajamos con marcas, instituciones culturales y proyectos que compartan nuestra visión. Contáctanos en nuestra sección de colaboración."
  },
  {
    pregunta: "¿Cómo se protege la música?",
    respuesta: "Respetamos los derechos de autor con acuerdos claros de distribución. Cada artista mantiene el control sobre su obra."
  },
  {
    pregunta: "¿Por qué enfocada en Guinea?",
    respuesta: "Porque el talento local merece un espacio propio, con identidad y proyección internacional. djidjimusic nace para construir industria."
  }
];

// ============================================
// 🤝 COLABORADORES (simulados)
// ============================================
const colaboradores = [
  { nombre: "Sello 1", logo: "◼" },
  { nombre: "Sello 2", logo: "◼" },
  { nombre: "Sello 3", logo: "◼" },
  { nombre: "Sello 4", logo: "◼" },
  { nombre: "Sello 5", logo: "◼" },
];

// ============================================
// 🌍 DATOS DE CLIMA (simulados)
// ============================================
const climaData = [
  { ciudad: "Malabo", temp: 27, estado: "Parcialmente nublado" },
  { ciudad: "Bata", temp: 29, estado: "Soleado" },
  { ciudad: "Annobón", temp: 26, estado: "Despejado" },
{ ciudad: "baney", temp: 24, estado: "Parcialmente nublado" },

];

// ============================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================
const DjidjiTrust = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [indicePregunta, setIndicePregunta] = useState(0);

  // Rotación automática de preguntas (cada 6 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndicePregunta((prev) => (prev + 1) % preguntas.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const preguntaActual = preguntas[indicePregunta];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(circle at 20% 30%, ${alpha(colors.primary, 0.03)} 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, ${alpha(colors.primary, 0.02)} 0%, transparent 50%),
          linear-gradient(145deg, ${colors.background} 0%, ${colors.surface} 100%)
        `,
        color: colors.textPrimary,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl">
        {/* Layout: dos columnas en desktop, una en móvil */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 6, md: 8 },
            alignItems: "center",
            minHeight: "100vh",
            py: { xs: 6, md: 0 },
          }}
        >
          {/* ======================================== */}
          {/* COLUMNA IZQUIERDA - MARCA + CTA */}
          {/* ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ maxWidth: "600px", mx: { xs: "auto", md: 0 } }}>
              {/* Overline */}
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: "6px",
                  fontSize: "0.7rem",
                  color: colors.textTertiary,
                  mb: 2,
                  display: "block",
                }}
              >
                CULTURA • SONIDO • IDENTIDAD
              </Typography>

              {/* Marca */}
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "3.5rem", md: "5rem" },
                  letterSpacing: "-2px",
                  lineHeight: 1,
                  mb: 2,
                  color: colors.textPrimary,
                }}
              >
                djidji
              </Typography>

              {/* Claim estratégico */}
              <Typography
                sx={{
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                  fontWeight: 300,
                  color: colors.textSecondary,
                  mb: 3,
                  lineHeight: 1.3,
                }}
              >
                La banda sonora de Guinea.
                <Box component="span" sx={{ display: "block", color: colors.textTertiary, fontSize: "1.1rem", mt: 1 }}>
                  Hecha aquí, para el mundo.
                </Box>
              </Typography>

              {/* CTA Principal + link secundario */}
              <Box sx={{ mb: 5 }}>
                <Button
                  variant="contained"
                  href="/explorar"
                  size="large"
                  sx={{
                    bgcolor: colors.primary,
                    color: "white",
                    px: 5,
                    py: 1.8,
                    borderRadius: "40px",
                    fontWeight: 500,
                    fontSize: "1.1rem",
                    textTransform: "none",
                    boxShadow: `0 8px 20px ${alpha(colors.primary, 0.2)}`,
                    "&:hover": {
                      bgcolor: colors.primaryDark,
                      boxShadow: `0 12px 28px ${alpha(colors.primary, 0.3)}`,
                    },
                    transition: "all 0.2s ease",
                    mr: 2,
                    mb: { xs: 1, sm: 0 },
                  }}
                >
                  Explorar música
                </Button>
                <Typography
                  component="a"
                  href="/MainPage"
                  sx={{
                    color: colors.textTertiary,
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    borderBottom: `1px dotted ${colors.textTertiary}`,
                    cursor: "pointer",
                    "&:hover": {
                      color: colors.primary,
                      borderBottomColor: colors.primary,
                    },
                    transition: "all 0.2s ease",
                    ml: { xs: 0, sm: 2 },
                    display: { xs: "block", sm: "inline-block" },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  ¿Eres artista?
                </Typography>
              </Box>

              {/* Colaboradores con contexto */}
              <Box sx={{ mt: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.textTertiary,
                    fontSize: "0.7rem",
                    letterSpacing: "1px",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  CONFÍAN EN EL TALENTO NACIONAL
                </Typography>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {colaboradores.map((col, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "8px",
                        bgcolor: alpha(colors.textPrimary, 0.05),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: alpha(colors.textPrimary, 0.3),
                        fontSize: "1.2rem",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: alpha(colors.primary, 0.1),
                          color: colors.primary,
                        },
                      }}
                    >
                      {col.logo}
                    </Box>
                  ))}
                  <Typography
                    sx={{
                      color: colors.textTertiary,
                      fontSize: "0.85rem",
                      alignSelf: "center",
                    }}
                  >
                    +20 sellos independientes
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>

          {/* ======================================== */}
          {/* COLUMNA DERECHA - FAQ + CLIMA */}
          {/* ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ maxWidth: "500px", mx: { xs: "auto", md: 0 } }}>
              {/* FAQ ROTATIVA con indicador */}
              <Box sx={{ mb: 6 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    color: colors.textSecondary,
                    mb: 2,
                    fontSize: "1rem",
                    letterSpacing: "1px",
                  }}
                >
                  Preguntas frecuentes
                </Typography>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={indicePregunta}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        sx={{
                          fontSize: "1.3rem",
                          fontWeight: 500,
                          color: colors.textPrimary,
                          mb: 1.5,
                          lineHeight: 1.3,
                        }}
                      >
                        {preguntaActual.pregunta}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          color: colors.textSecondary,
                          lineHeight: 1.6,
                          fontWeight: 300,
                        }}
                      >
                        {preguntaActual.respuesta}
                      </Typography>
                    </Box>
                  </motion.div>
                </AnimatePresence>

                {/* Indicador de progreso (puntos) */}
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  {preguntas.map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: i === indicePregunta ? colors.primary : alpha(colors.textPrimary, 0.2),
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* CLIMA EN VIVO (contexto país, siempre secundario) */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.textTertiary,
                    fontSize: "0.7rem",
                    letterSpacing: "1px",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  GUINEA EN VIVO
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {climaData.map((ciudad, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          color: colors.textSecondary,
                          fontSize: "0.9rem",
                          minWidth: "70px",
                          fontWeight: 400,
                        }}
                      >
                        {ciudad.ciudad}
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.textPrimary,
                          fontSize: "1rem",
                          fontWeight: 500,
                          minWidth: "40px",
                        }}
                      >
                        {ciudad.temp}°
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.textTertiary,
                          fontSize: "0.85rem",
                          fontWeight: 300,
                        }}
                      >
                        {ciudad.estado}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default DjidjiTrust;