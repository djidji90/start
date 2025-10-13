import React, { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { useConfig } from '../../../hook/useConfig';
import PublicidadCard from './PublicidadCard';
import ProductosPromocionados from './ProductosPromocionado';
import gitge from '../../../../assets/imagenes/pato.jpg';
import futur from '../../../../assets/imagenes/futur.jpg';
import { styled } from '@mui/material/styles';
import { Share } from '@mui/icons-material';
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
  CreditCard,
  Payments,
  AccountBalance
} from '@mui/icons-material';
import {
  Close,
  AccessTime,
  Payment,
  Lock,

  LocalShipping,
  AssignmentReturn,
  SupportAgent,
  Email,
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  LinkedIn,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import CategoriaCard from './CategoriaCard';
import ProductoCard from './ProductoCard';

// Componentes de mensajes vacíos añadidos
const EmptyResultsMessage = () => (
  <Typography variant="body1" sx={{ textAlign: 'center', width: '100%', p: 3 }}>
    No se encontraron resultados.
  </Typography>
);

const EmptySponsorsMessage = () => (
  <Typography variant="body1" sx={{ textAlign: 'center', width: '100%', p: 3 }}>
    No hay sponsors disponibles en este momento.
  </Typography>
);

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Box role="alert" sx={errorFallbackStyle}>
      <ErrorOutlineIcon sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h4" gutterBottom>¡Ups! Algo salió mal</Typography>
      <Typography variant="body1" paragraph>Lo sentimos, ha ocurrido un error inesperado.</Typography>
      
      <Button variant="contained" color="error" onClick={resetErrorBoundary} startIcon={<RefreshIcon />}>
        Reintentar
      </Button>

      {error && (
        <Box width="100%">
          <Typography variant="body2" component="div" onClick={() => setShowDetails(!showDetails)}>
            <IconButton size="small">{showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
            {showDetails ? "Ocultar detalles" : "Ver detalles del error"}
          </Typography>
          
          <Collapse in={showDetails}>
            <Box sx={errorDetailsStyle}>
              <Typography variant="caption">{error.message}</Typography>
              {error.stack && <pre style={{ margin: 0 }}>{error.stack}</pre>}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  resetErrorBoundary = () => this.setState({ error: null });

  render() {
    return this.state.error ? (
      <ErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
    ) : this.props.children;
  }
}

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({ baseURL });
  
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
  
  return instance;
};

const Tienda = () => {
  
  const { api, contact, social } = useConfig();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [state, setState] = useState({
    busqueda: '',
    searchResults: { productos: [], categorias: [] },
    suggestions: [],
    loadingSuggestions: false,
    showContact: false,
    sponsors: [],
    productosPromocionados: [],
    loading: true,
    loadingProductos: true,
    error: '',
    errorProductos: '',
    imageErrors: {}
  });

  const axiosInstance = useMemo(() => createAxiosInstance(`${api.baseURL}/ventas`), [api.baseURL]);

  const handleImageError = useCallback((productId) => {
    setState(prev => ({
      ...prev,
      imageErrors: { ...prev.imageErrors, [productId]: true }
    }));
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '', errorProductos: '' }));

      const [sponsorsRes, productosRes] = await Promise.all([
        axiosInstance.get(`/patrocinadores/?tienda=${api.tiendaNumber}`),
        axiosInstance.get(`/variantes/?tienda=${api.tiendaNumber}`)
      ]);

      const productosTransformados = productosRes.data.results.map(item => ({
        id: item.id,
        imagen: item.imagen?.replace('/media/', '/ventas/media/') || gitge,
        nombre: item.nombre,
        precio: parseFloat(item.valor.replace('.', '')),
        stock: item.stock || 0,
        descripcion: item.descripcion || 'todo sweet',
        categoria: item.categoria || 'Sin categoría',
        prioridad: item.prioridad,
        enlace: `/producto/${item.id}`
      }));

      setState(prev => ({
        ...prev,
        sponsors: sponsorsRes.data.results.map(sponsor => ({
          id: sponsor.id,
          imagen: sponsor.logo || futur,
          titulo: sponsor.nombre,
          enlace: sponsor.enlace,
          prioridad : sponsor.prioridad,
        })),
        productosPromocionados: productosTransformados
      }));
      
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.message || err.message;
      
      setState(prev => ({
        ...prev,
        [err.config.url.includes('/patrocinadores/') ? 'error' : 'errorProductos']: 
          `Error cargando ${err.config.url.includes('/patrocinadores/') ? 'sponsors' : 'productos'}: ${errorMessage}`
      }));
      
    } finally {
      setState(prev => ({ ...prev, loading: false, loadingProductos: false }));
    }
  }, [api.tiendaNumber, axiosInstance]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleBusqueda = useCallback(
    debounce(async query => {
      if (!query.trim()) return setState(prev => ({ ...prev, searchResults: { productos: [], categorias: [] }}));
      
      try {
        const { data } = await axiosInstance.get('/api/busqueda/', { 
          params: { query, tienda: api.tiendaNumber }
        });
        setState(prev => ({ ...prev, searchResults: data, error: '' }));
      } catch (error) {
        console.error('Búsqueda fallida:', error);
        setState(prev => ({ ...prev, error: 'Error al realizar la búsqueda. Intente nuevamente.' }));
      }
    }, 300),
    [api.tiendaNumber, axiosInstance]
  );

  const ContactModal = useMemo(() => () => {
    const { contact, social } = useConfig();
    const theme = useTheme();
  
    return (
      <Modal 
        open={state.showContact} 
        onClose={() => setState(prev => ({ ...prev, showContact: false }))}
      >
        <Box sx={modalStyle}>
          <IconButton 
            onClick={() => setState(prev => ({ ...prev, showContact: false }))}
            sx={closeButtonStyle}
          >
            <Close />
          </IconButton>
          
          <Grid container spacing={0}>
            <Grid item xs={12} sx={mainContentStyle}>
              <Typography variant="h3" gutterBottom sx={mainTitleStyle}>
                Nuestra Tienda Online
              </Typography>
              
              <Grid container spacing={4} sx={{ mt: 2 }}>
                {/* Sección de Contacto */}
                <Grid item xs={12} md={4}>
                  <Box sx={infoCardStyle}>
                    <Typography variant="h5" sx={sectionTitleStyle}>
                      <LocationOn sx={sectionIconStyle} />
                      Información de Contacto
                    </Typography>
                    <Box sx={infoContentStyle}>
                      <Typography variant="body1" sx={infoTextStyle}>
                        {contact.ADDRESS}
                      </Typography>
                      <Button 
                        href={`mailto:${contact.EMAIL}`} 
                        sx={contactLinkStyle}
                        startIcon={<Email />}
                      >
                        {contact.EMAIL}
                      </Button>
                      <Button 
                        href={`tel:${contact.PHONE}`} 
                        sx={contactLinkStyle}
                        startIcon={<Phone />}
                      >
                        {contact.PHONE}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
  
                {/* Sección de Horarios */}
                <Grid item xs={12} md={4}>
                  <Box sx={infoCardStyle}>
                    <Typography variant="h5" sx={sectionTitleStyle}>
                      <AccessTime sx={sectionIconStyle} />
                      Horario Comercial
                    </Typography>
                    <Box sx={infoContentStyle}>
                      <Typography variant="body2" sx={scheduleItemStyle}>
                        habierto todos los dias del año 24/7
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
  
                {/* Sección de Métodos de Pago */}
                {/* Sección de Métodos de Pago */}
<Grid item xs={12} md={4}>
  <Box sx={infoCardStyle}>
    <Typography variant="h5" sx={sectionTitleStyle}>
      <Payment sx={sectionIconStyle} />
      Medios de Pago
    </Typography>
    <Box sx={paymentMethodsStyle}>
      <CreditCard sx={paymentIconStyle} />
      <CreditCard sx={paymentIconStyle} />
      <Payments sx={paymentIconStyle} />
      <AccountBalance sx={paymentIconStyle} />
    </Box>
    <Typography variant="body2" sx={securityTextStyle}>
      <Lock sx={{ fontSize: 16, mr: 1 }} />
      Transacciones 100% seguras
    </Typography>
  </Box>
</Grid>
              </Grid>
  
              {/* Redes Sociales */}
              <Box sx={socialSectionStyle}>
                <Typography variant="h6" sx={socialTitleStyle}>
                  Síguenos en Redes Sociales
                </Typography>
                <Box sx={socialButtonsContainer}>
                  {social.facebook && (
                    <IconButton 
                      href={social.facebook} 
                      target="_blank"
                      sx={socialButtonStyle}
                    >
                      <Facebook fontSize="large" />
                    </IconButton>
                  )}
                  {social.instagram && (
                    <IconButton 
                      href={social.instagram} 
                      target="_blank"
                      sx={socialButtonStyle}
                    >
                      <Instagram fontSize="large" />
                    </IconButton>
                  )}
                  {social.tiktok && (
                    <IconButton 
                      href={social.tiktok} 
                      target="_blank"
                      sx={socialButtonStyle}
                    >
                      <svg /* Icono de TikTok personalizado */ />
                    </IconButton>
                  )}
                </Box>
              </Box>
  
              {/* Garantías */}
              <Box sx={guaranteesStyle}>
                <Box sx={guaranteeItemStyle}>
                  <LocalShipping sx={guaranteeIconStyle} />
                  <Typography variant="body2" sx={guaranteeTextStyle}>
                    Envíos rápidos en 24/48h
                  </Typography>
                </Box>
                <Box sx={guaranteeItemStyle}>
                  <AssignmentReturn sx={guaranteeIconStyle} />
                  <Typography variant="body2" sx={guaranteeTextStyle}>
                    Devoluciones gratuitas
                  </Typography>
                </Box>
                <Box sx={guaranteeItemStyle}>
                  <SupportAgent sx={guaranteeIconStyle} />
                  <Typography variant="body2" sx={guaranteeTextStyle}>
                    Soporte 24/7
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    );
  }, [state.showContact, contact, social]);
// Estilos generales
const errorFallbackStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  textAlign: "center",
  p: 4,
  backgroundColor: "error.light",
  color: "error.dark"
};

const errorDetailsStyle = {
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
};

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

const titleStyle = {
  mb: 2,
  fontWeight: 700,
  color: 'text.primary',
  fontSize: { xs: '2rem', md: '2.75rem' }
};

// Estilos específicos del ContactModal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: 900 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '16px',
  overflow: 'hidden',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const mainContentStyle = {
  p: 4,
  background: 'linear-gradient(45deg, #f8f9fa 0%, #ffffff 100%)'
};

const mainTitleStyle = {
  fontWeight: 700,
  color: 'primary.main',
  textAlign: 'center',
  mb: 4,
  fontSize: '2.2rem'
};

const infoCardStyle = {
  bgcolor: 'common.white',
  borderRadius: 2,
  p: 3,
  height: '100%',
  boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
};

const sectionTitleStyle = {
  fontWeight: 600,
  mb: 2,
  display: 'flex',
  alignItems: 'center',
  color: 'text.primary'
};

const sectionIconStyle = {
  fontSize: 28,
  mr: 1.5,
  color: 'primary.main'
};

const infoContentStyle = {
  mt: 2,
  '& > *:not(:last-child)': { mb: 1.5 }
};

const contactLinkStyle = {
  justifyContent: 'flex-start',
  width: '100%',
  textAlign: 'left',
  color: 'text.secondary',
  textTransform: 'none',
  px: 0,
  transition: 'color 0.3s ease',
  '&:hover': {
    color: 'primary.main',
    backgroundColor: 'transparent'
  },
  '& .MuiButton-startIcon': {
    marginRight: 1.5
  }
};

const infoTextStyle = {
  color: 'text.secondary',
  lineHeight: 1.6,
  mb: 2
};

const scheduleItemStyle = {
  color: 'text.secondary',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 1
};

const paymentMethodsStyle = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: 2,
  mt: 3
};

const paymentIconStyle = {
  fontSize: 40,
  color: 'text.secondary',
  mx: 1,
  '&:hover': {
    color: 'primary.main'
  }
};

const securityTextStyle = {
  mt: 2,
  color: 'success.main',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.9rem'
};

const socialSectionStyle = {
  mt: 6,
  textAlign: 'center',
  borderTop: '1px solid #e0e0e0',
  pt: 4
};

const socialTitleStyle = {
  fontWeight: 600,
  color: 'text.primary',
  mb: 2,
  fontSize: '1.25rem',
  textTransform: 'uppercase',
  letterSpacing: 1
};

const socialButtonsContainer = {
  display: 'flex',
  justifyContent: 'center',
  gap: 2,
  mt: 3,
  flexWrap: 'wrap'
};

const socialButtonStyle = {
  color: 'text.primary',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: 'primary.main',
    transform: 'translateY(-3px)'
  }
};

const guaranteesStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  mt: 4,
  flexWrap: 'wrap',
  gap: 3
};

const guaranteeItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  px: 2,
  py: 1.5,
  borderRadius: 1,
  bgcolor: 'primary.light',
  color: 'primary.contrastText'
};

const guaranteeIconStyle = {
  fontSize: 32
};

const guaranteeTextStyle = {
  fontWeight: 500,
  fontSize: '0.95rem'
};

const closeButtonStyle = {
  position: 'absolute',
  right: 16,
  top: 16,
  color: 'text.secondary'
};

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={titleStyle}>
              ¡Descubre nuestros productos!
            </Typography>

            <Autocomplete
              freeSolo
              options={state.suggestions}
              getOptionLabel={option => option.nombre || ''}
              loading={state.loadingSuggestions}
              onInputChange={(_, value) => {
                setState(prev => ({ ...prev, busqueda: value }));
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
                        {state.loadingSuggestions && <CircularProgress size={24} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {state.error && <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert>}
          </Box>

          {!state.busqueda ? (
            <ProductosSection 
              loading={state.loadingProductos}
              error={state.errorProductos}
              productos={state.productosPromocionados}
              onImageError={handleImageError}
              imageErrors={state.imageErrors}
            />
          ) : (
            <SearchResultsSection 
              searchResults={state.searchResults} 
              onImageError={handleImageError}
              imageErrors={state.imageErrors}
            />
          )}
        </Box>

        <SponsorsSection 
          loading={state.loading}
          error={state.error}
          sponsors={state.sponsors}
          theme={theme}
        />

        <ContactModal />
        
        <FloatingButton
          variant="contained"
          color="primary"
          onClick={() => setState(prev => ({ ...prev, showContact: true }))}>
          pongate en contacto con nosotros
        </FloatingButton>
      </Box>
    </ErrorBoundary>
  );
};

const SectionTitle = ({ title, withDivider }) => (
  <Typography variant="h3" sx={{ 
    mb: 6,
fontSize: { xs: '2rem', md: '2.75rem' },
FontFace: 'Poppins',
    fontWeight: 600,
    color: 'text.primary',
    textAlign: 'center',
    position: 'relative',
    '&::after': withDivider ? {
      content: '""',
      display: 'block',
      width: 10,
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

const ErrorAlert = ({ message }) => (
  <Alert severity="error" sx={{ mb: 4, mx: 'auto', maxWidth: 600 }}>
    {message}
  </Alert>
);

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress size={60} />
  </Box>
);

const ProductosSection = React.memo(({ loading, error, productos, onImageError, imageErrors }) => (
  <Box sx={{ my: 8 }}>
    <SectionTitle title="Productos Destacados" />
    {loading ? <LoadingSpinner /> : error ? <ErrorAlert message={error} /> : (
      <ProductosPromocionados 
        productos={productos} 
        onImageError={onImageError} 
        imageErrors={imageErrors} 
      />
    )}
  </Box>
));

const SponsorsSection = React.memo(({ loading, error, sponsors, theme }) => (
  <Box sx={sponsorsContainerStyle(theme)}>
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
      <SectionTitle title="Aliados Estratégicos" withDivider />
      {loading ? <LoadingSpinner /> : error ? <ErrorAlert message={error} /> : (
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

const SearchResultsSection = React.memo(({ searchResults, onImageError, imageErrors }) => (
  <>
    <Section 
      title="Productos" 
      data={searchResults.productos} 
      Component={props => <ProductoCard {...props} onImageError={onImageError} imageError={imageErrors[props.id]} />} 
    />
    <Section 
      title="Categorías" 
      data={searchResults.categorias} 
      Component={CategoriaCard} 
    />
  </>
));

const Section = React.memo(({ title, data, Component }) => (
  <Box sx={{ my: 8 }}>
    <Typography variant="h3" sx={sectionTitleStyle}>{title}</Typography>
    <Grid container spacing={4} justifyContent="center">
      {data.length > 0 ? data.map(item => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
          <Component {...item} />
        </Grid>
      )) : <EmptyResultsMessage />}
    </Grid>
  </Box>
));

// Estilos
const errorFallbackStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  textAlign: "center",
  p: 4,
  backgroundColor: "error.light",
  color: "error.dark"
};

const errorDetailsStyle = {
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
};

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

const titleStyle = {
  mb: 2,
  fontWeight: 700,
  color: 'text.primary',
  fontSize: { xs: '2rem', md: '2.75rem' }
};

const sectionTitleStyle = {
  mb: 6,
  fontWeight: 600,
  color: 'text.primary',
  textAlign: 'center',
  position: 'relative'
};

const contactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 2
};

const iconStyle = {
  fontSize: 28,
  color: 'primary.main'
};

const socialButtonStyle = {
  fontSize: 32,
  color: 'primary.main',
  '&:hover': {
    backgroundColor: 'primary.light'
  }
};

// PropTypes
ErrorFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func.isRequired
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

Tienda.propTypes = {
  api: PropTypes.object,
  contact: PropTypes.object,
  social: PropTypes.object
};

export default Tienda;