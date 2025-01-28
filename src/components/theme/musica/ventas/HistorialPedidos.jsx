// Componentes/HistorialPedidos.jsx

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

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/ventas/pedidos/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setPedidos(response.data);
      } catch (err) {
        setError('Error al cargar el historial de pedidos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

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

  if (pedidos.length === 0) {
    return (
      <Box textAlign="center" py={2}>
        <Typography>No tienes pedidos realizados.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Historial de Pedidos
      </Typography>
      <List>
        {pedidos.map((pedido) => (
          <React.Fragment key={pedido.id}>
            <ListItem>
              <ListItemText
                primary={`Pedido #${pedido.id}`}
                secondary={`Total: $${pedido.total} - Fecha: ${new Date(pedido.fecha_creacion).toLocaleDateString()}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default HistorialPedidos;
