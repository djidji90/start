  import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Link,
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
  return (
    <Box
      sx={{
        backgroundColor: "teal",
        color: "white",
        py: 2,
        mt: 2,
      }}
    >
      <Container maxWidth="xl" whidh="1px">
        <Grid container spacing={4}>
          {/* Logo y descripción */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              <MusicNote sx={{ fontSize: 30, mr: 1 }} />
              djidji music
            </Typography>
            <Typography variant="body2">
              Descubre, comparte y disfruta música de todo el mundo. La mejor
              plataforma para amantes del EcuaBeat.
            
            </Typography>
          </Grid>

          {/* Enlaces rápidos */}
          
           

          {/* Redes sociales */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Síguenos
            </Typography>
            <Box>
              <IconButton href="https://facebook.com" color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton href="https://telegram.com" color="inherit" aria-label="telegram">
                <Telegram />
              </IconButton>
              <IconButton href="https://twitter.com" color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton href="https://instagram.com" color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton href="https://youtube.com" color="inherit" aria-label="YouTube">
                <YouTube />
              </IconButton>
              <IconButton href="https://whatsapp.com" color="inherit" aria-label="whatsapp">
                <WhatsApp />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Créditos */}
        <Box
          sx={{
            borderTop: "1px solid white",
            mt: 4,
            pt: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} djidji. Todos los derechos reservados. Leoncio A. Machimbo
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
