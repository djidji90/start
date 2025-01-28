import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Box,
  Divider,
  Tooltip,
} from "@mui/material";
import { Favorite, ShoppingCart, Visibility } from "@mui/icons-material"; // Iconos para dar un toque moderno

// Función para obtener el encabezado de autorización
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Productos = ({ categoriaId }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/ventas/productos/por_categoria/",
          {
            params: { categoria_id: categoriaId },
            headers: getAuthHeader(),
          }
        );
        setProductos(response.data);
      } catch (err) {
        setError("Error al cargar los productos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      fetchProductos();
    }
  }, [categoriaId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (productos.length === 0) {
    return (
      <Box textAlign="center" py={2}>
        <Typography>No hay productos disponibles en esta categoría.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {productos.map((producto) => (
        <Grid item xs={12} sm={6} md={4} key={producto.id}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, overflow: "visible" }}>
            <CardMedia
              component="img"
              height="250"
              image={producto.imagen || "placeholder.jpg"}
              alt={producto.nombre}
              sx={{
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                objectFit: "cover",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
            <CardContent>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {producto.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                {producto.descripcion.length > 100
                  ? `${producto.descripcion.substring(0, 100)}...`
                  : producto.descripcion}
              </Typography>
              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  ${producto.precio}
                </Typography>
                <Tooltip title="Agregar al carrito" arrow>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 25, padding: "8px 16px" }}
                    startIcon={<ShoppingCart />}
                  >
                    Agregar
                  </Button>
                </Tooltip>
              </Box>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: "space-between", padding: 2 }}>
              <Tooltip title="Ver detalles" arrow>
                <Button
                  size="small"
                  color="secondary"
                  startIcon={<Visibility />}
                  sx={{ borderRadius: 2 }}
                >
                  Detalles
                </Button>
              </Tooltip>
              <Tooltip title="Añadir a favoritos" arrow>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Favorite />}
                  sx={{ borderRadius: 2 }}
                >
                  Like
                </Button>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Productos;



    