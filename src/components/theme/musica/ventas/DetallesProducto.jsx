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
  Snackbar
} from '@mui/material';

const DetallesProducto = ({ productoId, onBack }) => {
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchProductoDetalles = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/ventas/productos/${productoId}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        
        setProducto(response.data);
        if (response.data.variantes?.length > 0) {
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
      const postData = {
        producto_id: producto.id,
        cantidad: Math.max(1, cantidad),  // Forzar mínimo 1
        ...(varianteSeleccionada && { variante_id: varianteSeleccionada })
      };

      await axios.post(
        'http://127.0.0.1:8000/api/carrito/agregar_producto/',  // URL absoluta
        postData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }
      );
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);  // Ocultar después de 3 seg
    } catch (err) {
      console.error('Error al agregar al carrito:', err.response?.data || err);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const precioActual = () => {
    if (!varianteSeleccionada || !producto.variantes) return producto.precio;
    const variante = producto.variantes.find(v => v.id === varianteSeleccionada);
    return variante?.precio || producto.precio;
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

  if (!producto) return null;

  return (
    <Box>
      {/* Notificaciones */}
      <Snackbar open={showSuccess} autoHideDuration={3000}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Producto agregado al carrito!
        </Alert>
      </Snackbar>

      <Snackbar open={showError} autoHideDuration={3000}>
        <Alert severity="error" sx={{ width: '100%' }}>
          Error al agregar al carrito
        </Alert>
      </Snackbar>

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
              image={producto.imagen || 'https://placehold.co/400x300'}  // Imagen por defecto
              alt={producto.nombre}
              sx={{ objectFit: 'contain' }}
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
            ${precioActual().toFixed(2)}  {/* Precio dinámico por variante */}
          </Typography>

          {/* Selección de variante */}
          {producto.variantes?.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle1">Variantes:</Typography>
              <TextField
                select
                fullWidth
                value={varianteSeleccionada}
                onChange={(e) => setVarianteSeleccionada(e.target.value)}
                SelectProps={{ native: true }}
              >
                {producto.variantes.map((variante) => (
                  <option key={variante.id} value={variante.id}>
                    {variante.nombre} - ${variante.precio.toFixed(2)}
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
              onChange={(e) => setCantidad(Math.max(1, e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
            />
          </Box>

          {/* Botón para agregar al carrito */}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={agregarAlCarrito}
            size="large"
            fullWidth
          >
            Agregar al Carrito
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetallesProducto;