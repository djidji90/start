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
} from "@mui/material";
import { Facebook, Twitter, Instagram, WhatsApp } from "@mui/icons-material";

const teamMembers = [
  { name: "Leoncio Machimbo", role: "CEO", img: "cat.jpg" },
  { name: "Cairo Okafor", role: "CTO", img: "nike.jpg" },
  { name: "Mª Angeles Pecho", role: "Diseñadora", img: "dog.jpg" },
];

const AboutUs = () => {
  return (
    <Box sx={{ backgroundColor: "#f4f4f9", minHeight: "100vh", py: 8 }}>
      <Container>
        {/* Encabezado */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" fontWeight={700} gutterBottom>
            Sobre Nosotros
          </Typography>
          <Typography variant="h6" color="textSecondary" maxWidth="md" mx="auto">
            Conoce quiénes somos, nuestra misión, visión y cómo puedes unirte a
            nosotros.
          </Typography>
        </Box>

        {/* Misión y Visión */}
        <Grid container spacing={4}>
          {["Nuestra Misión", "Nuestra Visión"].map((title, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {title}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {index === 0
                    ? "En Djidji Music, nuestro objetivo es conectar a las personas con la música que aman."
                    : "Nos imaginamos un futuro donde Djidji Music sea el puente global entre artistas y amantes del EcuaBeat."}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Nuestro Equipo */}
        <Box textAlign="center" mt={8}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Nuestro Equipo
          </Typography>
          <Typography variant="body1" color="textSecondary" maxWidth="sm" mx="auto" mb={4}>
            Somos un grupo de jóvenes entusiastas de la música, la tecnología y la creatividad.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardMedia component="img" height="240" image={member.img} alt={member.name} />
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} textAlign="center">
                      {member.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                      {member.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Redes Sociales */}
        <Box textAlign="center" mt={8}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Síguenos en Redes Sociales
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} mb={4}>
            {[Facebook, Twitter, Instagram, WhatsApp].map((Icon, index) => (
              <IconButton key={index} sx={{ color: "#555" }}>
                <Icon fontSize="large" />
              </IconButton>
            ))}
          </Box>

          {/* Contacto */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            ¿Quieres hablar con nosotros?
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Puedes contactarnos a través de:
          </Typography>
          <Typography variant="body2" fontWeight={500} mt={2}>
            <strong>Teléfono:</strong> +240 555 380 241
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            <strong>WhatsApp:</strong> +240 555 380 241
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;
