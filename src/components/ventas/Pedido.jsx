// Componentes/Checkout.jsx

import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';

const Checkout = ({ onPedidoCreado }) => {
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!direccion.trim()) {
      setError('La dirección es obligatoria.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        '/api/pedidos/crear_pedido/',
        { direccion_envio: direccion },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setSuccess(true);
      onPedidoCreado(response.data);
    } catch (err) {
      setError('Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="400px" mx="auto" mt={4}>
      <Typography variant="h5" gutterBottom>
        Finalizar Pedido
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Pedido creado con éxito! Te notificaremos los detalles del envío.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Dirección de envío"
        variant="outlined"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleCheckout}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Pedido'}
      </Button>
    </Box>
  );
};

export default Checkout;
