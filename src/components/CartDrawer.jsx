import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
} from '@mui/material';

export default function CartDrawer({ cartItems, isOpen, toggleDrawer }) {
  return (
    <Drawer anchor="right" open={isOpen} onClose={toggleDrawer}>
      <List sx={{ width: 300, p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Tu Carrito
        </Typography>
        {cartItems.length === 0 ? (
          <Typography variant="body1">Tu carrito está vacío.</Typography>
        ) : (
          cartItems.map((item, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={item.name}
                secondary={`$${item.price}`}
              />
            </ListItem>
          ))
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={cartItems.length === 0}
        >
          Proceder al Pago
        </Button>
      </List>
    </Drawer>
  );
}
