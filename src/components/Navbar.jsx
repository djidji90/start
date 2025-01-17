import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Logout } from "@mui/icons-material";
import pato from "../assets/imagenes/pato.jpg";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const menuItems = [
    { label: "Inicio", path: "/" },
    { label: "Nosotros", path: "/AboutUs" },
    { label: "Regístrate", path: "/SingInPage" },
    { label: "Descubre", path: "/HomePage" },
    { label: "Búsqueda", path: "/songs" },
    { label: "Tienda", path: "/" },
    { label: "Perfil", path: "/profile" },
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/songs?query=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(5px, 15px, orange)",
        boxShadow: "10px 5px 40px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Toolbar>
        {/* Logo */}
        <img
          src={pato}
          alt="Logo"
          style={{ width: 50, height: "auto", marginRight: "20px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        />

        {/* Título */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            color: "white",
            textTransform: "uppercase",
            letterSpacing: "2px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          Djidji
        </Typography>

        {/* Menú desplegable (solo en pantallas pequeñas) */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuClick}
          sx={{ display: { xs: "block", sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {menuItems.map((item) => (
            <MenuItem key={item.label} onClick={() => navigate(item.path)}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Links (pantallas grandes) */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 3 }}>
          {menuItems.map((item) => (
            <Link to={item.path} key={item.label} style={linkStyle}>
              {item.label}
            </Link>
          ))}
        </Box>

        {/* Barra de búsqueda */}
        <SearchBox>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="¿Qué estás buscando?"
            inputProps={{ "aria-label": "search" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              ml: 1,
              backgroundColor: "turquoise",
              color: "#fff",
              "&:hover": { backgroundColor: "sandybrown" },
            }}
          >
            Buscar
          </Button>
        </SearchBox>

        {/* Iconos adicionales */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
          <IconButton color="inherit" title="Notificaciones">
            <NotificationsIcon sx={{ color: "orange" }} />
          </IconButton>
          <IconButton color="inherit" title="Cuenta">
            <AccountCircleIcon sx={{ color: "#FF4500" }} />
          </IconButton>

          {/* Autenticación: Cerrar sesión o Iniciar sesión */}
          {isAuthenticated ? (
            <Button onClick={handleLogout} color="inherit">
              <Logout /> Cerrar sesión
            </Button>
          ) : (
            <Link to="/login" style={linkStyle}>Iniciar sesión</Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Estilo de los enlaces
const linkStyle = {
  textDecoration: "none",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "1rem",
  padding: "8px 16px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
};

// Estilización de Material-UI
const SearchBox = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.15)",
  borderRadius: theme.shape.borderRadius,
  padding: "4px 8px",
  width: "40%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
}));

export default Navbar;
