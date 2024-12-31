import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
} from '@mui/material';

export default function ProductCard({ product }) {
  return (
    <Card sx={{ maxWidth: 345, mx: 'auto', boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Categoría: {product.category}
        </Typography>
        <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
          ${product.price}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" variant="contained" color="primary">
          Agregar al Carrito
        </Button>
        <Button size="small" variant="outlined" color="secondary">
          Ver Detalles
        </Button>
      </CardActions>
    </Card>
  );
}
