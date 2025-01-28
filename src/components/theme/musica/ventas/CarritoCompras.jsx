// Componentes/CarritoCompras.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CarritoCompras = ({ onPedidoExitoso, onBack }) => {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarrito = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/ventas/carritos/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setCarrito(response.data);
      } catch (err) {
        setError('Error al cargar el carrito de compras.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrito();
  }, []);

  const actualizarCantidad = async (itemId, cantidad) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/ventas/carritos/${itemId}/actualizar/`,
        { cantidad },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }
      );
      setCarrito(response.data);
    } catch (err) {
      console.error('Error al actualizar la cantidad:', err);
      alert('No se pudo actualizar la cantidad.');
    }
  };

  const eliminarProducto = async (itemId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/ventas/carritos/eliminar_producto/`,
        { item_carrito_id: itemId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }
      );
      setCarrito(response.data);
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
      alert('No se pudo eliminar el producto.');
    }
  };

  const procederPedido = async () => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/ventas/pedidos/crear_pedido/',
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }
      );
      alert('Pedido creado exitosamente.');
      onPedidoExitoso();
    } catch (err) {
      console.error('Error al crear el pedido:', err);
      alert('No se pudo crear el pedido.');
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

  if (!carrito || carrito.items.length === 0) {
    return (
      <Box textAlign="center" py={2}>
        <Typography variant="h6">Tu carrito está vacío.</Typography>
        <Button variant="contained" color="primary" onClick={onBack}>
          Volver a la Tienda
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Carrito de Compras
      </Typography>

      <List>
        {carrito.items.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem>
              <ListItemText
                primary={item.producto.nombre}
                secondary={`Cantidad: ${item.cantidad} - Precio: $${item.producto.precio} - Subtotal: $${item.cantidad * item.producto.precio}`}
              />
              <TextField
                type="number"
                value={item.cantidad}
                onChange={(e) => actualizarCantidad(item.id, Number(e.target.value))}
                inputProps={{ min: 1 }}
                style={{ width: '80px', marginRight: '10px' }}
              />
              <IconButton edge="end" onClick={() => eliminarProducto(item.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Box mt={3}>
        <Typography variant="h6">Total: ${carrito.total}</Typography>
        <Button variant="contained" color="primary" onClick={procederPedido} sx={{ mt: 2 }}>
          Proceder con el Pedido
        </Button>
      </Box>

      <Box mt={3}>
        <Button variant="outlined" onClick={onBack}>
          Volver a la Tienda
        </Button>
      </Box>
    </Box>
  );
};

export default CarritoCompras;
