import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig'; // Instancia centralizada de Axios
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
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Carrito = ({ onCheckout }) => {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCarrito = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('http://127.0.0.1:8000/ventas/carritos/');
      setCarrito(response.data);
    } catch (err) {
      setError('Error al cargar el carrito. Por favor, intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrito();
  }, []);

  const eliminarProducto = async (itemCarritoId) => {
    try {
      await axiosInstance.post(`http://127.0.0.1:8000/ventas/carritos//${carrito.id}/eliminar_producto/`, {
        item_carrito_id: itemCarritoId,
      });
      setCarrito((prevCarrito) => ({
        ...prevCarrito,
        items: prevCarrito.items.filter((item) => item.id !== itemCarritoId),
      }));
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
    }
  };

  const calcularTotal = () => {
    return carrito?.items.reduce(
      (acc, item) => acc + item.cantidad * item.producto.precio,
      0
    );
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
              secondary={`Cantidad: ${item.cantidad} - Total: $${(
                item.cantidad * item.producto.precio
              ).toFixed(2)}`}
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
        <Typography variant="h6">Total: ${calcularTotal().toFixed(2)}</Typography>
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