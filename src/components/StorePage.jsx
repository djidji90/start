import React from 'react';
import { Grid, Box, Typography, TextField, MenuItem } from '@mui/material';
import ProductCard from './ProductCard';

const categories = ['Todos', 'Discos', 'Merchandising', 'Accesorios'];

const mockProducts = [
  {
    id: 1,
    name: 'Disco de Rock Clásico',
    price: 20,
    image: 'https://via.placeholder.com/150',
    category: 'Discos',
  },
  {
    id: 2,
    name: 'Camiseta de la Banda',
    price: 25,
    image: 'https://via.placeholder.com/150',
    category: 'Merchandising',
  },
  {
    id: 3,
    name: 'Auriculares de Alta Fidelidad',
    price: 50,
    image: 'https://via.placeholder.com/150',
    category: 'Accesorios',
  },
];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');

  const filteredProducts =
    selectedCategory === 'Todos'
      ? mockProducts
      : mockProducts.filter((product) => product.category === selectedCategory);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Tienda de Música 🎵
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h6">Explora nuestros productos:</Typography>
        <TextField
          select
          label="Categoría"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
