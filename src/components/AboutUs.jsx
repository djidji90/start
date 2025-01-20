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
  TextField,
  Paper,
  IconButton,
  Link,
} from "@mui/material";
import { Facebook, Twitter, Instagram, WhatsApp } from "@mui/icons-material";

const AboutUs = () => {
  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh", py: 5 }}>
      <Container>
        {/* Encabezado */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Sobre Nosotros
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Conoce quiénes somos, nuestra misión, visión y cómo puedes unirte a
            nosotros.
          </Typography>
        </Box>

        {/* Misión y Visión */}
        <Grid container spacing={4} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                Nuestra Misión
              </Typography>
              <Typography variant="body1" color="textSecondary">
                En Djidji Music, nuestro objetivo es conectar a las personas con
                la música que aman. Queremos ofrecer una plataforma donde
                artistas y oyentes puedan compartir, descubrir y disfrutar
                música de manera sencilla y emocionante.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={5} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                Nuestra Visión
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Nos imaginamos un futuro donde Djidji Music sea el puente global
                entre artistas y amantes del EcuaBeat, creando una comunidad
                musical inclusiva, inspiradora y sostenible.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Equipo */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h4" gutterBottom>
            Nuestro Equipo
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Somos un grupo de jovenes entusiastas de la música, la tecnología y
            la creatividad, dedicados a ofrecer la mejor experiencia para ti.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              { name: "Leoncio Machimbo", role: "CEO", img: "cat.jpg" },
              { name: "Cairo Okafor", role: "CTO", img: "nike.jpg" },
              { name: "mª Angeles Pecho", role: "Diseñadora", img: "dog.jpg" },
            ].map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    alt={member.name}
                    height="200"
                    image={member.img}
                    loading="lazy"
                  />
                  <CardContent>
                    <Typography variant="h6">{member.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {member.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Redes Sociales y Contacto */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h4" gutterBottom>
            Síguenos en Redes Sociales
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <IconButton
              component={Link}
              href="https://www.facebook.com/djidji.music"
              target="_blank"
              sx={{ mx: 1 }}
            >
              <Facebook />
            </IconButton>
            <IconButton
              component={Link}
              href="https://www.twitter.com/djidji.music"
              target="_blank"
              sx={{ mx: 1 }}
            >
              <Twitter />
            </IconButton>
            <IconButton
              component={Link}
              href="https://www.instagram.com/djidji.music"
              target="_blank"
              sx={{ mx: 1 }}
            >
              <Instagram />
            </IconButton>
            <IconButton
              component={Link}
              href="https://wa.me/1234567890"
              target="_blank"
              sx={{ mx: 1 }}
            >
              <WhatsApp />
            </IconButton>
          </Box>

          <Typography variant="h5" gutterBottom>
            ¿Quieres hablar con nosotros?
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Puedes contactarnos a través de nuestros números de teléfono:
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            <strong>Teléfono: </strong>+240 555 380 241
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>WhatsApp: </strong>+240 555 380 241
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;
