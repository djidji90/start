import { useConfig } from '../../../hook/useConfig';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Tooltip,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';

const ProductoCard = ({
  id,
  nombre,
  descripcion,
  precio,
  imagen
}) => {
  const { api } = useConfig();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCall = () => {
    if (api.tiendaNumber) {
      window.location.href = `tel:${api.tiendaNumber}`;
    } else {
      console.error('Número de teléfono no configurado');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCopyID = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imagen?.split('/').pop() || 'producto.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Construir la URL de la imagen correctamente
  const cleanBaseURL = api.baseURL?.replace(/\/$/, '');
  let imagePath = '';

  if (imagen?.startsWith('http')) {
    imagePath = imagen;
  } else if (imagen?.startsWith('/media')) {
    imagePath = `/api2${imagen}`;
  } else if (imagen?.startsWith('/')) {
    imagePath = `/api2${imagen}`;
  } else {
    imagePath = `/api2/media/productos/${imagen}`;
  }

  const imageUrl = imagen?.startsWith('http') ? imagen : `${cleanBaseURL}${imagePath}`;

  return (
    <>
      <Card
        sx={{
          maxWidth: 345,
          borderRadius: 3,
          boxShadow: 4,
          transition: 'transform 0.2s, box-shadow 0.2s',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          '&:hover': { transform: 'scale(1.03)' },
          p: 2,
          overflow: 'hidden',
          position: 'relative'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            ID: {id}
          </Box>
        )}

        {!imageError && imagen ? (
          <CardMedia
            component="img"
            height="200"
            image={imageUrl}
            alt={nombre}
            onError={handleImageError}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              bgcolor: 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <InfoIcon fontSize="large" color="disabled" />
          </Box>
        )}

        <CardContent>
  <Typography variant="h6" noWrap>
    {nombre}
  </Typography>

  {/* Descripción eliminada del card */}
  {/* 
  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
    {descripcion || 'Sin descripción disponible'}
  </Typography> 
  */}

  <Typography variant="h5" color="success.main" sx={{ mb: 2 }}>
    {Number(precio).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'CFA'
    })}
  </Typography>

  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: 1
  }}>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title={copied ? '¡Copiado!' : 'Copiar ID'} arrow>
        <IconButton onClick={handleCopyID} color={copied ? 'success' : 'primary'}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Ver detalles" arrow>
        <IconButton 
          onClick={() => setShowDetails(true)} 
          color="primary"
        >
          <InfoIcon />
        </IconButton>
      </Tooltip>
    </Box>
    
    <Tooltip title={`Llamar a ${api.tiendaNumber}`} arrow>
      <Button
        variant="outlined"
        startIcon={<PhoneIcon />}
        onClick={handleCall}
        sx={{ textTransform: 'none' }}
      >
        {isMobile ? 'Llamar' : 'Contacto'}
      </Button>
    </Tooltip>
  </Box>
</CardContent>

      </Card>

      {/* Modal de detalles */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{nombre}</DialogTitle>
        <DialogContent>
          <img
            src={imageUrl}
            alt={nombre}
            style={{ 
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              marginBottom: '16px'
            }}
          />
          <DialogContentText>
            {descripcion || 'Sin descripción disponible'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Cerrar</Button>
          <Button 
            onClick={handleDownloadImage}
            color="primary"
            variant="contained"
          >
            Descargar imagen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ProductoCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nombre: PropTypes.string.isRequired,
  descripcion: PropTypes.string,
  precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  imagen: PropTypes.string
};

export default ProductoCard;