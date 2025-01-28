import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";

const CategoriaCard = ({ categoria }) => {
  return (
    <Card
      sx={{
        borderRadius: "20px",
        boxShadow: "0 6px 25px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.3s, box-shadow 0.3s",
        overflow: "hidden",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      {/* Imagen de la categoría */}
      <Box
        sx={{
          height: "180px",
          backgroundImage: categoria.imagen
            ? `url(${categoria.imagen})`
            : "linear-gradient(45deg, #6D83F2, #9A93F6)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {!categoria.imagen && (
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              fontWeight: "bold",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            Sin Imagen
          </Typography>
        )}
      </Box>

      {/* Contenido */}
      <CardContent
        sx={{
          padding: "20px",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          {categoria.nombre}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.6,
          }}
        >
          {categoria.descripcion || "Sin descripción disponible."}
        </Typography>

        {/* Etiqueta opcional */}
        {categoria.destacada && (
          <Chip
            label="Destacada"
            color="primary"
            size="small"
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriaCard;
