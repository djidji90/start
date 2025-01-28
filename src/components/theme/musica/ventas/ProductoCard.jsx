
import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const ProductoCard = ({ producto }) => {
  return (
    <Card
      sx={{
        maxWidth: 345,
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
        },
        overflow: "hidden",
      }}
    >
      {/* Imagen del producto */}
      {producto.imagen ? (
        <CardMedia
          component="img"
          height="180"
          image={producto.imagen}
          alt={producto.nombre}
          sx={{
            objectFit: "cover",
            filter: "brightness(95%)",
            transition: "filter 0.3s",
            "&:hover": {
              filter: "brightness(105%)",
            },
          }}
        />
      ) : (
        <Box
          sx={{
            height: "180px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Sin imagen
          </Typography>
        </Box>
      )}

      {/* Contenido */}
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            textTransform: "uppercase",
            mb: 1,
            color: "primary.main",
          }}
          gutterBottom
        >
          {producto.nombre}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            height: "40px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {producto.descripcion || "Sin descripción disponible"}
        </Typography>

        <Typography
          variant="h5"
          sx={{ mt: 2, fontWeight: "bold", color: "secondary.main" }}
        >
       ${producto.precio ? Number(producto.precio).toFixed(2) : "0.00"}

        </Typography>

        {/* Botón de agregar al carrito */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCartIcon />}
          sx={{
            mt: 2,
            backgroundColor: "primary.main",
            color: "white",
            fontWeight: "bold",
            textTransform: "uppercase",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
          onClick={() => {
            alert(`Producto agregado: ${producto.nombre}`);
          }}
        >
          Agregar al carrito
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductoCard;