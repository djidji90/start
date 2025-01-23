// Componentes/Productos.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@mui/material';

const Productos = ({ categoriaId }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/productos/por_categoria/', {
          params: { categoria_id: categoriaId },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProductos(response.data);
      } catch (err) {
        setError('Error al cargar los productos.');
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
          <Card>
            <CardMedia
              component="img"
              height="140"
              image={producto.imagen || 'placeholder.jpg'}
              alt={producto.nombre}
            />
            <CardContent>
              <Typography gutterBottom variant="h6">
                {producto.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {producto.descripcion}
              </Typography>
              <Typography variant="h6" color="primary">
                ${producto.precio}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Agregar al carrito
              </Button>
              <Button size="small" color="secondary">
                Ver detalles
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Productos;
    