import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Grid, Typography, Skeleton, Alert, TextField, CircularProgress } from '@mui/material';
import CategoriaCard from './CategoriaCard';
import ProductoCard from './ProductoCard';
import Checkout from './Pedido'; // Componente de checkout

// Configuración global de Axios con interceptor
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/ventas/',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const Tienda = () => {
  const [categorias, setCategorias] = useState([]);
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState(null);
  const [errorProductos, setErrorProductos] = useState(null);
  const [busqueda, setBusqueda] = useState(''); // Estado para el término de búsqueda
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoadingCategorias(true);
      setErrorCategorias(null);
      try {
        const { data } = await axiosInstance.get('categorias');
        setCategorias(data.results);
      } catch (err) {
        setErrorCategorias('Error al cargar las categorías.');
        console.error(err);
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  // Cargar productos destacados
  useEffect(() => {
    const fetchProductosDestacados = async () => {
      setLoadingProductos(true);
      setErrorProductos(null);
      try {
        const { data } = await axiosInstance.get('', { params: { destacados: true } });
        setProductosDestacados(data);
      } catch (err) {
        setErrorProductos('Error al cargar los productos destacados.');
        console.error(err);
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchProductosDestacados();
  }, []);

  // Buscar productos por nombre o categoría
  const handleBusqueda = async (e) => {
    const termino = e.target.value;
    setBusqueda(termino);

    if (termino.trim() === '') {
      setProductosFiltrados([]);
      return;
    }

    setLoadingBusqueda(true);
    try {
      const { data } = await axiosInstance.get('productos', { params: { search: termino } });
      setProductosFiltrados(data.results);
    } catch (err) {
      console.error('Error al buscar productos:', err);
    } finally {
      setLoadingBusqueda(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido a la Tienda
      </Typography>

      {/* Barra de búsqueda */}
      <Box my={4}>
        <TextField
          label="Buscar productos o categorías"
          variant="outlined"
          fullWidth
          value={busqueda}
          onChange={handleBusqueda}
          placeholder="Escribe el nombre del producto o categoría"
        />
      </Box>

      {loadingBusqueda && <CircularProgress />}

      {/* Resultados de búsqueda */}
      {productosFiltrados.length > 0 ? (
        <Box>
          <Typography variant="h5" gutterBottom>
            Resultados de búsqueda
          </Typography>
          <Grid container spacing={3}>
            {productosFiltrados.map((producto) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id}>
                <ProductoCard producto={producto} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        busqueda && (
          <Typography>No se encontraron productos para "{busqueda}".</Typography>
        )
      )}

      <Box my={4}>
        <hr />
      </Box>

      {/* Categorías */}
      <Typography variant="h5" gutterBottom>
        productos
      </Typography>
      {loadingCategorias ? (
        <Grid container spacing={3} aria-busy="true">
          {Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : errorCategorias ? (
        <Alert severity="error" role="alert">{errorCategorias}</Alert>
      ) : categorias.length > 0 ? (
        <Grid container spacing={3} aria-live="polite">
          {categorias.map((categoria) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={categoria.id}>
              <CategoriaCard categoria={categoria} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No hay categorías disponibles.</Typography>
      )}

      <Box my={4}>
        <hr />
      </Box>

      {/* Productos destacados */}
      <Typography variant="h5" gutterBottom>
        Productos Destacados
      </Typography>
      {loadingProductos ? (
        <Grid container spacing={3} aria-busy="true">
          {Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : errorProductos ? (
        <Alert severity="error" role="alert">{errorProductos}</Alert>
      ) : productosDestacados.length > 0 ? (
        <Grid container spacing={3} aria-live="polite">
          {productosDestacados.map((producto) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id}>
              <ProductoCard producto={producto} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No hay productos destacados en este momento.</Typography>
      )}

      <Box my={4}>
        <hr />
      </Box>

      {/* Checkout */}
      <Typography variant="h5" gutterBottom>
        Finalizar Pedido
      </Typography>
      <Checkout />
    </Box>
  );
};

export default Tienda;
