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
    { icon: <Telegram />, name: "Telegram", color: "#0088CC", url: "https://t.me/djidjimusic" },
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
        py: 4,
        mt: 8,
        borderTop: `1px solid ${theme.palette.divider}`,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -15,
          left: 0,
          right: 0,
          height: 15,
          background: `linear-gradient(180deg, 
            transparent 0%, 
            ${theme.palette.background.paper} 100%)`,
        },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3} justifyContent="space-between">
          {/* Sección Logo y Descripción */}
          <Grid item xs={12} md={4} sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                transition: "transform 0.3s ease",
                "&:hover": { 
                  transform: "translateY(-2px)",
                  "& .flag-icon": {
                    animation: "pulse 1.5s infinite",
                  }
                },
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.1)" },
                  "100%": { transform: "scale(1)" },
                }
              }}
            >
              {/* 🔥 BANDERA REDUCIDA - de 48px a 36px */}
              <Typography
                className="flag-icon"
                sx={{
                  fontSize: 20,  // ANTES: 48 🔥 REDUCIDO
                  mr: 1.5,
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
                  transition: "all 0.3s ease",
                  lineHeight: 1,
                }}
              >
                🇬🇶
              </Typography>

              {/* Opcional: texto "Guinea Ecuatorial" si quieres */}
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
               
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.6,
                fontSize: "1rem",
                color: theme.palette.text.secondary,
                maxWidth: "90%",
                position: "relative",
                pl: 1.5,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 2,
                  height: "70%",
                  width: 2,
                  background: theme.palette.primary.main,
                  borderRadius: 1,
                }
              }}
            >
              Descubre, comparte y disfruta de la mejor música de Guinea
              Ecuatorial. La mejor plataforma para amantes del EcuaBeats.
            </Typography>
          </Grid>

          {/* Sección Reloj y Logo Djidji */}
          <Grid item xs={12} md={4} sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2
          }}>
            <Box sx={{
              background: `
                linear-gradient(
                  145deg, 
                  rgba(255,255,255,0.1) 0%, 
                  rgba(255,255,255,0.05) 100%
                )`,
              padding: "1rem 2rem",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              boxShadow: `
                0 6px 20px rgba(0,0,0,0.08),
                inset 0 -1px 3px rgba(255,255,255,0.2)`,
              border: `1px solid ${theme.palette.divider}`,
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                top: -40,
                left: -40,
                width: "80px",
                height: "80px",
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
                  mb: 0.5,
                  letterSpacing: 1.5,
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem",
                }}
              >
                Hora Actual en EG
              </Typography>
              <Typography
                variant="h3"
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
                  textShadow: "0 3px 5px rgba(0,0,0,0.1)",
                  fontSize: { xs: "1.8rem", sm: "2rem" }
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
                width: 90,
                height: "auto",
                filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.1))",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.04) rotate(-1.5deg)",
                }
              }}
            />
          </Grid>

          {/* Sección Redes Sociales */}
          <Grid item xs={12} md={4} sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            [theme.breakpoints.down('md')]: {
              alignItems: "center",
              mt: 4,
            },
          }}>
            <Typography
              variant="overline"
              sx={{
                mb: 2,
                letterSpacing: 2,
                fontWeight: 600,
                color: theme.palette.text.secondary,
                fontSize: "0.7rem",
              }}
            >
              NUESTRAS REDES SOCIALES 
            </Typography>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5,
              width: "100%",
              maxWidth: 350,
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
                      padding: 1,
                      "&:hover": {
                        background: `${social.color} !important`,
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 18px ${social.color}40`,
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

        {/* Sección Copyright */}
        <Box sx={{
          mt: 5,
          pt: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
        }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.75rem",
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
              fontSize: "0.65rem",
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