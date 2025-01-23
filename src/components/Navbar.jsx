import React, { useState, useContext } from "react"; 
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  InputBase,
} from "@mui/material";
import { styled } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Logout } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import pato from "../assets/imagenes/pato.jpg";
import { AuthContext } from "./hook/UseAut"; // Asegúrate de que la ruta sea correcta

const Navbar = () => {
  const classes = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, userName, logout } = useContext(AuthContext); // Usamos el contexto aquí

  const menuItems = [
    { label: "Inicio", path: "/" },
    { label: "Nosotros", path: "/AboutUs" },
    { label: "Regístrate", path: "/SingInPage" },
    { label: "Tienda", path: "/Todo" },
    { label: "Búsqueda", path: "/MainPage" },
    { label: "descubre", path: "/" },
    { label: "Perfil", path: "/ProfilePage "},
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/menuItems?query=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout(); // Llamada al logout desde el contexto
    navigate("/");
  };

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar>
        {/* Logo */}
        <img
          src={pato}
          alt="Logo"
          className={classes.logo}
          onClick={() => navigate("/")}
        />

        {/* Título */}
        <Typography
          variant="h6"
          className={classes.title}
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
          className={classes.menuButton}
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
          {menuItems.map((item) => {
            if (item.protected && !isAuthenticated) return null;
            return (
              <MenuItem key={item.label} onClick={() => navigate(item.path)}>
                {item.label}
              </MenuItem>
            );
          })}
        </Menu>

        {/* Links (pantallas grandes) */}
        <Box className={classes.linksContainer}>
          {menuItems.map((item) => {
            if (item.protected && !isAuthenticated) return null;
            return (
              <Link to={item.path} key={item.label} className={classes.link}>
                {item.label}
              </Link>
            );
          })}
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
            className={classes.searchButton}
          >
            Buscar
          </Button>
        </SearchBox>

        {/* Iconos adicionales */}
        <Box className={classes.iconsContainer}>
          <IconButton color="inherit" title="Notificaciones" aria-label="notificaciones">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" title="Cuenta" aria-label="cuenta">
            <AccountCircleIcon />
          </IconButton>

          {/* Autenticación */}
          {isAuthenticated ? (
            <Box className={classes.authContainer}>
              <Typography>{`Hola, ${userName}`}</Typography>
              <Button onClick={handleLogout} color="inherit">
                <Logout /> Cerrar sesión
              </Button>
            </Box>
          ) : (
            <Link to="/" className={classes.link}>Iniciar sesión</Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Estilos personalizados
const useStyles = makeStyles(() => ({
  appBar: {
    background: "linear-gradient(5px, 15px, orange)",
    boxShadow: "10px 5px 40px rgba(0, 0, 0, 0.3)",
  },
  logo: {
    width: 50,
    height: "auto",
    marginRight: 20,
    cursor: "pointer",
  },
  title: {
    flexGrow: 1,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 2,
    cursor: "pointer",
  },
  menuButton: {
    display: "block",
    "@media (min-width: 600px)": {
      display: "none",
    },
  },
  linksContainer: {
    display: "none",
    gap: 16,
    "@media (min-width: 600px)": {
      display: "flex",
    },
  },
  link: {
    textDecoration: "none",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1rem",
    padding: "8px 16px",
    borderRadius: 8,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: "turquoise",
    color: "#fff",
    "&:hover": { backgroundColor: "sandybrown" },
  },
  iconsContainer: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginLeft: 16,
  },
  authContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
}));

// Estilización adicional para la barra de búsqueda
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

