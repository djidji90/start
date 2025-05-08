import React from "react";
import djidji from "../assets/imagenes/djidji.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { Box, Typography, IconButton, Grid, Container, useTheme } from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  MusicNote,
  Telegram,
  WhatsApp,
} from "@mui/icons-material";

const Footer = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const theme = useTheme();

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

  return (
    <Box
  sx={{
    backgroundColor: "whitesmoke", // Fondo blanco como la Navbar
    color: "black", // Texto oscuro para visibilidad
    py: 6,
    mt: 10,
    position: "relative",
    boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)", // Sombra suave opcional
    borderTop: "1px solid rgba(0, 0, 0, 0.1)", // Línea superior sutil
  }}
>

      <Container maxWidth="xl">
        <Grid container spacing={6} justifyContent="space-between">
          {/* Logo y descripción */}
          <Grid item xs={12} md={4} sx={{ position: "relative" }}>
            <Box sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              "&:hover": { transform: "scale(1.02)" },
              transition: "transform 0.3s ease",
            }}>
              <MusicNote sx={{
                fontSize: 40,
                mr: 2,
                color: theme.palette.secondary.main,
                filter: "drop-shadow(0 0 5px rgba(255,255,255,0.5))"
              }} />
              <Typography variant="h4" sx={{
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                background: "#1976d2",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Djidji Music
              </Typography>
            </Box>
            <Typography variant="body1" sx={{
              lineHeight: 1.8,
              opacity: 0.9,
              fontSize: "1.1rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}>
              Descubre, comparte y disfruta de la mejor música de guinea ecuatorial. en La 
              mejor plataforma para amantes del EcuaBeats.
            </Typography>
          </Grid>

          {/* Reloj digital */}
          <Grid item xs={12} md={4} sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Typography variant="h6" sx={{
              mb: 3,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}>
              Hora Actual
            </Typography>
            <Box sx={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "15px 30px",
              borderRadius: "15px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Roboto Mono', monospace",
                  background: "rgb(0, 14, 204)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 10px rgba(168,237,234,0.5)",
                }}
              >
                {time}
              </Typography>
            </Box>
          </Grid>

          {/* Redes sociales */}
          <Grid item xs={12} md={4} sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            [theme.breakpoints.down('md')]: {
              alignItems: "center",
              mt: 4,
            },
          }}>
            <Typography variant="h6" sx={{
              mb: 3,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}>
              Síguenos
            </Typography>
            <Box sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "flex-end",
              [theme.breakpoints.down('md')]: {
                justifyContent: "center",
              },
            }}>
              {[
                { icon: <Facebook />, color: "#1877F2" },
                { icon: <Telegram />, color: "#0088CC" },
                { icon: <Twitter />, color: "#1DA1F2" },
                { icon: <Instagram />, color: "#E4405F" },
                { icon: <YouTube />, color: "#FF0000" },
                { icon: <WhatsApp />, color: "#25D366" },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  href=""
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    "&:hover": {
                      backgroundColor: social.color,
                      transform: "translateY(-3px)",
                      boxShadow: `0 5px 15px ${social.color}80`,
                    },
                    transition: "all 0.3s ease",
                    width: 48,
                    height: 48,
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Créditos y logo */}
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            mt: 6,
            pt: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Box
            component="img"
            src={djidji}
            alt="Logo"
            sx={{
              width: 70,
              height: "auto",
              cursor: "pointer",
              mb: 2,
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "rotate(-10deg) scale(1.1)",
              },
            }}
            onClick={() => navigate("/")}
          />
          <Typography variant="body2" sx={{
            fontSize: "0.9rem",
            opacity: 0.8,
            textAlign: "center",
            "& span": {
              color: theme.palette.secondary.main,
              fontWeight: 600,
            },
          }}>
            © {new Date().getFullYear()} <span>Djidji</span>. Todos los derechos reservados.<br />
            Leoncio A. Machimbo
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;