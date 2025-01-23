// Componentes/CategoriaCard.jsx

import React from 'react';
import { Card, CardContent, Typography, CardActionArea } from '@mui/material';

const CategoriaCard = ({ categoria }) => {
  return (
    <Card>
      <CardActionArea>
        <CardContent>
          <Typography variant="h6">{categoria.nombre}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoriaCard;
