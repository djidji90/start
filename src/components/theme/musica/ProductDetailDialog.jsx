import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Typography, Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import axios from 'axios';

const ProductDetailDialog = ({ open, onClose, product, onAddToCart, quantity, setQuantity }) => {
  const [availableStock, setAvailableStock] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [review, setReview] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (product) {
      // Obtener el stock disponible para el producto
      setAvailableStock(product.stock);
    }
  }, [product]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value <= availableStock) {
      setQuantity(value);
      setErrorMessage('');
    } else {
      setErrorMessage('La cantidad seleccionada excede el stock disponible.');
    }
  };

  const handleAddReview = () => {
    if (review.trim()) {
      // Llamar a la API para agregar reseña (esto depende de la implementación de la API)
      axios.post(`/api/products/${product.id}/reviews/`, { review })
        .then(response => {
          setSnackbarMessage('Reseña añadida correctamente.');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
          setReview('');
        })
        .catch(error => {
          setSnackbarMessage('Error al añadir la reseña.');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        });
    } else {
      setSnackbarMessage('La reseña no puede estar vacía.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{product.name}</DialogTitle>
      <DialogContent>
        <img src={product.image} alt={product.name} width="100%" />
        <Typography variant="body1" color="textSecondary">{product.description}</Typography>
        <Typography variant="h6" color="primary">${product.discounted_price}</Typography>
        <Typography variant="body2" color="textSecondary">Stock disponible: {availableStock}</Typography>
        <TextField
          type="number"
          label="Cantidad"
          value={quantity}
          onChange={handleQuantityChange}
          fullWidth
          margin="normal"
          error={Boolean(errorMessage)}
          helperText={errorMessage}
        />
        {/* Reseñas */}
        <TextField
          label="Agregar reseña"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <Button
          onClick={handleAddReview}
          color="secondary"
          variant="outlined"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Añadir Reseña
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cerrar
        </Button>
        <Button
          onClick={() => { onAddToCart(product); onClose(); }}
          color="primary"
          disabled={errorMessage}
        >
          Añadir al Carrito
        </Button>
      </DialogActions>

      {/* Snackbar para mostrar mensajes de estado */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ProductDetailDialog;

