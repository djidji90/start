import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';

/**
 * Para mantener la coherencia en las peticiones, se crea (o importa)
 * una instancia de Axios con la configuración necesaria.
 */
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/ventas',
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post('/auth/refresh/', {
          refresh: localStorage.getItem('refreshToken'),
        });
        localStorage.setItem('accessToken', data.access);
        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Componente Checkout:
 * - Muestra los ítems del carrito.
 * - Permite ingresar datos de envío.
 * - Envía el pedido al backend y notifica al componente padre mediante onSuccess.
 */
const Checkout = ({ onSuccess }) => {
  // Estados para el carrito y sus estados de carga/error.
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState(null);

  // Estados para el formulario de envío.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Estados para el envío del pedido.
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Cargar los ítems del carrito al montar el componente.
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoadingCart(true);
        const { data } = await axiosInstance.get('/carritos/mi-carrito/');
        // Se asume que la respuesta contiene un array en data.items.
        setCartItems(data.items || []);
        setCartError(null);
      } catch (error) {
        setCartError(error.response?.data?.detail || 'Error al cargar el carrito');
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, []);

  // Función para calcular el total del pedido.
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Se asume que cada ítem tiene 'precio' y opcionalmente 'cantidad' (por defecto 1).
      const itemTotal = Number(item.precio) * (item.cantidad || 1);
      return total + itemTotal;
    }, 0);
  };

  // Función para enviar el pedido.
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    setOrderError(null);

    const orderData = {
      customer: {
        name,
        email,
        address,
        phone,
      },
      items: cartItems.map(item => ({
        id: item.id,
        cantidad: item.cantidad || 1,
      })),
      total: calculateTotal(),
    };

    try {
      // Se envía el pedido al endpoint '/pedidos/'.
      await axiosInstance.post('/pedidos/', orderData);
      setOrderSuccess(true);
      // Se notifica al componente padre para actualizar el carrito.
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setOrderError(error.response?.data?.detail || 'Error al realizar el pedido');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Muestra un spinner mientras se carga el carrito.
  if (loadingCart) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // En caso de error al cargar el carrito.
  if (cartError) {
    return <Alert severity="error">{cartError}</Alert>;
  }

  // Muestra un mensaje de éxito tras confirmar el pedido.
  if (orderSuccess) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="success">¡Pedido realizado exitosamente!</Alert>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handlePlaceOrder} sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Revisa tu Pedido
      </Typography>

      {/* Listado de ítems del carrito */}
      <List>
        {cartItems.map((item) => (
          <Box key={item.id}>
            <ListItem>
              <ListItemText
                primary={item.nombre}
                secondary={`Cantidad: ${item.cantidad || 1} - Precio: ${Number(item.precio).toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                })}`}
              />
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">
          Total: {calculateTotal().toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </Typography>
      </Box>

      {/* Formulario de datos del cliente */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Información de Envío
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nombre Completo"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Correo Electrónico"
              variant="outlined"
              fullWidth
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Dirección de Envío"
              variant="outlined"
              fullWidth
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Teléfono"
              variant="outlined"
              fullWidth
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {orderError && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{orderError}</Alert>
        </Box>
      )}

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={placingOrder}
        >
          {placingOrder ? <CircularProgress size={24} /> : 'Confirmar Pedido'}
        </Button>
      </Box>
    </Box>
  );
};

Checkout.propTypes = {
  onSuccess: PropTypes.func,
};

export default Checkout;
