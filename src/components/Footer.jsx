import React from "react";
import pato from "../assets/imagenes/pato.jpg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  Box,
  Typography,
  IconButton,
  Grid,
  Container,
} from "@mui/material";
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

  // Actualización del reloj
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

    return () => clearInterval(interval); // Limpieza del intervalo
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "teal",
        color: "white",
        py: 4,
        mt: 5,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Logo y descripción */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              <MusicNote sx={{ fontSize: 30, mr: 1 }} />
              Djidji Music
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              Descubre, comparte y disfruta música de todo el mundo. La mejor
              plataforma para amantes del EcuaBeat.
            </Typography>
          </Grid>

          {/* Reloj digital */}
          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Hora Actual
            </Typography>
            <Typography
              variant="h4"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "10px 20px",
                borderRadius: "8px",
                display: "inline-block",
                fontWeight: "bold",
              }}
            >
              {time}
            </Typography>
          </Grid>

          {/* Redes sociales */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Síguenos
            </Typography>
            <Box>
              <IconButton
                href="https://facebook.com"
                color="inherit"
                aria-label="Facebook"
              >
                <Facebook />
              </IconButton>
              <IconButton
                href="https://telegram.com"
                color="inherit"
                aria-label="Telegram"
              >
                <Telegram />
              </IconButton>
              <IconButton
                href="https://twitter.com"
                color="inherit"
                aria-label="Twitter"
              >
                <Twitter />
              </IconButton>
              <IconButton
                href="https://instagram.com"
                color="inherit"
                aria-label="Instagram"
              >
                <Instagram />
              </IconButton>
              <IconButton
                href="https://youtube.com"
                color="inherit"
                aria-label="YouTube"
              >
                <YouTube />
              </IconButton>
              <IconButton
                href="https://whatsapp.com"
                color="inherit"
                aria-label="WhatsApp"
              >
                <WhatsApp />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Créditos y logo */}
        <Box
          sx={{
            borderTop: "1px solid white",
            mt: 4,
            pt: 2,
            textAlign: "center",
          }}
        >
          <img
            src={pato}
            alt="Logo"
            style={{
              width: 50,
              height: "auto",
              marginRight: "20px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />

          <Typography variant="body2" sx={{ mt: 1 }}>
            © {new Date().getFullYear()} Djidji. Todos los derechos reservados. Leoncio A. Machimbo
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

