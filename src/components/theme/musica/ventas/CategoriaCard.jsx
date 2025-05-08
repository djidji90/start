import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfig } from '../../../hook/useConfig';
import defaultImage from '../../../../assets/imagenes/africa.jpg';

const CategoriaCard = ({ id, nombre, imagen, descripcion }) => {
  const { api } = useConfig();
  const navigate = useNavigate();

  const cleanBaseURL = api.baseURL?.replace(/\/$/, '');
  let imagePath = '';

  if (imagen?.startsWith('http')) {
    imagePath = imagen;
  } else if (imagen?.startsWith('/media')) {
    imagePath = `/api2${imagen}`;
  } else if (imagen?.startsWith('/')) {
    imagePath = `/api2${imagen}`;
  } else if (imagen) {
    imagePath = `/api2/media/categorias/${imagen}`;
  }

  const imageUrl = imagen ? `${cleanBaseURL}${imagePath}` : defaultImage;

  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 4,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': { boxShadow: 10 },
        }}
      >
        <CardActionArea onClick={() => navigate(`/categoria/${id}`)}>
          <CardMedia
            component="img"
            height="180"
            image={imageUrl}
            alt={`Imagen de ${nombre}`}
            sx={{ objectFit: 'cover', backgroundColor: 'grey.100' }}
          />
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {nombre}
            </Typography>
            {descripcion && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  height: 40,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {descripcion}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>

        {/* Botón separado para evitar anidación de <button> */}
        <CardContent sx={{ textAlign: 'center', pt: 0 }}>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 1, borderRadius: 2, textTransform: 'none' }}
            onClick={() => navigate(`/categoria/${id}`)}
          >
            Ver más
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

CategoriaCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nombre: PropTypes.string.isRequired,
  imagen: PropTypes.string,
  descripcion: PropTypes.string,
};

export default CategoriaCard;
