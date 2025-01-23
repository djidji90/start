// Componentes/Carrito.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Carrito = ({ onCheckout }) => {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarrito = async () => {
      try {
        const response = await axios.get('/api/carrito/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCarrito(response.data);
      } catch (err) {
        setError('Error al cargar el carrito.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrito();
  }, []);

  const eliminarProducto = async (itemCarritoId) => {
    try {
      await axios.post(`/api/carrito/${carrito.id}/eliminar_producto/`, {
        item_carrito_id: itemCarritoId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCarrito((prevCarrito) => ({
        ...prevCarrito,
        items: prevCarrito.items.filter((item) => item.id !== itemCarritoId),
      }));
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <Box textAlign="center" py={2}>
        <Typography>No hay productos en el carrito.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tu Carrito
      </Typography>
      <List>
        {carrito.items.map((item) => (
          <ListItem key={item.id}>
            <ListItemAvatar>
              <Avatar src={item.producto.imagen || 'placeholder.jpg'} alt={item.producto.nombre} />
            </ListItemAvatar>
            <ListItemText
              primary={item.producto.nombre}
              secondary={`Cantidad: ${item.cantidad} - Total: $${item.cantidad * item.producto.precio}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => eliminarProducto(item.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Box textAlign="center" mt={2}>
        <Typography variant="h6">Total: ${carrito.total}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onCheckout}
          style={{ marginTop: '16px' }}
        >
          Proceder al Pago
        </Button>
      </Box>
    </Box>
  );
};

export default Carrito;
