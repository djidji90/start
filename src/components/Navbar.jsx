import React, { useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  styled,
  CssBaseline,
  useMediaQuery,
  Switch,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import djidji from "../assets/imagenes/djidji.png";

const Navbar = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const menuItems = [
    { label: "Inicio", path: "/" },
    { label: "Nosotros", path: "/AboutUs" },
    { label: "Regístrate", path: "/SingInPage" },
    { label: "Tienda", path: "/Todo" },
    { label: "Búsqueda", path: "/MainPage" },
    { label: "Descubre", path: "/TechStyleHub" },
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledAppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo y título */}
          <TitleContainer>
            <Logo src={djidji} alt="Logo" onClick={() => navigate("/")} />
            <Title variant="h6" onClick={() => navigate("/")}>
              Djidji 
            </Title>
          </TitleContainer>

          {/* Botón modo oscuro */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              color="default"
            />

            {/* Menú desplegable móvil */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
              sx={{ display: { xs: "block", md: "none" } }}
              aria-controls="nav-menu"
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Menu
            id="nav-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "menu-button",
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
    </ThemeProvider>
  );
};

// Estilos
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.95)"
      : "rgba(30, 30, 30, 0.95)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  color: theme.palette.text.primary,
  backdropFilter: "blur(10px)",
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  minWidth: 0,
}));

const Logo = styled("img")(({ theme }) => ({
  width: 40,
  height: "auto",
  marginRight: theme.spacing(1),
  cursor: "pointer",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  flexGrow: 0,
  fontWeight: 700,
  letterSpacing: 1.2,
  cursor: "pointer",
  color: theme.palette.primary.main,
  fontSize: "1.2rem",
}));

const NavButtonsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "0.95rem",
  textTransform: "capitalize",
  padding: theme.spacing(1, 2),
  transition: "all 0.3s ease",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: "transparent",
  },
}));

export default Navbar;
