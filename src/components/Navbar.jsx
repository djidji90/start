import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  styled
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import djidji from "../assets/imagenes/djidji.png";


const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { label: "Inicio", path: "/" },
    { label: "Nosotros", path: "/AboutUs" },
    { label: "Regístrate", path: "/SingInPage" },
    { label: "Tienda", path: "/Todo" },
    { label: "Búsqueda", path: "/MainPage" },
    { label: "Descubre", path: "/" },
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        {/* Logo y título */}
        <TitleContainer>
          <Logo
            src={djidji}
            alt="Logo"
            onClick={() => navigate("/")}
          />
          <Title variant="h6" onClick={() => navigate("/")}>
            Djidji
          </Title>
        </TitleContainer>

        {/* Menú desplegable móvil */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuClick}
          sx={{ display: { xs: 'block', md: 'none' } }}
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
            <MenuItem
              key={item.label}
              onClick={() => {
                navigate(item.path);
                handleMenuClose();
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Links de navegación desktop */}
        <NavButtonsContainer>
          {menuItems.map((item) => (
            <NavButton
              key={item.label}
              color="inherit"
              component={Link}
              to={item.path}
            >
              {item.label}
            </NavButton>
          ))}
        </NavButtonsContainer>
      </Toolbar>
    </StyledAppBar>
  );
};

// Estilos usando styled API
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  color: theme.palette.text.primary,
  backdropFilter: "blur(10px)",
}));

const TitleContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  flexGrow: 1
});

const Logo = styled('img')(({ theme }) => ({
  width: 50,
  height: "auto",
  marginRight: theme.spacing(2),
  cursor: "pointer",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  flexGrow: 0,
  fontWeight: 700,
  letterSpacing: 1.5,
  cursor: "pointer",
  color: theme.palette.primary.main,
}));

const NavButtonsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  gap: theme.spacing(3),
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "1rem",
  textTransform: "capitalize",
  padding: theme.spacing(1, 2),
  transition: "all 0.3s ease",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: "transparent",
  },
}));

export default Navbar;