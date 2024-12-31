import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Pagination,
} from '@mui/material';

const mockProducts = [
  { id: 1, name: 'Disco de Rock', price: 20, image: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Auriculares Pro', price: 50, image: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Camiseta de Banda', price: 25, image: 'https://via.placeholder.com/150' },
  { id: 4, name: 'Vinilo Clásico', price: 30, image: 'https://via.placeholder.com/150' },
  { id: 5, name: 'Poster de Concierto', price: 10, image: 'https://via.placeholder.com/150' },
  { id: 6, name: 'Gorra de Música', price: 15, image: 'https://via.placeholder.com/150' },
  // Añadir más productos para pruebas.
];

export default function StorePageV2() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handlePageChange = (_, page) => setCurrentPage(page);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" align="center" bgcolor={'ThreeDFace'} color='info' fontFamily={'monospace'} gutterBottom>
        🎧 compra lo que te gusta
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TextField
          label="Buscar productos"
          variant="outlined"
          onChange={handleSearch}
          sx={{ width: '50%' }}
        />
      </Box>

      <Grid container spacing={3}>
        {paginatedProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card sx={{ maxWidth: 345, mx: 'auto', boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
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
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(filteredProducts.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}
