import { useConfig } from '../../../hook/useConfig';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import ProductCard from './ProductoCard';
import axios from 'axios';

const CategoriaProductos = () => {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extraer la base URL de la API desde el hook useConfig
  const { api } = useConfig();

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("accessToken");
        const headers = token
          ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
          : {};

        // Usar la baseURL desde la configuración
        const response = await axios.get(
          `${api.baseURL}/ventas/productos/por_categoria?categoria_id=${id}`,
          { headers }
        );

        setProductos(response.data);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            setError("No tienes permisos para ver estos productos. Inicia sesión nuevamente.");
          } else {
            setError("Error al cargar los productos. Inténtalo de nuevo.");
          }
        } else {
          setError("Error de conexión con el servidor.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [id, api.baseURL]); // Dependemos de la api.baseURL para evitar cambios inesperados

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Productos de la Categoría {id}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : productos.length > 0 ? (
        <Grid container spacing={3}>
          {productos.map((producto) => (
            <Grid item xs={12} sm={6} md={4} key={producto.id}>
              <ProductCard {...producto} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No hay productos en esta categoría.</Typography>
      )}
    </Box>
  );
};

export default CategoriaProductos;
