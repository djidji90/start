// Componentes/DetallesProducto.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Button,
} from '@mui/material';

const DetallesProducto = ({ productoId, onBack }) => {
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductoDetalles = async () => {
      try {
        const response = await axios.get(`/api/productos/${productoId}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProducto(response.data);
        if (response.data.variantes.length > 0) {
          setVarianteSeleccionada(response.data.variantes[0].id);
        }
      } catch (err) {
        setError('Error al cargar los detalles del producto.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductoDetalles();
  }, [productoId]);

  const agregarAlCarrito = async () => {
    try {
      const response = await axios.post(
        `/api/carrito/agregar_producto/`,
        {
          producto_id: producto.id,
          cantidad,
          variante_id: varianteSeleccionada,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      alert('Producto agregado al carrito exitosamente.');
    } catch (err) {
      console.error('Error al agregar el producto al carrito:', err);
      alert('No se pudo agregar el producto al carrito.');
    }
  };

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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!producto) {
    return null;
  }

  return (
    <Box>
      <Button variant="outlined" onClick={onBack} sx={{ mb: 2 }}>
        Volver a la Tienda
      </Button>

      <Grid container spacing={3}>
        {/* Imagen del producto */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={producto.imagen || '/placeholder.png'}
              alt={producto.nombre}
            />
          </Card>
        </Grid>

        {/* Detalles del producto */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {producto.nombre}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {producto.descripcion}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${producto.precio}
          </Typography>

          {/* Selección de variante */}
          {producto.variantes.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle1">Variantes:</Typography>
              <TextField
                select
                fullWidth
                value={varianteSeleccionada}
                onChange={(e) => setVarianteSeleccionada(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                {producto.variantes.map((variante) => (
                  <option key={variante.id} value={variante.id}>
                    {variante.nombre} - ${variante.precio}
                  </option>
                ))}
              </TextField>
            </Box>
          )}

          {/* Selección de cantidad */}
          <Box mb={2}>
            <Typography variant="subtitle1">Cantidad:</Typography>
            <TextField
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
            />
          </Box>

          {/* Botón para agregar al carrito */}
          <Button variant="contained" color="primary" onClick={agregarAlCarrito}>
            Agregar al Carrito
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetallesProducto;
