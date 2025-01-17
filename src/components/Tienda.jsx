import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  CircularProgress,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

// URL de tu API
const API_URL = "https://mock-api.com/products"; // Cambia esto por la URL real

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#1a1a1a",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
}));

const StyledSearchBox = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  borderRadius: theme.shape.borderRadius,
  padding: "4px 8px",
  width: "100%",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  marginLeft: theme.spacing(1),
  flex: 1,
}));

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch de productos desde la API
  const fetchProducts = async (query = "") => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}?q=${query}`);
      setProducts(response.data);
      setError("");
    } catch (err) {
      setError("Error al cargar los productos. Intenta nuevamente.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Maneja la búsqueda de productos
  const handleSearch = () => {
    fetchProducts(searchQuery);
  };

  useEffect(() => {
    fetchProducts(); // Cargar productos al inicio
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Navbar */}
      <StyledAppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎶 Djidji Store
          </Typography>
          <StyledSearchBox>
            <SearchIcon />
            <StyledInputBase
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{ ml: 1 }}
            >
              Buscar
            </Button>
          </StyledSearchBox>
        </Toolbar>
      </StyledAppBar>
      {/* Contenido Principal */}
      <Box sx={{ padding: 4 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 4,
            color: "#333",
          }}
        >
          Explora Nuestros Productos Destacados
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="body1" color="error" align="center">
            {error}
          </Typography>
        ) : products.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
          >
            No se encontraron productos.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card
                  sx={{
                    boxShadow: 3,
                    "&:hover": { boxShadow: 6 },
                    borderRadius: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image || "/placeholder.png"}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {product.description}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="primary"
                      sx={{ mt: 1 }}
                    >
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => alert("Añadir al carrito: " + product.name)}
                    >
                      Añadir al Carrito
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
