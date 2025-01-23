// Componentes/ProductoCard.jsx

import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from '@mui/material';

const ProductoCard = ({ producto }) => {
  return (
    <Card>
      <CardMedia
        component="img"
        height="140"
        image={producto.imagen || '/placeholder.png'} // Asegúrate de tener una imagen por defecto
        alt={producto.nombre}
      />
      <CardContent>
        <Typography variant="h6">{producto.nombre}</Typography>
        <Typography variant="body2" color="text.secondary">
          {producto.descripcion}
        </Typography>
        <Typography variant="body1" color="text.primary">
          ${producto.precio}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          Ver Detalles
        </Button>
        <Button size="small" color="secondary">
          Agregar al Carrito
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductoCard;
