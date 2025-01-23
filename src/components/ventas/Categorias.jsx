// Componentes/Categorias.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, List, ListItem, ListItemText, CircularProgress, Typography } from '@mui/material';

const Categorias = ({ onCategoriaSeleccionada }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get('/api/categorias/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCategorias(response.data);
      } catch (err) {
        setError('Error al cargar las categorías.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Categorías
      </Typography>
      <List>
        {categorias.map((categoria) => (
          <ListItem 
            button 
            key={categoria.id} 
            onClick={() => onCategoriaSeleccionada(categoria.id)}
          >
            <ListItemText primary={categoria.nombre} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Categorias;
