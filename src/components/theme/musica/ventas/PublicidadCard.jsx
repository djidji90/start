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

  return (
    <StyledCard {...props}>
      <Box className="image-container">
        <CardMedia
          component="img"
          image={imgError ? '/default-sponsor.png' : imagen}
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
            <OpenInNew sx={{ color: 'white', fontSize: 30 }} />
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

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  height: '100%',
  maxWidth: 350,
  margin: theme.spacing(1),
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: theme.shadows[4],
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
    
    '.hover-overlay': {
      opacity: 1
    }
  },
  
  '.image-container': {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: '16/9',
    flex: 1
  },
  
  '.card-media': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
    backgroundColor: theme.palette.background.default
  },
  
  '.hover-overlay': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  
  '.link-button': {
    backdropFilter: 'blur(4px)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'scale(1.1)'
    }
  }
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  
  '.title-text': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    lineHeight: 1.3,
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    wordBreak: 'break-word'
  },
  
  '.gradient-overlay': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    background: `linear-gradient(to top, ${theme.palette.background.paper} 20%, transparent)`,
    pointerEvents: 'none'
  }
}));

PublicidadCard.propTypes = {
  imagen: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  enlace: PropTypes.string.isRequired
};

export default PublicidadCard;