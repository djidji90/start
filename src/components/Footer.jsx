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
        py: 8,
        mt: 12,
        borderTop: `1px solid ${theme.palette.divider}`,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -20,
          left: 0,
          right: 0,
          height: 20,
          background: `linear-gradient(180deg, 
            transparent 0%, 
            ${theme.palette.background.paper} 100%)`,
        },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6} justifyContent="space-between">
          {/* Sección Logo y Descripción */}
          <Grid item xs={12} md={4} sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
                transition: "transform 0.3s ease",
                "&:hover": { 
                  transform: "translateY(-3px)",
                  "& .music-icon": {
                    animation: "pulse 1.5s infinite",
                  }
                },
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.2)" },
                  "100%": { transform: "scale(1)" },
                }
              }}
            >
              <MusicNote
                className="music-icon"
                sx={{
                  fontSize: 48,
                  mr: 2,
                  color: theme.palette.primary.main,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontWeight: 400,
                  fontSize: "2.75rem",
                  letterSpacing: 1.5,
                  background: `
                    linear-gradient(
                      135deg, 
                      ${theme.palette.primary.main} 30%, 
                      ${theme.palette.secondary.main} 100%
                    )`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                DJIDJI MUSIC
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.7,
                fontSize: "1.1rem",
                color: theme.palette.text.secondary,
                maxWidth: "85%",
                position: "relative",
                pl: 2,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 2,
                  height: "80%",
                  width: 3,
                  background: theme.palette.primary.main,
                  borderRadius: 2,
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
            gap: 4
          }}>
            <Box sx={{
              background: `
                linear-gradient(
                  145deg, 
                  rgba(255,255,255,0.1) 0%, 
                  rgba(255,255,255,0.05) 100%
                )`,
              padding: "1.5rem 2.5rem",
              borderRadius: "20px",
              backdropFilter: "blur(12px)",
              boxShadow: `
                0 8px 32px rgba(0,0,0,0.1),
                inset 0 -2px 4px rgba(255,255,255,0.2)`,
              border: `1px solid ${theme.palette.divider}`,
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                top: -50,
                left: -50,
                width: "100px",
                height: "100px",
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
                  mb: 1,
                  letterSpacing: 2,
                  color: theme.palette.text.secondary,
                }}
              >
                Hora Actual en EG
              </Typography>
              <Typography
                variant="h2"
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
                  textShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
                width: 120,
                height: "auto",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05) rotate(-2deg)",
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
              mt: 6,
            },
          }}>
            <Typography
              variant="overline"
              sx={{
                mb: 3,
                letterSpacing: 3,
                fontWeight: 600,
                color: theme.palette.text.secondary,
              }}
            >
              nuestras redes sociales 
            </Typography>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
              width: "100%",
              maxWidth: 400,
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
                      "&:hover": {
                        background: `${social.color} !important`,
                        transform: "translateY(-3px)",
                        boxShadow: `0 8px 24px ${social.color}40`,
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
          mt: 8,
          pt: 4,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.85rem",
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
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
            }}
          >
            Powered by 
            <Favorite sx={{ fontSize: 12, color: theme.palette.error.main }} /> 
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