import React, { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import PublicidadCard from './PublicidadCard';
import ProductosPromocionados from './ProductosPromocionado';
import gitge from '../../../../assets/imagenes/pato.jpg';
import { styled } from '@mui/material/styles';
import { 
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Modal,
  IconButton,
  Autocomplete,
  CircularProgress,
  useTheme,
  Alert,
  Collapse
} from '@mui/material';
import {
  Close,
  Email,
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  LinkedIn,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import CategoriaCard from './CategoriaCard';
import ProductoCard from './ProductoCard';

// Componente ErrorFallback mejorado
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Box role="alert" sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      textAlign: "center",
      p: 4,
      backgroundColor: "error.light",
      color: "error.dark"
    }}>
      <ErrorOutlineIcon sx={{ fontSize: 60, mb: 2 }} aria-hidden="true" />
      
      <Typography variant="h4" gutterBottom>
        ¡Ups! Algo salió mal
      </Typography>
      
      <Typography variant="body1" paragraph>
        Lo sentimos, ha ocurrido un error inesperado. Por favor intente:
      </Typography>

      <Button
        variant="contained"
        color="error"
        onClick={resetErrorBoundary}
        startIcon={<RefreshIcon />}
        sx={{ mb: 3 }}
      >
        Reintentar
      </Button>

      {error && (
        <Box width="100%">
          <Typography 
            variant="body2" 
            component="div"
            sx={{ cursor: "pointer" }}
            onClick={() => setShowDetails(!showDetails)}
          >
            <IconButton size="small">
              {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            {showDetails ? "Ocultar detalles" : "Ver detalles del error"}
          </Typography>

          <Collapse in={showDetails}>
            <Box sx={{
              maxWidth: 800,
              width: "90%",
              mt: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: "background.paper",
              color: "text.primary",
              textAlign: "left",
              fontFamily: "monospace",
              overflowX: "auto"
            }}>
              <Typography variant="caption">
                {error.message}
              </Typography>
              {error.stack && (
                <pre style={{ margin: 0 }}>{error.stack}</pre>
              )}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func.isRequired
};

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  resetErrorBoundary = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }
    return this.props.children;
  }
}

// Axios Instance (sin cambios)
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/ventas',
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Resto del componente Tienda (sin cambios en la lógica principal)
const FloatingButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: 32,
  right: 32,
  zIndex: 1000,
  borderRadius: 28,
  padding: theme.spacing(2, 3),
  boxShadow: theme.shadows[6],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[8]
  }
}));

const Tienda = () => {
  const theme = useTheme();
  const [busqueda, setBusqueda] = useState('');
  const [searchResults, setSearchResults] = useState({ productos: [], categorias: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [sponsors, setSponsors] = useState([]);
  const [productosPromocionados, setProductosPromocionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [error, setError] = useState('');
  const [errorProductos, setErrorProductos] = useState('');

  const handleBusqueda = useCallback(
    debounce(async query => {
      if (!query.trim()) return setSearchResults({ productos: [], categorias: [] });
      
      try {
        setError('');
        const { data } = await axiosInstance.get('/api/busqueda/', { params: { query } });
        setSearchResults(data);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setError('Error al realizar la búsqueda. Intente nuevamente.');
      }
    }, 300),
    []
  );

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setErrorProductos('');

      const [sponsorsRes, productosRes] = await Promise.all([
        axiosInstance.get('/patrocinadores/'),
        axiosInstance.get('/variantes/')
      ]);

      const sponsorsData = sponsorsRes.data.results || [];
      setSponsors(sponsorsData.map(sponsor => ({
        id: sponsor.id,
        imagen: sponsor.logo || gitge ,
        titulo: sponsor.nombre,
        enlace: sponsor.enlace
      })));

      const productosData = productosRes.data.results || [];
      setProductosPromocionados(productosData.map(item => ({
        id: item.id,
        imagen: item.logo || gitge,
        nombre: item.nombre,
        precio: item.valor,
        prioridad: item.prioridad,
        enlace: `/producto/${item.id}`
      })));
      
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || err.message;
      
      if (err.config.url.includes('/patrocinadores/')) {
        setError('Error cargando sponsors: ' + errorMessage);
      } else {
        setErrorProductos('Error cargando productos: ' + errorMessage);
      }
      
    } finally {
      setLoading(false);
      setLoadingProductos(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const ContactModal = useMemo(() => () => (
    <Modal open={showContact} onClose={() => setShowContact(false)}>
      <Box sx={modalStyle}>
        <IconButton onClick={() => setShowContact(false)} sx={closeButtonStyle}>
          <Close />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
          Contáctanos
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Información de Contacto
            </Typography>
            <ContactItem icon={<Email />} text="info@djidjimusic.com" />
            <ContactItem icon={<Phone />} text="+240 555 380 241" />
            <ContactItem 
              icon={<LocationOn />} 
              text="Barrio Lea, Carretera hacia La Salle frente al muro del campamento, S/N Bata Guinea Ecuatorial" 
            />
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <IconButton href="https://facebook.com" target="_blank">
                <Facebook fontSize="large" />
              </IconButton>
              <IconButton href="https://instagram.com" target="_blank">
                <Instagram fontSize="large" />
              </IconButton>
              <IconButton href="https://linkedin.com" target="_blank">
                <LinkedIn fontSize="large" />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Horario de Atención
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>Disponibilidad 24/7 todos los días de la semana</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  ), [showContact]);

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ 
              mb: 2,
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '2rem', md: '2.75rem' }
            }}>
              Descubre Nuestra Tienda
            </Typography>

            <Autocomplete
              freeSolo
              options={suggestions}
              getOptionLabel={option => option.nombre || ''}
              loading={loadingSuggestions}
              onInputChange={(_, value) => {
                setBusqueda(value);
                handleBusqueda(value);
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Buscar productos o categorías"
                  variant="outlined"
                  sx={{ maxWidth: 800, mx: 'auto' }}
                  InputProps={{
                    ...params.InputProps,
                    sx: { borderRadius: 50 },
                    endAdornment: (
                      <>
                        {loadingSuggestions && <CircularProgress size={24} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>

          {!busqueda ? (
            <ProductosSection 
              loading={loadingProductos}
              error={errorProductos}
              productos={productosPromocionados}
            />
          ) : (
            <SearchResultsSection searchResults={searchResults} />
          )}
        </Box>

        <SponsorsSection 
          loading={loading}
          error={error}
          sponsors={sponsors}
          theme={theme}
        />

        {ContactModal}
        
        <FloatingButton
          variant="contained"
          color="primary"
          onClick={() => setShowContact(true)}
          startIcon={<Email sx={{ fontSize: 28 }} />}
        >
          Contáctanos
        </FloatingButton>
      </Box>
    </ErrorBoundary>
  );
};

// Resto de componentes secundarios y estilos (sin cambios)
const ProductosSection = React.memo(({ loading, error, productos }) => (
  <Box sx={{ my: 8 }}>
    <SectionTitle title="Productos Destacados" />
    
    {loading ? (
      <LoadingSpinner />
    ) : error ? (
      <ErrorAlert message={error} />
    ) : (
      <ProductosPromocionados productos={productos} />
    )}
  </Box>
));

const SponsorsSection = React.memo(({ loading, error, sponsors, theme }) => (
  <Box sx={sponsorsContainerStyle(theme)}>
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
      <SectionTitle title="Aliados Estratégicos" withDivider />
      
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center">
          {sponsors.map(sponsor => (
            <Grid item key={sponsor.id} xs={12} sm={6} md={4} lg={3}>
              <PublicidadCard {...sponsor} />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && sponsors.length === 0 && <EmptySponsorsMessage />}
    </Box>
  </Box>
));

const SearchResultsSection = React.memo(({ searchResults }) => (
  <>
    <Section title="Productos" data={searchResults.productos} Component={ProductoCard} />
    <Section title="Categorías" data={searchResults.categorias} Component={CategoriaCard} />
  </>
));

const Section = React.memo(({ title, data, Component }) => (
  <Box sx={{ my: 8 }}>
    <Typography variant="h3" sx={{ 
      mb: 6,
      fontWeight: 600,
      color: 'text.primary',
      textAlign: 'center'
    }}>
      {title}
    </Typography>
    <Grid container spacing={4} justifyContent="center">
      {data.length > 0 ? (
        data.map(item => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Component {...item} />
          </Grid>
        ))
      ) : (
        <EmptyResultsMessage />
      )}
    </Grid>
  </Box>
));

const ContactItem = React.memo(({ icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>
    <Typography variant="body1">{text}</Typography>
  </Box>
));

// Estilos y constantes (sin cambios)
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: 800 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
  outline: 'none'
};

const closeButtonStyle = {
  position: 'absolute',
  right: 16,
  top: 16,
  color: 'text.secondary'
};

const sponsorsContainerStyle = theme => ({
  p: { xs: 2, md: 4 },
  minHeight: '100vh',
  background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
  }
});

const SectionTitle = ({ title, withDivider }) => (
  <Typography variant="h3" sx={{ 
    mb: 6,
    fontWeight: 600,
    color: 'text.primary',
    textAlign: 'center',
    position: 'relative',
    '&::after': withDivider ? {
      content: '""',
      display: 'block',
      width: 100,
      height: 4,
      bgcolor: 'primary.main',
      mx: 'auto',
      mt: 3,
      borderRadius: 2
    } : null
  }}>
    {title}
  </Typography>
);

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress size={60} />
  </Box>
);

const ErrorAlert = ({ message }) => (
  <Alert severity="error" sx={{ mb: 4, mx: 'auto', maxWidth: 600 }}>
    {message}
  </Alert>
);

const EmptySponsorsMessage = () => (
  <Box sx={{ 
    textAlign: 'center', 
    py: 8,
    border: '2px dashed',
    borderColor: 'divider',
    borderRadius: 4,
    mt: 4
  }}>
    <Typography variant="h6" color="text.secondary">
      Próximamente nuevos aliados estratégicos
    </Typography>
  </Box>
);

const EmptyResultsMessage = () => (
  <Typography variant="body1" sx={{ 
    textAlign: 'center',
    color: 'text.secondary',
    fontStyle: 'italic',
    mt: 4
  }}>
    No se encontraron resultados
  </Typography>
);

export default Tienda;