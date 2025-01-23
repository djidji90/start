import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Typography, Grid, Box, Snackbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../redux/actions"; // Acción de Redux para el carrito
import ProductDetailDialog from "./ProductDetailDialog"; // Componente de detalles de producto
import Alert from "@mui/material/Alert";

const Store = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [cart, setCartData] = useState([]);
  const [productDetail, setProductDetail] = useState(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const user = useSelector((state) => state.user); // Estado del usuario en Redux
  const dispatch = useDispatch();

  useEffect(() => {
    // Obtener productos destacados
    axios
      .get("/api/products/featured")
      .then((response) => {
        setFeaturedProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching featured products:", error);
      });

    // Obtener carrito del usuario
    if (user) {
      axios
        .get(`/api/carts/${user.id}/`)
        .then((response) => {
          setCartData(response.data.items);
          calculateCartTotals(response.data.items);
        })
        .catch((error) => {
          console.error("Error fetching cart:", error);
        });
    }
  }, [user]);

  const calculateCartTotals = (items) => {
    let total = 0;
    let count = 0;
    items.forEach((item) => {
      total += item.product.discounted_price * item.quantity;
      count += item.quantity;
    });
    setCartTotal(total);
    setCartItemCount(count);
  };

  const handleAddToCart = (product) => {
    if (user) {
      axios
        .post(`/api/carts/${cart.id}/add-item/`, {
          product_id: product.id,
          quantity,
        })
        .then((response) => {
          dispatch(setCart(response.data)); // Actualiza el carrito en Redux
          setCartData(response.data.items);
          calculateCartTotals(response.data.items);
          setSnackbarMessage("Producto añadido al carrito");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
          setSnackbarMessage("Error al añadir al carrito");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
        });
    } else {
      setSnackbarMessage(
        "Necesitas iniciar sesión para añadir productos al carrito"
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleViewProductDetail = (product) => {
    setProductDetail(product);
    setOpenProductDialog(true);
  };

  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
  };

  const handleCompleteOrder = () => {
    if (cartItemCount > 0) {
      axios
        .post(`/api/orders/${cart.id}/complete`)
        .then((response) => {
          setSnackbarMessage("Pedido completado con éxito");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
        })
        .catch((error) => {
          console.error("Error completing order:", error);
          setSnackbarMessage("Error al completar el pedido");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
        });
    } else {
      setSnackbarMessage("Tu carrito está vacío");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tienda de Música
      </Typography>

      {/* Mostrar productos destacados */}
      <Typography variant="h6" gutterBottom>
        Productos Destacados
      </Typography>
      <Grid container spacing={3}>
        {featuredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ padding: 2, cursor: "pointer" }}>
              <img src={product.image} alt={product.name} width="100%" />
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body2">{product.description}</Typography>
              <Typography variant="body1" color="primary">
                ${product.discounted_price}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleAddToCart(product)}
              >
                Añadir al Carrito
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => handleViewProductDetail(product)}
              >
                Ver Detalles
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ver detalles del producto */}
      {productDetail && (
        <ProductDetailDialog
          open={openProductDialog}
          onClose={handleCloseProductDialog}
          product={productDetail}
          onAddToCart={handleAddToCart}
          quantity={quantity}
          setQuantity={setQuantity}
        />
      )}

      {/* Mostrar carrito y total */}
      {cartItemCount > 0 && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6">
            Carrito ({cartItemCount} artículos)
          </Typography>
          <Typography variant="body1">
            Total: ${cartTotal.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleCompleteOrder}
          >
            Completar Pedido
          </Button>
        </Box>
      )}

      {/* Snackbar para mensajes de estado */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Store;
