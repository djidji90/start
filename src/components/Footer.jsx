import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Container,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  MusicNote,
  Telegram,
  WhatsApp,
  Favorite,
} from "@mui/icons-material";

import djidji from "../assets/imagenes/djidji.png";

const Footer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const socialLinks = [
    { icon: <Facebook />, name: "Facebook", color: "#1877F2", url:"https://www.facebook.com/profile.php?id=61583244630732" },
    { icon: <Telegram />, name: "Telegram", color: "#0088CC", url: "https://t.me/LeoMachimbo" },
    { icon: <Twitter />, name: "Twitter", color: "#1DA1F2", url: "https://x.com/MachimboLeon" },
    { icon: <Instagram />, name: "Instagram", color: "#E4405F", url: "https://www.instagram.com/djidjimusic/" },
    { icon: <YouTube />, name: "YouTube", color: "#FF0000", url: "https://www.youtube.com/@leonciomachimbo" },
    { icon: <WhatsApp />, name: "WhatsApp", color: "#25D366", url: "https://wa.me/240555380241"},
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: `
          linear-gradient(145deg, 
            ${theme.palette.background.paper} 0%, 
            ${theme.palette.grey[100]} 100%
          )`,
        color: theme.palette.text.primary,
        py: 4, // Reducido de 8 a 4
        mt: 8, // Reducido de 12 a 8
        borderTop: `1px solid ${theme.palette.divider}`,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -15, // Reducido de -20 a -15
          left: 0,
          right: 0,
          height: 15, // Reducido de 20 a 15
          background: `linear-gradient(180deg, 
            transparent 0%, 
            ${theme.palette.background.paper} 100%)`,
        },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3} justifyContent="space-between"> {/* Reducido spacing de 6 a 3 */}
          {/* Sección Logo y Descripción - Sin título DJIDJI MUSIC */}
          <Grid item xs={12} md={4} sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2, // Reducido de 3 a 2
                transition: "transform 0.3s ease",
                "&:hover": { 
                  transform: "translateY(-2px)", // Reducido efecto hover
                  "& .music-icon": {
                    animation: "pulse 1.5s infinite",
                  }
                },
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.1)" }, // Reducido de 1.2 a 1.1
                  "100%": { transform: "scale(1)" },
                }
              }}
            >
              <MusicNote
                className="music-icon"
                sx={{
                  fontSize: 36, // Reducido de 48 a 36
                  mr: 1.5, // Reducido de 2 a 1.5
                  color: theme.palette.primary.main,
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))", // Reducido sombra
                }}
              />
            </Box>

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.6, // Reducido de 1.7 a 1.6
                fontSize: "1rem", // Reducido de 1.1rem a 1rem
                color: theme.palette.text.secondary,
                maxWidth: "90%", // Aumentado de 85% a 90%
                position: "relative",
                pl: 1.5, // Reducido de 2 a 1.5
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 2,
                  height: "70%", // Reducido de 80% a 70%
                  width: 2, // Reducido de 3 a 2
                  background: theme.palette.primary.main,
                  borderRadius: 1, // Reducido de 2 a 1
                }
              }}
            >
              Descubre, comparte y disfruta de la mejor música de Guinea
              Ecuatorial. La mejor plataforma para amantes del EcuaBeats.
            </Typography>
          </Grid>

          {/* Sección Reloj y Logo Djidji - Reducido */}
          <Grid item xs={12} md={4} sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2 // Reducido de 4 a 2
          }}>
            <Box sx={{
              background: `
                linear-gradient(
                  145deg, 
                  rgba(255,255,255,0.1) 0%, 
                  rgba(255,255,255,0.05) 100%
                )`,
              padding: "1rem 2rem", // Reducido padding
              borderRadius: "16px", // Reducido de 20px a 16px
              backdropFilter: "blur(10px)", // Reducido de 12px a 10px
              boxShadow: `
                0 6px 20px rgba(0,0,0,0.08), // Reducido sombra
                inset 0 -1px 3px rgba(255,255,255,0.2)`,
              border: `1px solid ${theme.palette.divider}`,
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                top: -40, // Reducido de -50 a -40
                left: -40, // Reducido de -50 a -40
                width: "80px", // Reducido de 100px a 80px
                height: "80px", // Reducido de 100px a 80px
                background: `
                  radial-gradient(
                    circle, 
                    ${theme.palette.primary.light} 0%, 
                    transparent 70%
                  )`,
                opacity: 0.3,
              }
            }}>
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  textAlign: "center",
                  mb: 0.5, // Reducido de 1 a 0.5
                  letterSpacing: 1.5, // Reducido de 2 a 1.5
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem", // Añadido para reducir tamaño
                }}
              >
                Hora Actual en EG
              </Typography>
              <Typography
                variant="h3" // Cambiado de h2 a h3
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Roboto Mono', monospace",
                  background: `
                    linear-gradient(
                      135deg, 
                      ${theme.palette.primary.main} 30%, 
                      ${theme.palette.secondary.main} 100%
                    )`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 3px 5px rgba(0,0,0,0.1)", // Reducido sombra
                  fontSize: { xs: "1.8rem", sm: "2rem" } // Tamaño responsive
                }}
              >
                {time}
              </Typography>
            </Box>

            <Box
              component="img"
              src={djidji}
              alt="Logo Djidji Music"
              sx={{
                width: 90, // Reducido de 120 a 90
                height: "auto",
                filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.1))", // Reducido sombra
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.04) rotate(-1.5deg)", // Reducido efecto hover
                }
              }}
            />
          </Grid>

          {/* Sección Redes Sociales - Reducido */}
          <Grid item xs={12} md={4} sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            [theme.breakpoints.down('md')]: {
              alignItems: "center",
              mt: 4, // Reducido de 6 a 4
            },
          }}>
            <Typography
              variant="overline"
              sx={{
                mb: 2, // Reducido de 3 a 2
                letterSpacing: 2, // Reducido de 3 a 2
                fontWeight: 600,
                color: theme.palette.text.secondary,
                fontSize: "0.7rem", // Reducido tamaño
              }}
            >
              NUESTRAS REDES SOCIALES 
            </Typography>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5, // Reducido de 2 a 1.5
              width: "100%",
              maxWidth: 350, // Reducido de 400 a 350
            }}>
              {socialLinks.map((social, index) => (
                <Tooltip key={index} title={social.name} arrow>
                  <IconButton
                    href={social.url}
                    target="_blank"
                    rel="noopener"
                    sx={{
                      aspectRatio: "1/1",
                      background: `
                        linear-gradient(
                          145deg, 
                          rgba(255,255,255,0.1) 0%, 
                          rgba(255,255,255,0.05) 100%
                        )`,
                      backdropFilter: "blur(8px)",
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.primary,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      padding: 1, // Añadido padding reducido
                      "&:hover": {
                        background: `${social.color} !important`,
                        transform: "translateY(-2px)", // Reducido de -3px a -2px
                        boxShadow: `0 6px 18px ${social.color}40`, // Reducido sombra
                        color: "#ffffff",
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Sección Copyright - Reducido */}
        <Box sx={{
          mt: 5, // Reducido de 8 a 5
          pt: 3, // Reducido de 4 a 3
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5, // Reducido de 1 a 0.5
        }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.75rem", // Reducido de 0.85rem a 0.75rem
              color: theme.palette.text.secondary,
              textAlign: "center",
              "& span": {
                color: theme.palette.primary.main,
                fontWeight: 500,
              }
            }}
          >
            © {new Date().getFullYear()} <span>Djidji Music</span> - 
            Todos los derechos reservados
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.65rem", // Reducido de 0.75rem a 0.65rem
              color: theme.palette.text.secondary,
            }}
          >
            Powered by 
            <Favorite sx={{ fontSize: 10, color: theme.palette.error.main }} /> 
            <span style={{ color: theme.palette.secondary.main }}>
              Leoncio Machimbo
            </span>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;