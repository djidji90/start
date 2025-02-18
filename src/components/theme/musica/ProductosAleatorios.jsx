import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Modal,
  Fade,
  useTheme,
  CircularProgress,
  Alert,
  Rating,
  Skeleton
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  Share,
  ShoppingCart,
  Visibility
} from '@mui/icons-material';
import { styled } from '@mui/system';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/ventas',
});

const ProductosAleatorios = ({ onProductoClick }) => {
  const theme = useTheme();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const { data } = await axiosInstance.get('/api/productos/aleatorios/', {
          params: { limit: 8 }
        });
        setProductos(data);
      } catch (err) {
        setError('Error al cargar los productos. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProducts();
  }, []);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  const toggleLike = (productId) => {
    const newLiked = new Set(likedProducts);
    newLiked.has(productId) ? newLiked.delete(productId) : newLiked.add(productId);
    setLikedProducts(newLiked);
  };

  const handleShare = async (product) => {
    if (!navigator.share) {
      alert('La funcionalidad de compartir no está disponible en este navegador.');
      return;
    }
    try {
      await navigator.share({
        title: product.nombre,
        text: `Mira este producto: ${product.descripcion}`,
        url: window.location.href,
      });
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };
  

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Typography variant="h2" sx={{
        textAlign: 'center',
        mb: 6,
        fontWeight: 700,
        color: 'text.primary',
        [theme.breakpoints.down('md')]: { fontSize: '2.5rem' }
      }}>
        Descubre Nuestros Productos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ px: 4, maxWidth: 1600, mx: 'auto' }}>
        {loading ? (
          Array.from(new Array(8)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <ProductoSkeleton />
            </Grid>
          ))
        ) : (
          productos.map((producto) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id}>
              <ProductCard
  product={producto}
  onQuickView={handleQuickView}
  onLike={toggleLike}
  onShare={handleShare}
  isLiked={likedProducts.has(producto.id)}
/>

            </Grid>
          ))
        )}
      </Grid>

      <CardMedia
  component="img"
  image={product?.imagen || '/placeholder-product.jpg'}
  alt={product?.nombre || 'Producto'}
/>

    </Box>
  );
};

const ProductCard = ({ product, onQuickView, onLike, onShare, isLiked }) => {
  const theme = useTheme();

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[6]
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="240"
          image={product.imagen || '/placeholder-product.jpg'}
          alt={product.nombre}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 1
        }}>
          <IconButton onClick={() => onLike(product.id)} sx={{ color: isLiked ? 'error.main' : 'common.white' }}>
            {isLiked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <IconButton onClick={() => onShare(product)} sx={{ color: 'common.white' }}>
            <Share />
          </IconButton>
        </Box>
        {product.descuento > 0 && (
          <Chip
            label={`-${product.descuento}%`}
            color="error"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              fontWeight: 700
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.nombre}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={product.valoracion} precision={0.5} readOnly />
          <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
            ({product.reseñas})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <Typography variant="h6" color="primary">
            ${product.precio.toFixed(2)}
          </Typography>
          {product.descuento > 0 && (
            <Typography variant="body2" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
              ${product.precio_original.toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => onQuickView(product)}
        >
          Vista Rápida
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<ShoppingCart />}
        >
          Comprar
        </Button>
      </CardActions>
    </Card>
  );
};

const ProductModal = ({ product, open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          {product && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <CardMedia
                  component="img"
                  image={product.imagen}
                  alt={product.nombre}
                  sx={{ borderRadius: 2, height: 400, objectFit: 'cover' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" gutterBottom>
                  {product.nombre}
                </Typography>
                <Typography variant="body1" paragraph>
                  {product.descripcion}
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={`Disponibles: ${product.stock}`}
                    color={product.stock > 0 ? 'success' : 'error'}
                    sx={{ mr: 2 }}
                  />
                  <Chip
                    label={`Categoría: ${product.categoria}`}
                    color="info"
                  />
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Añadir al Carrito - ${product.precio.toFixed(2)}
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

const ProductoSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={240} />
    <CardContent>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Skeleton variant="rectangular" width={100} height={32} />
        <Skeleton variant="rectangular" width={100} height={32} />
      </Box>
    </CardContent>
    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
      <Skeleton variant="rectangular" width={120} height={36} />
      <Skeleton variant="rectangular" width={100} height={36} />
    </CardActions>
  </Card>
);

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 800 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
  outline: 'none'
};

export default ProductosAleatorios;
