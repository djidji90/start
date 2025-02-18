import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import foto from "../../../../assets/imagenes/pato.jpg"; // Imagen por defecto

const CategoriaCard = ({ id, nombre, imagen, descripcion }) => {
  const navigate = useNavigate();
  const defaultImage = foto; // Usa la imagen por defecto si no hay otra

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
            image={imagen || defaultImage} // Usa la imagen por defecto si no hay otra
            alt={`Imagen de ${nombre}`}
            sx={{ objectFit: 'cover', backgroundColor: 'grey.100' }}
          />
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {nombre}
            </Typography>
            {descripcion && (
              <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descripcion}
              </Typography>
            )}
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/categoria/${id}`);
              }}
            >
              Ver más
            </Button>
          </CardContent>
        </CardActionArea>
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

