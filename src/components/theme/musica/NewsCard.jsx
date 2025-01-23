// Subcomponente: Tarjeta de Noticia
import React from "react";
import { Card, CardContent, CardMedia, Typography, useTheme } from "@mui/material";

const NewsCard = ({ title, description, image }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        boxShadow: 3,
        borderRadius: 2,
        ":hover": {
          boxShadow: 20,
          transform: "scale(1.05)",
        },
        transition: "all 0.3s ease-in-out",
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={image}
        alt={title}
        sx={{
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          objectFit: "cover",
        }}
      />
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
