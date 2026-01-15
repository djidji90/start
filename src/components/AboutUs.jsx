import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  IconButton,
  Link,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  WhatsApp,
  MusicNote,
  Email,
  Phone,
  Group,
  RocketLaunch,
  Visibility
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

// Mock team members (deberías reemplazar con imágenes reales)
const teamMembers = [
  { 
    name: "Leoncio Machimbo", 
    role: "CEO & Fundador", 
    bio: "Apasionado por la música ecuatoguineana y la tecnología",
    color: "#ff6ec4"
  },
  { 
    name: "Cairo Okafor", 
    role: "CTO", 
    bio: "Especialista en desarrollo web y arquitectura de software",
    color: "#7873f5"
  },
  { 
    name: "Mª Angeles Pecho", 
    role: "Diseñadora UI/UX", 
    bio: "Crea experiencias visuales memorables para nuestros usuarios",
    color: "#4ADEDE"
  },
];

const socialLinks = [
  { icon: Facebook, name: "Facebook", url: "https://facebook.com/djidjimusic", color: "#1877F2" },
  { icon: Instagram, name: "Instagram", url: "https://instagram.com/djidjimusic", color: "#E4405F" },
  { icon: Twitter, name: "Twitter", url: "https://twitter.com/djidjimusic", color: "#1DA1F2" },
  { icon: WhatsApp, name: "WhatsApp", url: "https://wa.me/240555380241", color: "#25D366" },
];

const AboutUs = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      background: "linear-gradient(135deg, #f5f7fa 0%, #f4f4f9 100%)",
      minHeight: "100vh",
      py: { xs: 4, md: 8 },
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Elementos decorativos */}
      <Box sx={{
        position: "absolute",
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        background: "radial-gradient(circle, rgba(120,115,245,0.1) 0%, transparent 70%)",
        zIndex: 0,
      }} />
      
      <Container sx={{ position: "relative", zIndex: 1 }}>
        {/* Encabezado */}
        <Box 
          textAlign="center" 
          mb={{ xs: 6, md: 8 }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Chip 
            icon={<MusicNote />} 
            label="Nuestra Historia" 
            sx={{ 
              mb: 3, 
              background: "linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)",
              color: "white",
              fontWeight: 600,
              px: 2,
              py: 1,
            }} 
          />
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 800, 
              mb: 2,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              background: "linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Conoce Djidji Music
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            maxWidth="md" 
            mx="auto"
            sx={{ fontWeight: 300 }}
          >
            Somos más que una plataforma musical. Somos el puente que conecta el talento de Guinea Ecuatorial con el mundo.
          </Typography>
        </Box>

        {/* Misión y Visión */}
        <Grid container spacing={4} mb={{ xs: 6, md: 8 }}>
          {[
            { 
              title: "Nuestra Misión", 
              icon: <RocketLaunch sx={{ fontSize: 40 }} />,
              content: "Promover y distribuir la música ecuatoguineana a nivel global, creando oportunidades para artistas emergentes y estableciendo conexiones culturales a través del EcuaBeat.",
              color: "#ff6ec4"
            },
            { 
              title: "Nuestra Visión", 
              icon: <Visibility sx={{ fontSize: 40 }} />,
              content: "Ser la plataforma líder mundial para la música de Guinea Ecuatorial, reconocida por nuestra innovación tecnológica y compromiso con la diversidad cultural.",
              color: "#7873f5"
            }
          ].map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  background: `linear-gradient(145deg, ${item.color}15 0%, transparent 100%)`,
                  border: `1px solid ${item.color}30`,
                  backdropFilter: "blur(10px)",
                  height: "100%",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 20px 40px ${item.color}20`,
                  }
                }}
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 3,
                  color: item.color
                }}>
                  {item.icon}
                  <Typography variant="h4" sx={{ ml: 2, fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {item.content}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Nuestro Equipo */}
        <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
          <Chip 
            icon={<Group />} 
            label="El Equipo" 
            sx={{ 
              mb: 3, 
              background: "linear-gradient(135deg, #4ADEDE 0%, #7873f5 100%)",
              color: "white",
              fontWeight: 600,
              px: 2,
              py: 1,
            }} 
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
            Conoce al equipo
          </Typography>
          <Typography variant="h6" color="text.secondary" maxWidth="sm" mx="auto" mb={4}>
            Jóvenes apasionados uniendo música, tecnología y creatividad para revolucionar la industria musical.
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    borderRadius: 4, 
                    border: "none",
                    background: `linear-gradient(135deg, ${member.color}15 0%, transparent 100%)`,
                    boxShadow: `0 10px 30px ${member.color}15`,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-12px) scale(1.02)",
                      boxShadow: `0 25px 50px ${member.color}25`,
                    }
                  }}
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mx: "auto",
                        mb: 3,
                        border: `4px solid ${member.color}`,
                        bgcolor: `${member.color}30`,
                        fontSize: "3rem",
                        color: member.color,
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                    <CardContent sx={{ p: 0 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {member.name}
                      </Typography>
                      <Chip 
                        label={member.role} 
                        sx={{ 
                          mb: 2, 
                          bgcolor: `${member.color}20`,
                          color: member.color,
                          fontWeight: 600,
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {member.bio}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contacto y Redes */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            background: "linear-gradient(135deg, rgba(255,110,196,0.05) 0%, rgba(120,115,245,0.05) 100%)",
            border: "1px solid rgba(120,115,245,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                ¿Listo para conectar?
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Estamos aquí para colaborar, escuchar tus ideas y crecer juntos en este viaje musical.
              </Typography>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Phone sx={{ color: "#7873f5" }} />
                  <Typography variant="body1" fontWeight={500}>
                    +240 555 380 241
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <WhatsApp sx={{ color: "#25D366" }} />
                  <Typography variant="body1" fontWeight={500}>
                    WhatsApp: +240 555 380 241
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Email sx={{ color: "#ff6ec4" }} />
                  <Typography variant="body1" fontWeight={500}>
                    contacto@djidjimusic.com
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: { xs: "center", md: "left" } }}>
                Síguenos en redes
              </Typography>
              <Box sx={{ 
                display: "flex", 
                justifyContent: { xs: "center", md: "flex-start" }, 
                gap: 2,
                flexWrap: "wrap" 
              }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener"
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: `${social.color}15`,
                      color: social.color,
                      border: `1px solid ${social.color}30`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: social.color,
                        color: "white",
                        transform: "scale(1.1)",
                      }
                    }}
                  >
                    <social.icon fontSize="medium" />
                  </IconButton>
                ))}
              </Box>
              
              <Box sx={{ mt: 4, textAlign: { xs: "center", md: "left" } }}>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/MainPage"
                  sx={{
                    px: 4,
                    py: 1.5,
                    background: "linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)",
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)",
                      opacity: 0.9,
                    }
                  }}
                >
                  escucha musica 🐣
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Footer pequeño */}
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Djidji Music. Todos los derechos reservados.
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1 }}>
            Hecho con ❤️ desde Guinea Ecuatorial para el mundo
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;