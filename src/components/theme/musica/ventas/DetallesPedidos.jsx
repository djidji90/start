// Componentes/DetallesPedido.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';

const DetallesPedido = ({ pedidoId, onBack }) => {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidoDetalles = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/ventas/pedidos/${pedidoId}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setPedido(response.data);
      } catch (err) {
        setError('Error al cargar los detalles del pedido.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidoDetalles();
  }, [pedidoId]);

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

  if (!pedido) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Detalles del Pedido #{pedido.id}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Fecha: {new Date(pedido.fecha_creacion).toLocaleDateString()}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Total: ${pedido.total}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Productos
      </Typography>

      <List>
        {pedido.items.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem>
              <ListItemText
                primary={item.producto.nombre}
                secondary={`Cantidad: ${item.cantidad} - Precio: $${item.producto.precio}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Box mt={3}>
        <Typography variant="subtitle1">
          Dirección de envío:
        </Typography>
        <Typography>{pedido.direccion_envio}</Typography>
      </Box>

      <Box mt={3}>
        <Button variant="contained" color="primary" onClick={onBack}>
          Volver al Historial
        </Button>
      </Box>
    </Box>
  );
};

export default DetallesPedido;
