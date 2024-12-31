import React from "react";
import { Typography, Box, Grid, Paper } from "@mui/material";

const testimonials = [
  { name: "Carlos", text: "Esta plataforma cambió mi vida. ¡La mejor experiencia musical!" },
  { name: "Lucía", text: "Increíble comunidad y una forma genial de descubrir artistas." },
  { name: "Roberto", text: "Un lugar donde la música cobra vida. Muy recomendado." },
];

const Testimonials = () => {
  return (
    <Box
      sx={{
        py: 5,
        px: 3,
        bgcolor: "grey.100",
      }}
    >
      <Typography variant="h4" gutterBottom textAlign="center">
        Lo que dicen nuestros usuarios
      </Typography>
      <Grid container spacing={3}>
        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper sx={{ p: 3, textAlign: "center" }} elevation={3}>
              <Typography variant="body1" gutterBottom>
                "{testimonial.text}"
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                - {testimonial.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Testimonials;


