import React from "react";
import { Typography, Box } from "@mui/material";

const OurMission = () => {
  return (
    <Box
      sx={{
        py: 1,
        px: 1,
        bgcolor: "yellowgreen",
        color: "Menu",
      }}
    >
      <Typography variant="h4" fontStyle={"revert-layer"} fontFamily={"cursive"} gutterBottom>
        Nuestra Misión
      </Typography>
      <Typography variant="body1" fontFamily={"cursive"}>
        Inspirar a las personas a descubrir, compartir y disfrutar de la música sin fronteras.
      </Typography>
    </Box>
  );
};

export default OurMission;
