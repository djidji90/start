import React, { useEffect, useState, useMemo } from 'react';
import { Box, List, ListItem, ListItemText, CircularProgress, Typography, Alert } from '@mui/material';
import axiosInstance from './axiosInstance'; // Asegúrate de que está bien configurado

const Listado = ({ endpoint, titulo, onElementoSeleccionado, claveNombre }) => {
  const [elementos, setElementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElementos = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axiosInstance.get(endpoint);
        setElementos(data.results || data); // Maneja la estructura de la respuesta según tu API
      } catch (err) {
        handleFetchError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchElementos();
  }, [endpoint]);

  const handleFetchError = (err) => {
    if (err.response) {
      switch (err.response.status) {
        case 401:
          setError('No tienes permisos para acceder a estos datos. Por favor, inicia sesión.');
          break;
        case 404:
          setError('Datos no encontrados.');
          break;
        case 500:
          setError('Error interno del servidor. Intenta más tarde.');
          break;
        default:
          setError('Error desconocido al cargar los datos.');
      }
    } else if (err.request) {
      setError('Error al intentar conectar con el servidor.');
    } else {
      setError('Ocurrió un error inesperado.');
    }
    console.error(err);
  };

  const elementosMemo = useMemo(() => elementos, [elementos]);

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
      <Typography variant="h6" gutterBottom>
        {titulo}
      </Typography>
      <List>
        {elementosMemo.map((elemento) => (
          <ListItem
            button
            key={elemento.id}
            onClick={() => onElementoSeleccionado(elemento.id)}
            aria-label={`Seleccionar ${elemento[claveNombre]}`} // Mejora de accesibilidad
          >
            <ListItemText primary={elemento[claveNombre]} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Listado;
  

