import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useConfig } from '../../../hook/useConfig';
import Slider from 'react-slick';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Skeleton,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Zoom,
  CircularProgress
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import DownloadIcon from '@mui/icons-material/Download';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Componentes estilizados
const NextArrow = styled('div')(() => ({
  display: 'none !important',
}));

const PrevArrow = styled('div')(() => ({
  display: 'none !important',
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  '.slick-dots': {
    bottom: '-40px !important',
    'li button:before': {
      fontSize: '12px',
      color: theme.palette.text.secondary,
    },
    'li.slick-active button:before': {
      color: theme.palette.primary.main,
    }
  },
}));

const CustomArrows = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',

  button: {
    pointerEvents: 'all',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[4],
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.15)',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    }
  }
}));

const ProductosPromocionados = ({ productos }) => {
  const sliderRef = useRef(null);
  const { api } = useConfig();

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: 'cubic-bezier(0.600, 0.040, 0.340, 0.965)',
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    lazyLoad: 'anticipated',
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ]
  };

  return (
    <Box sx={{ position: 'relative', py: 8, px: 2 }}>
      <StyledSlider ref={sliderRef} {...settings}>
        {productos?.map((producto) => (
          <Box key={producto.id} sx={{ px: 2 }}>
            <ProductoCard {...producto} tiendaNumber={api.tiendaNumber} baseURL={api.baseURL} />
          </Box>
        ))}
      </StyledSlider>

      <CustomArrows>
        <IconButton onClick={() => sliderRef.current.slickPrev()}>
          <NavigateBeforeIcon sx={{ fontSize: 40 }} />
        </IconButton>
        <IconButton onClick={() => sliderRef.current.slickNext()}>
          <NavigateNextIcon sx={{ fontSize: 40 }} />
        </IconButton>
      </CustomArrows>
    </Box>
  );
};

const ProductoCard = React.memo(({ imagen, nombre, precio, descripcion, tiendaNumber, baseURL }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);
  const [fullImageLoaded, setFullImageLoaded] = useState(false);

  useEffect(() => {
    return () => {
      if (clickTimeout) clearTimeout(clickTimeout);
    };
  }, [clickTimeout]);

  const handleImageError = useCallback(() => setImgError(true), []);
  const handleImageLoad = useCallback(() => setImgLoaded(true), []);
  const handleFullImageLoad = useCallback(() => setFullImageLoaded(true), []);

  const getValidImageUrl = () => {
    const trimmedImagen = imagen?.trim();
    const isFullURL = trimmedImagen?.startsWith('http');
    
    try {
      if (imgError || !trimmedImagen) return '/default-product.png';
      const url = isFullURL ? trimmedImagen : `${baseURL}/media/${trimmedImagen}`;
      new URL(url);
      return url;
    } catch {
      return '/default-product.png';
    }
  };

  const imageUrl = getValidImageUrl();

  const descargarImagen = () => {
    if (!imageUrl || imageUrl === '/default-product.png') {
      console.error('No hay imagen para descargar');
      return;
    }
    
    try {
      const fileName = nombre 
        ? `${nombre.replace(/[^a-z0-9]/gi, '_')}.${imageUrl.split('.').pop()?.split(/\#|\?/)[0]}` 
        : 'producto';
      
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar imagen:', error);
    }
  };

  const handleImageClick = (e) => {
    if (e.type === 'touchstart') {
      e.preventDefault();
      descargarImagen();
      return;
    }

    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      setShowFullImage(true);
    } else {
      setClickTimeout(
        setTimeout(() => {
          descargarImagen();
          setClickTimeout(null);
        }, 300)
      );
    }
  };

  const formattedPrice = (precio || 0).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'CFA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <>
      <Card
        sx={{
          maxWidth: 345,
          height: '100%',
          borderRadius: '20px',
          overflow: 'hidden',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isHovered ? 6 : 2,
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 1,
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {!imgLoaded && !imgError && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ bgcolor: 'grey.100' }}
            />
          )}

          <CardMedia
            component="img"
            image={imageUrl}
            alt={nombre || 'Producto sin nombre'}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
            onClick={handleImageClick}
            onTouchStart={handleImageClick}
            onKeyPress={(e) => e.key === 'Enter' && handleImageClick(e)}
            role="button"
            tabIndex={0}
            sx={{
              height: 300,
              objectFit: 'cover',
              display: imgLoaded ? 'block' : 'none',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
              cursor: 'pointer'
            }}
          />
        </Box>

        <CardContent sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          color: 'white',
          zIndex: 2,
          pt: 4,
          pb: 2,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)', mb: 1 }}>
            {nombre || 'Producto sin nombre'}
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.light', mb: 2 }}>
            {formattedPrice}
          </Typography>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setShowDetails(true)}
            startIcon={<InfoIcon />}
            sx={{
              width: '100%',
              mb: 1,
              py: 1,
              fontWeight: 700,
              borderRadius: '12px',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
              boxShadow: 1,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'primary.light',
                color: 'primary.light',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Ver Detalles
          </Button>

          <Button
            variant="contained"
            color="primary"
            href={`tel:${tiendaNumber}`}
            startIcon={<ShoppingCartIcon />}
            disabled={!tiendaNumber}
            sx={{
              width: '100%',
              py: 1.5,
              fontWeight: 700,
              borderRadius: '12px',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
              boxShadow: 3,
            }}
          >
            Llamar a la tienda
          </Button>
        </CardContent>
      </Card>

      {/* Diálogo de detalles */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        TransitionComponent={Zoom}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Detalles de {nombre}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            position: 'relative',
            mb: 3,
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <img
              src={imageUrl}
              alt={nombre || 'Producto sin nombre'}
              style={{ 
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'contain'
              }}
            />
          </Box>
          <DialogContentText component="div">
            {descripcion?.split('\n').map((line, i) => (
              <Typography key={i} paragraph sx={{ mb: 2 }}>
                {line || 'Descripción no disponible'}
              </Typography>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={descargarImagen}
            sx={{ borderRadius: '20px' }}
          >
            Descargar imagen
          </Button>
          <Button 
            onClick={() => setShowDetails(false)}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de imagen completa */}
      <Dialog
        open={showFullImage}
        onClose={() => setShowFullImage(false)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 2, position: 'relative' }}>
          {!fullImageLoaded && (
            <CircularProgress sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }} />
          )}
          <img
            src={imageUrl}
            alt={nombre || 'Producto sin nombre'}
            onLoad={handleFullImageLoad}
            onError={() => setShowFullImage(false)}
            style={{ 
              width: 'auto',
              height: 'auto',
              maxHeight: '80vh',
              maxWidth: '100%',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              visibility: fullImageLoaded ? 'visible' : 'hidden'
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={descargarImagen}
            sx={{ borderRadius: '20px' }}
          >
            Descargar
          </Button>
          <Button 
            onClick={() => setShowFullImage(false)}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

ProductoCard.propTypes = {
  imagen: PropTypes.string,
  nombre: PropTypes.string,
  precio: PropTypes.number.isRequired,
  descripcion: PropTypes.string,
  tiendaNumber: PropTypes.string,
  baseURL: PropTypes.string.isRequired,
};

ProductosPromocionados.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string,
      imagen: PropTypes.string,
      precio: PropTypes.number.isRequired,
      descripcion: PropTypes.string,
      enlace: PropTypes.string,
    })
  ).isRequired
};

export default ProductosPromocionados;