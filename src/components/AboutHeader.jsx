import React from "react";
import { Typography, Box } from "@mui/material";

const AboutHeader = () => {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 5,
        bgcolor: "primary.main",
        color: "white",
      }}
    >
      <Typography variant="h2" fontStyle={"oblique"} fontFamily={"sans-serif"} gutterBottom>
        Sobre Nosotros
      </Typography>
      <Typography variant="body1" fontFamily={"cursive"}>
        Conectamos personas a través de la música. Compartimos arte y pasión en un solo lugar.
      </Typography>
    </Box>
  );
};

export default AboutHeader;

