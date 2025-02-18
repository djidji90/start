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
  IconButton
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';

const ProductoCard = ({
  id,
  nombre,
  descripcion,
  precio,
  imagen,
  telefonoTienda = import.meta.env.VITE_TIENDA_PHONE
}) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCall = () => {
    if (telefonoTienda) {
      window.location.href = `tel:${telefonoTienda}`;
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

  // Verificar que la URL de la imagen sea válida
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"; // Usa una variable de entorno en producción

  const imageUrl = imagen?.startsWith("http")
    ? imagen
    : `${BASE_URL}/ventas${imagen.startsWith("/") ? imagen : `/media/images/${imagen}`}`;
  

  return (
    <Card
      sx={{
        maxWidth: 345,
        borderRadius: 3,
        boxShadow: 4,
        transition: 'transform 0.2s, box-shadow 0.2s',
        backdropFilter: 'blur(10px)', // Glassmorphism effect
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {descripcion || 'Sin descripción disponible'}
        </Typography>
        <Typography variant="h5" color="success.main" sx={{ mb: 2 }}>
          {Number(precio).toLocaleString('es-ES', {
            style: 'currency',
            currency: 'CFA'
          })}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip title={copied ? '¡Copiado!' : 'Copiar ID'} arrow>
            <IconButton onClick={handleCopyID} color={copied ? 'success' : 'primary'}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={`Llamar a ${telefonoTienda}`} arrow>
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
  );
};

ProductoCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nombre: PropTypes.string.isRequired,
  descripcion: PropTypes.string,
  precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  imagen: PropTypes.string,
  telefonoTienda: PropTypes.string
};

export default ProductoCard;

