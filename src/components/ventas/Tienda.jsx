// Componentes/Tienda.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import CategoriaCard from './CategoriaCard';
import ProductoCard from './ProductoCard';

const Tienda = () => {
  const [categorias, setCategorias] = useState([]);
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatosTienda = async () => {
      try {
        const [categoriasRes, productosRes] = await Promise.all([
          axios.get('/api/categorias/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('/api/productos/?destacados=true', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        setCategorias(categoriasRes.data);
        setProductosDestacados(productosRes.data);
      } catch (err) {
        setError('Error al cargar los datos de la tienda.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosTienda();
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido a la Tienda
      </Typography>

      {/* Sección de categorías */}
      <Typography variant="h5" gutterBottom>
        Categorías
      </Typography>
      <Grid container spacing={3}>
        {categorias.map((categoria) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={categoria.id}>
            <CategoriaCard categoria={categoria} />
          </Grid>
        ))}
      </Grid>

      {/* Separador */}
      <Box my={4}>
        <hr />
      </Box>

      {/* Productos destacados */}
      <Typography variant="h5" gutterBottom>
        Productos Destacados
      </Typography>
      <Grid container spacing={3}>
        {productosDestacados.map((producto) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id}>
            <ProductoCard producto={producto} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Tienda;
