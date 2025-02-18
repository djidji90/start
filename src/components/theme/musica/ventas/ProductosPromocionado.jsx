import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  IconButton,
  useTheme,
  Skeleton,
  styled
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ProductosPromocionados = ({ productos }) => {
  const sliderRef = useRef(null);
  const theme = useTheme();
  
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
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <Box sx={{ position: 'relative', py: 8, px: 2 }}>
      <StyledSlider ref={sliderRef} {...settings}>
        {productos?.map((producto) => (
          <Box key={producto.id} sx={{ px: 2 }}>
            <ProductoCard {...producto} />
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

const ProductoCard = React.memo(({ imagen, nombre, precio, enlace }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = useCallback(() => setImgError(true), []);
  const handleImageLoad = useCallback(() => setImgLoaded(true), []);

  const formattedPrice = (precio || 0).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
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
          image={imgError ? '/default-product.png' : (imagen || '/default-product.png')}
          alt={nombre || 'Producto sin nombre'}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
          sx={{
            height: 300,
            objectFit: 'cover',
            display: imgLoaded ? 'block' : 'none',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
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
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            mb: 1
          }}>
          {nombre || 'Producto sin nombre'}
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{
            fontWeight: 800,
            color: 'primary.light',
            mb: 2
          }}>
          {formattedPrice}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          href={enlace || '#'}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<ShoppingCartIcon />}
          disabled={!enlace}
          sx={{
            width: '100%',
            py: 1.5,
            fontWeight: 700,
            borderRadius: '12px',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease',
            boxShadow: 3,
          }}>
          Comprar ahora
        </Button>
      </CardContent>
    </Card>
  );
});

// Componentes de estilo personalizados
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

const NextArrow = styled('div')(() => ({
  display: 'none !important',
}));

const PrevArrow = styled('div')(() => ({
  display: 'none !important',
}));

// Prop Types y Default Props (igual que en tu código original)

export default ProductosPromocionados;