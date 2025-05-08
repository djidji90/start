import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  styled,
  IconButton 
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

const PublicidadCard = ({ 
  imagen, 
  titulo = 'Patrocinador', 
  enlace = '#',
  ...props 
}) => {
  const [imgError, setImgError] = useState(false);
  
  // Normalizar URL de imagen
  const normalizedImage = imagen?.includes('/media/') 
    ? imagen.replace('/media/', '/ventas/media/') 
    : imagen;

  return (
    <StyledCard {...props}>
      <Box className="image-container">
        <CardMedia
          component="img"
          image={imgError ? '/default-sponsor.png' : normalizedImage}
          alt={`Logo ${titulo}`}
          className="card-media"
          onError={() => setImgError(true)}
        />
        <Box className="hover-overlay">
          <IconButton 
            href={enlace} 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-button"
            aria-label={`Visitar sitio de ${titulo}`}
          >
            <OpenInNew sx={iconStyle} />
          </IconButton>
        </Box>
      </Box>
      
      <StyledCardContent>
        <Typography variant="h6" className="title-text">
          {titulo}
        </Typography>
        <Box className="gradient-overlay" />
      </StyledCardContent>
    </StyledCard>
  );
};

// Estilos modernizados con glassmorphism y transiciones suaves
const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  height: '100%',
  maxWidth: 380,
  margin: theme.spacing(1),
  borderRadius: '24px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  boxShadow: theme.shadows[6],
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
    
    '.hover-overlay': {
      opacity: 1,
      backdropFilter: 'blur(8px)'
    },
    
    '.card-media': {
      transform: 'scale(1.05)'
    }
  },
  
  '.image-container': {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: '16/9',
    flex: 1,
    backgroundColor: theme.palette.background.default
  },
  
  '.card-media': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease'
  },
  
  '.hover-overlay': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'all 0.3s ease',
    background: 'rgba(0, 0, 0, 0.3)'
  }
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  backgroundColor: 'transparent',
  
  '.title-text': {
    fontWeight: 700,
    color: theme.palette.common.white,
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    lineHeight: 1.3,
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    wordBreak: 'break-word',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    fontSize: '1.25rem'
  },
  
  '.gradient-overlay': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: `linear-gradient(to top, ${theme.palette.primary.dark} 20%, transparent)`,
    pointerEvents: 'none',
    opacity: 0.8
  }
}));

const iconStyle = {
  color: 'white', 
  fontSize: '2rem',
  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
};

PublicidadCard.propTypes = {
  imagen: PropTypes.string,
  titulo: PropTypes.string,
  enlace: PropTypes.string
};

export default PublicidadCard;